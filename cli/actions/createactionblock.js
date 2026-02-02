const chalk = require('chalk');
const spawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const yaml = require('js-yaml');

function createProject(projectName, installPath, answers, parsedYaml) {
    const projectDir = path.resolve(installPath);
    fs.mkdirSync(projectDir, { recursive: true });

    // Copy the actionblock template to the project directory
    const templateDir = path.resolve(__dirname, '..', 'template');
    const templatePath = path.join(templateDir, 'actionblock');
    fs.cpSync(templatePath, projectDir, { recursive: true });

    // Rename gitignore to .gitignore
    fs.renameSync(
        path.join(projectDir, 'gitignore'),
        path.join(projectDir, '.gitignore')
    );

    // Update actionblock.yml
    const actionblockYamlPath = path.join(projectDir, 'actionblock.yml');
    let actionblockYaml = fs.readFileSync(actionblockYamlPath, 'utf8');
    let actionblockYamlObj = yaml.load(actionblockYaml);

    actionblockYamlObj.name = answers.unique_id;
    actionblockYamlObj.description = answers.description;
    actionblockYamlObj.version = answers.version || '1.0.0';
    actionblockYamlObj.metadata.author = answers.author || 'Codebolt Developer';
    actionblockYamlObj.metadata.tags = answers.tags ? answers.tags.split(',').map(tag => tag.trim()) : ['actionblock', 'codebolt'];

    // Update inputs if provided
    if (answers.inputs && answers.inputs.length > 0) {
        actionblockYamlObj.metadata.inputs = answers.inputs;
    }

    // Update outputs if provided
    if (answers.outputs && answers.outputs.length > 0) {
        actionblockYamlObj.metadata.outputs = answers.outputs;
    }

    actionblockYaml = yaml.dump(actionblockYamlObj);
    fs.writeFileSync(actionblockYamlPath, actionblockYaml, 'utf8');

    // Update package.json
    const projectPackageJson = require(path.join(projectDir, 'package.json'));
    projectPackageJson.name = projectName;
    projectPackageJson.description = answers.description;

    fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify(projectPackageJson, null, 2)
    );

    // Run npm install
    spawn.sync('npm', ['install'], { stdio: 'inherit', cwd: installPath });

    console.log(chalk.green('\nSuccess! Your new ActionBlock is ready.'));
    console.log(chalk.blue(`Created ${projectName} at ${projectDir}`));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white('  1. cd ' + projectDir));
    console.log(chalk.white('  2. Edit src/index.ts to implement your ActionBlock logic'));
    console.log(chalk.white('  3. Run npm run build to build the ActionBlock'));
}

async function getBasicAnswers(projectName, quickEnabled) {
    const prompts = [];
    let answers = {};

    const currentPath = process.cwd();

    if (!quickEnabled) {
        prompts.push({
            type: 'input',
            name: 'projectName',
            message: 'Please enter the name of your ActionBlock:',
            default: projectName,
        });

        prompts.push({
            type: 'input',
            name: 'unique_id',
            message: 'Please enter the unique_id (no spaces):',
            default: (ans) => (ans.projectName || projectName || 'my-action-block').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-'),
            validate: function (input) {
                if (/\s/.test(input)) {
                    return 'unique_id should not contain any spaces';
                }
                return true;
            }
        });

        prompts.push({
            type: 'input',
            name: 'installPath',
            message: 'Please enter the path to install the ActionBlock:',
            default: (ans) => path.join(currentPath, ans.projectName || projectName || 'my-action-block'),
        });

        prompts.push({
            type: 'input',
            name: 'description',
            message: 'Please enter a description for your ActionBlock:',
            default: 'A reusable ActionBlock for Codebolt agents',
        });

        prompts.push({
            type: 'input',
            name: 'tags',
            message: 'Please enter tags (comma separated):',
            default: 'actionblock,codebolt',
        });

        prompts.push({
            type: 'input',
            name: 'author',
            message: 'Please enter the author name:',
            default: 'Codebolt Developer',
        });

        prompts.push({
            type: 'input',
            name: 'version',
            message: 'Please enter the version:',
            default: '1.0.0',
        });

        answers = await inquirer.prompt(prompts);
    } else {
        answers.projectName = projectName || 'my-action-block';
        answers.unique_id = (projectName || 'my-action-block').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-');
        if (fs.existsSync(path.join(currentPath, '.codeboltAgents'))) {
            answers.installPath = path.join(currentPath, '.codeboltAgents', 'actionblocks', answers.projectName);
        } else {
            answers.installPath = path.join(currentPath, answers.projectName);
        }
        answers.description = 'A reusable ActionBlock for Codebolt agents';
        answers.tags = 'actionblock,codebolt';
        answers.author = 'Codebolt Developer';
        answers.version = '1.0.0';
    }

    return answers;
}

const createactionblock = async (options) => {
    console.log(chalk.blue(
        "  _____           _      _           _ _    \n" +
        " /  __ \\         | |    | |         | | |   \n" +
        " | /  \\/ ___   __| | ___| |__   ___ | | |_  \n" +
        " | |    / _ \\ / _` |/ _ \\ '_ \\ / _ \\| | __| \n" +
        " | \\__/\\ (_) | (_| |  __/ |_) | (_) | | |_  \n" +
        "  \\____/\\___/ \\__,_|\\___|_.__/ \\___/|_|\\__| \n"));

    console.log(chalk.yellow('ActionBlock Creator\n'));

    let projectName = options.name || process.argv[3];
    const quickEnabled = options.quick || false;

    // Load the template yaml for defaults
    const actionblockYmlPath = path.join(__dirname, '..', 'template/actionblock', 'actionblock.yml');
    let actionblockYamlData = fs.readFileSync(actionblockYmlPath, 'utf8');
    const parsedYaml = yaml.load(actionblockYamlData);

    const answers = await getBasicAnswers(projectName, quickEnabled);
    projectName = answers.projectName.trim();
    const installPath = answers.installPath.trim() === '.' ? process.cwd() : path.resolve(process.cwd(), answers.installPath.trim());

    createProject(projectName, installPath, answers, parsedYaml);
};

module.exports = { createactionblock };
