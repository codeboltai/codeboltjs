const chalk = require('chalk');
const fs = require('fs');
const archiver = require('archiver');
const { createWriteStream } = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const { checkUserAuth, getUserData } = require('./userData');
const { runBuild } = require('../services/buildService');

// Function to create a zip archive
const createZipArchive = async (sourcePath, outputPath, ignorePatterns = []) => {
    return new Promise((resolve, reject) => {
        const output = createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', err => reject(new Error(`Archive error: ${err.message}`)));

        output.on('close', () => resolve());

        archive.pipe(output);

        archive.glob('**/*', {
            cwd: sourcePath,
            ignore: ignorePatterns
        });

        archive.finalize();
    });
};

// Function to upload file and get URL
const uploadFile = async (filePath, fileType, authToken) => {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('filetype', fileType);

    // Compute Content-Length so Cloudflare Workers can parse the multipart body
    // (form-data otherwise sends chunked-encoded, which Workers' formData() may reject)
    const contentLength = await new Promise((resolve, reject) => {
        formData.getLength((err, length) => (err ? reject(err) : resolve(length)));
    });

    try {
        const response = await axios.post(
            'https://api.codebolt.ai/api/upload/single',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Length': contentLength,
                    'Authorization': `Bearer ${authToken}`
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );
        return response.data;
    } catch (err) {
        const serverMsg = err.response?.data
            ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data))
            : err.message;
        throw new Error(`Failed to upload ${fileType}: ${serverMsg}`);
    }
};

// Function to read and validate plugin package.json
const readPluginConfig = (folderPath) => {
    const packageJsonPath = path.join(folderPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found. Please run this command in a plugin directory.');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Validate codebolt.plugin config exists
    if (!packageJson.codebolt || !packageJson.codebolt.plugin) {
        throw new Error('package.json must contain a "codebolt.plugin" configuration block.');
    }

    // Extract plugin metadata
    const config = {
        name: packageJson.name,
        unique_id: packageJson.name, // use npm package name as unique_id
        description: packageJson.description || '',
        version: packageJson.version || '1.0.0',
        author: packageJson.author || '',
        pluginType: packageJson.codebolt.plugin.type || 'generic',
        tags: packageJson.keywords || [],
    };

    if (!config.name) throw new Error('Plugin name is required in package.json');

    return config;
};

const publishPlugin = async (targetPath) => {
    let authToken;
    let username;

    // Check if the user is logged in
    if (!checkUserAuth()) {
        console.log(chalk.red('User not authenticated. Please login first.'));
        return;
    }

    try {
        const data = getUserData();
        authToken = data.jwtToken;

        // Get current user's username
        try {
            const getUsernameResponse = await axios.get(
                'https://api.codebolt.ai/api/auth/check-username',
                { headers: { 'Authorization': `Bearer ${authToken}` } }
            );
            username = getUsernameResponse.data.usersData[0].username;
        } catch (err) {
            throw new Error(`Failed to get username: ${err.message}`);
        }

        console.log(chalk.blue('Processing the Plugin....'));

        const folderPath = targetPath || '.';
        const folder = path.resolve(folderPath);

        // Read and validate plugin configuration
        const pluginConfig = readPluginConfig(folder);

        console.log(chalk.green(`Found plugin: ${pluginConfig.name} (type: ${pluginConfig.pluginType})`));

        // Check if plugin already exists
        try {
            const pluginResponse = await axios.get(
                `https://api.codebolt.ai/api/plugins/detailbyuid?unique_id=${encodeURIComponent(pluginConfig.unique_id)}`
            );

            if (pluginResponse.data) {
                if (pluginResponse.data.createdByUser !== username) {
                    console.log(chalk.red('You are not authorized to update this plugin.'));
                    console.log(chalk.yellow('Please use a different package name to create a new plugin.'));
                    return;
                }
            }
        } catch (err) {
            // 404 = plugin doesn't exist yet, that's fine
            if (err.response && err.response.status !== 404) {
                throw new Error(`Failed to check plugin existence: ${err.message}`);
            }
        }

        // Run build
        try {
            await runBuild(folderPath);
            console.log(chalk.green('Build completed successfully.'));
        } catch (error) {
            console.log(chalk.red('Build failed:', error.message || error));
            return;
        }

        // Read .gitignore for ignore patterns
        const gitignorePath = path.join(folder, '.gitignore');
        const ignoreFiles = ['node_modules/**/*', '**/*.zip'];

        if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            ignoreFiles.push(...gitignoreContent.split('\n').filter(line => line && !line.startsWith('#')));
        }

        // Create build zip with full project (package.json, dist, etc.)
        console.log(chalk.blue('Packaging distribution build...'));
        const distZipPath = `${folder}/build.zip`;
        const distIgnoreFiles = ['node_modules/**/*', '**/*.zip', '.git/**/*'];

        await createZipArchive(folder, distZipPath, distIgnoreFiles);
        console.log(chalk.green('Distribution build packaging done.'));

        // Create source code zip
        console.log(chalk.blue('Packaging source code...'));
        const sourceZipPath = `${folder}/source.zip`;

        await createZipArchive(folder, sourceZipPath, ignoreFiles);
        console.log(chalk.green('Source code packaging done.'));

        // Upload both zip files
        console.log(chalk.blue('Uploading distribution build...'));
        const distUploadResult = await uploadFile(distZipPath, 'plugin', authToken);
        const distPublicUrl = distUploadResult.publicUrl;

        console.log(chalk.blue('Uploading source code...'));
        const sourceUploadResult = await uploadFile(sourceZipPath, 'pluginSource', authToken);
        const sourcePublicUrl = sourceUploadResult.publicUrl;

        console.log(chalk.green('Both packages uploaded successfully.'));

        // Clean up zip files
        try {
            fs.unlinkSync(distZipPath);
            fs.unlinkSync(sourceZipPath);
        } catch (err) {
            console.warn(chalk.yellow(`Warning: Could not delete temp zip files: ${err.message}`));
        }

        // Submit to API
        const pluginData = {
            name: pluginConfig.name,
            unique_id: pluginConfig.unique_id,
            description: pluginConfig.description,
            tags: Array.isArray(pluginConfig.tags) ? pluginConfig.tags.join(', ') : '',
            author: pluginConfig.author,
            version: pluginConfig.version,
            pluginType: pluginConfig.pluginType,
            zipFilePath: distPublicUrl,
            sourceCodeUrl: sourcePublicUrl,
            createdByUser: username
        };

        try {
            const pluginResponse = await axios.post(
                'https://api.codebolt.ai/api/plugins/add',
                pluginData,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            if (pluginResponse.status === 201) {
                console.log(chalk.green(pluginResponse.data.message));
            } else {
                console.log(chalk.yellow(pluginResponse.data.message));
            }

            console.log(chalk.blue(`Plugin ID: ${pluginConfig.unique_id}`));
            console.log(chalk.blue(`Version: ${pluginConfig.version}`));
            console.log(chalk.blue(`Type: ${pluginConfig.pluginType}`));

        } catch (err) {
            throw new Error(`Failed to add plugin: ${err.response?.data?.message || err.message}`);
        }

    } catch (error) {
        console.error(chalk.red('Error:'), error.message || error);
        if (error.response) {
            console.error(chalk.red('Server response:'), error.response.data);
        }
    }
};

module.exports = {
    publishPlugin
};
