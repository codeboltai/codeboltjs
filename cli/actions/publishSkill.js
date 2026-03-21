const chalk = require('chalk');
const fs = require('fs');
const archiver = require('archiver');
const { createWriteStream } = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const inquirer = require('inquirer');
const { checkUserAuth, getUserData } = require('./userData');

const API_BASE = 'https://api.codebolt.ai';

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

const uploadFile = async (filePath, fileType, authToken) => {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('filetype', fileType);

    try {
        const response = await axios.post(
            `${API_BASE}/api/upload/single`,
            formData,
            { headers: formData.getHeaders() }
        );
        return response.data;
    } catch (err) {
        throw new Error(`Failed to upload ${fileType}: ${err.message}`);
    }
};

// Parse YAML frontmatter from SKILL.md
const parseSkillFrontmatter = (content) => {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;

    const frontmatter = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        if (key && value) {
            frontmatter[key] = value;
        }
    }
    return frontmatter;
};

const readSkillConfig = (folderPath) => {
    const skillMdPath = path.join(folderPath, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
        throw new Error('SKILL.md not found. Please run this command in a skill directory.');
    }

    const content = fs.readFileSync(skillMdPath, 'utf8');
    const frontmatter = parseSkillFrontmatter(content);

    if (!frontmatter) {
        throw new Error('SKILL.md must have YAML frontmatter (--- delimited) with name and description.');
    }

    if (!frontmatter.name) throw new Error('name is required in SKILL.md frontmatter');
    if (!frontmatter.description) throw new Error('description is required in SKILL.md frontmatter');

    // Use the folder name as uniqueName if not specified
    const folderName = path.basename(path.resolve(folderPath));
    frontmatter.uniqueName = frontmatter.uniqueName || folderName;

    // Return full SKILL.md content as the skill body
    frontmatter.skillContent = content;

    return frontmatter;
};

const checkSkillExists = async (skillId, authToken) => {
    try {
        const response = await axios.get(
            `${API_BASE}/api/skills/detailbyuid?unique_id=${skillId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return null;
        }
        console.error(chalk.yellow(`  Status: ${err.response?.status}`));
        console.error(chalk.yellow(`  Response: ${JSON.stringify(err.response?.data)}`));
        throw new Error(`Failed to check skill existence: ${err.message}`);
    }
};

const createOrUpdateSkill = async (skillData, authToken) => {
    try {
        console.log(chalk.blue('Submitting skill data to API...'));
        console.log(chalk.gray(`  Endpoint: ${API_BASE}/api/skills/add`));
        console.log(chalk.gray(`  unique_id: ${skillData.unique_id}`));
        console.log(chalk.gray(`  name: ${skillData.name}`));
        console.log(chalk.gray(`  version: ${skillData.version}`));

        const response = await axios.post(
            `${API_BASE}/api/skills/add`,
            skillData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'x-codebolt-userId': getUserData().userId
                }
            }
        );
        console.log(chalk.green(`  API Response: ${response.status} - ${JSON.stringify(response.data)}`));
        return response.data;
    } catch (err) {
        console.error(chalk.red(`  API Error Status: ${err.response?.status}`));
        console.error(chalk.red(`  API Error Response: ${JSON.stringify(err.response?.data)}`));
        throw new Error(`${err.response?.data?.error || err.response?.data?.message || err.message}`);
    }
};

const publishSkill = async (targetPath) => {
    let authToken;
    let username;

    if (!checkUserAuth()) {
        console.log(chalk.red('User not authenticated. Please login first.'));
        return;
    }

    try {
        const data = getUserData();
        authToken = data.jwtToken;

        try {
            const getUsernameResponse = await axios.get(
                `${API_BASE}/api/auth/check-username`,
                { headers: { 'Authorization': `Bearer ${authToken}` } }
            );
            username = getUsernameResponse.data.usersData[0].username;
        } catch (err) {
            throw new Error(`Failed to get username: ${err.message}`);
        }

        console.log(chalk.blue('Processing the Skill....'));

        const folderPath = targetPath || '.';
        const folder = path.resolve(folderPath);

        const skillConfig = readSkillConfig(folder);
        console.log(chalk.green(`Found skill: ${skillConfig.name}`));

        // Check if skill already exists
        let isUpdate = false;

        try {
            const existingSkill = await checkSkillExists(skillConfig.uniqueName, authToken);

            if (existingSkill && existingSkill.data) {
                if (existingSkill.data.lastUpdatedUI) {
                    console.log(chalk.yellow('This skill has been updated from the UI.'));
                    console.log(chalk.yellow('Please pull the latest configuration before publishing.'));
                    return;
                }

                if (existingSkill.data.createByUser !== username) {
                    console.log(chalk.red('You are not authorized to update this skill.'));
                    console.log(chalk.yellow('Please update the name in your SKILL.md frontmatter to create a new skill.'));
                    return;
                }

                isUpdate = true;
            }
        } catch (err) {
            console.warn(chalk.yellow(`Warning: Could not check existing skill: ${err.message}`));
        }

        // Prompt for additional info on first publish
        let additionalInfo = {};
        if (!isUpdate) {
            additionalInfo = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'category',
                    message: 'Category for your skill (optional):',
                    default: ''
                },
                {
                    type: 'input',
                    name: 'tags',
                    message: 'Tags (comma-separated):',
                    default: ''
                }
            ]);
        }

        // Build ignore patterns
        const ignoreFiles = ['node_modules/**/*', '**/*.zip'];
        const gitignorePath = path.join(folder, '.gitignore');
        if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            ignoreFiles.push(...gitignoreContent.split('\n').filter(line => line && !line.startsWith('#')));
        }

        // Create and upload zip (includes SKILL.md, INSTRUCTIONS.md, references/, etc.)
        console.log(chalk.blue('Packaging skill...'));
        const zipPath = path.join(folder, `${skillConfig.uniqueName}.zip`);
        await createZipArchive(folder, zipPath, ignoreFiles);
        console.log(chalk.green('Skill packaging done.'));

        console.log(chalk.blue('Uploading skill...'));
        const uploadResult = await uploadFile(zipPath, 'skill', authToken);
        const sourcePublicUrl = uploadResult.publicUrl;
        console.log(chalk.green('Skill uploaded successfully.'));

        // Clean up zip
        try {
            fs.unlinkSync(zipPath);
        } catch (err) {
            console.warn(chalk.yellow(`Warning: Could not delete temp zip file: ${err.message}`));
        }

        // Prepare skill data
        const currentTimestamp = new Date().toISOString();
        const skillData = {
            unique_id: skillConfig.uniqueName,
            name: skillConfig.name,
            description: skillConfig.description,
            author: username,
            createdByUser: username,
            skillContent: skillConfig.skillContent,
            sourceCodeUrl: sourcePublicUrl,
            version: skillConfig.version || '1.0.0',
            updatedAt: currentTimestamp,
            status: true,
            ...(additionalInfo.category && { category: additionalInfo.category }),
            ...(additionalInfo.tags && { tags: additionalInfo.tags.split(',').map(t => t.trim()) })
        };

        // Submit
        try {
            await createOrUpdateSkill(skillData, authToken);

            if (isUpdate) {
                console.log(chalk.green(`\u2705 Skill "${skillConfig.name}" updated successfully!`));
            } else {
                console.log(chalk.green(`\u2705 Skill "${skillConfig.name}" published successfully!`));
            }

            console.log(chalk.blue(`\ud83d\udce6 Skill ID: ${skillConfig.uniqueName}`));
            console.log(chalk.blue(`\ud83d\udcdd Description: ${skillConfig.description}`));
        } catch (err) {
            throw new Error(`Failed to ${isUpdate ? 'update' : 'publish'} skill: ${err.message}`);
        }

    } catch (error) {
        console.error(chalk.red('\u274c Error publishing skill:'), error.message);
        process.exit(1);
    }
};

module.exports = { publishSkill };
