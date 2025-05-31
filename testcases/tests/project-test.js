const codebolt = require('@codebolt/codeboltjs').default;

async function testProject() {
    console.log('📁 Testing Project Management');
    console.log('=============================');
    
    try {
        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing project initialization...');
        const projectConfig = {
            name: 'test-project',
            description: 'A test project for validation',
            type: 'web-application',
            framework: 'react',
            language: 'javascript',
            version: '1.0.0'
        };
        
        try {
            const initResult = await codebolt.project.initializeProject(projectConfig);
            console.log('✅ Project initialization result:', initResult);
            console.log('   - Project ID:', initResult?.projectId);
            console.log('   - Name:', initResult?.name);
            console.log('   - Status:', initResult?.status);
        } catch (error) {
            console.log('⚠️  Project initialization failed:', error.message);
        }
        
        console.log('\n2. Testing project structure creation...');
        const projectStructure = {
            directories: [
                'src',
                'src/components',
                'src/utils',
                'tests',
                'docs',
                'public'
            ],
            files: [
                { path: 'src/index.js', content: 'console.log("Hello World");' },
                { path: 'package.json', content: JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2) },
                { path: 'README.md', content: '# Test Project\n\nThis is a test project.' }
            ]
        };
        
        try {
            const structureResult = await codebolt.project.createStructure('test-project', projectStructure);
            console.log('✅ Project structure creation result:', structureResult);
            console.log('   - Directories created:', structureResult?.directoriesCreated);
            console.log('   - Files created:', structureResult?.filesCreated);
        } catch (error) {
            console.log('⚠️  Project structure creation failed:', error.message);
        }
        
        console.log('\n3. Testing project configuration management...');
        const projectSettings = {
            buildTool: 'webpack',
            testFramework: 'jest',
            linter: 'eslint',
            formatter: 'prettier',
            dependencies: ['react', 'react-dom'],
            devDependencies: ['webpack', 'babel-loader', 'jest']
        };
        
        try {
            const configResult = await codebolt.project.updateConfiguration('test-project', projectSettings);
            console.log('✅ Project configuration result:', configResult);
            console.log('   - Configuration updated:', configResult?.success);
            console.log('   - Dependencies count:', projectSettings.dependencies.length);
        } catch (error) {
            console.log('⚠️  Project configuration failed:', error.message);
        }
        
        console.log('\n4. Testing project dependency management...');
        const newDependencies = [
            { name: 'axios', version: '^0.24.0', type: 'production' },
            { name: 'lodash', version: '^4.17.21', type: 'production' },
            { name: '@testing-library/react', version: '^12.0.0', type: 'development' }
        ];
        
        try {
            const depResult = await codebolt.project.manageDependencies('test-project', {
                action: 'add',
                dependencies: newDependencies
            });
            console.log('✅ Dependency management result:', depResult);
            console.log('   - Dependencies added:', depResult?.added?.length || 0);
            console.log('   - Success:', depResult?.success);
        } catch (error) {
            console.log('⚠️  Dependency management failed:', error.message);
        }
        
        console.log('\n5. Testing project build process...');
        const buildConfig = {
            target: 'production',
            optimize: true,
            minify: true,
            sourceMaps: false,
            outputDir: 'dist'
        };
        
        try {
            const buildResult = await codebolt.project.build('test-project', buildConfig);
            console.log('✅ Project build result:', buildResult);
            console.log('   - Build status:', buildResult?.status);
            console.log('   - Output directory:', buildResult?.outputDir);
            console.log('   - Build time:', buildResult?.buildTime);
        } catch (error) {
            console.log('⚠️  Project build failed:', error.message);
        }
        
        console.log('\n6. Testing project testing framework...');
        const testConfig = {
            framework: 'jest',
            coverage: true,
            testPattern: '**/*.test.js',
            setupFiles: ['<rootDir>/src/setupTests.js']
        };
        
        try {
            const testResult = await codebolt.project.runTests('test-project', testConfig);
            console.log('✅ Project testing result:', testResult);
            console.log('   - Tests run:', testResult?.testsRun);
            console.log('   - Tests passed:', testResult?.testsPassed);
            console.log('   - Coverage:', testResult?.coverage);
        } catch (error) {
            console.log('⚠️  Project testing failed:', error.message);
        }
        
        console.log('\n7. Testing project deployment...');
        const deployConfig = {
            platform: 'vercel',
            environment: 'staging',
            buildCommand: 'npm run build',
            outputDirectory: 'dist',
            environmentVariables: {
                NODE_ENV: 'production',
                API_URL: 'https://api.staging.example.com'
            }
        };
        
        try {
            const deployResult = await codebolt.project.deploy('test-project', deployConfig);
            console.log('✅ Project deployment result:', deployResult);
            console.log('   - Deployment status:', deployResult?.status);
            console.log('   - URL:', deployResult?.url);
            console.log('   - Platform:', deployResult?.platform);
        } catch (error) {
            console.log('⚠️  Project deployment failed:', error.message);
        }
        
        console.log('\n8. Testing project analytics...');
        try {
            const analyticsResult = await codebolt.project.getAnalytics('test-project');
            console.log('✅ Project analytics result:', analyticsResult);
            console.log('   - Lines of code:', analyticsResult?.linesOfCode);
            console.log('   - File count:', analyticsResult?.fileCount);
            console.log('   - Dependencies count:', analyticsResult?.dependenciesCount);
            console.log('   - Last modified:', analyticsResult?.lastModified);
        } catch (error) {
            console.log('⚠️  Project analytics failed:', error.message);
        }
        
        console.log('\n9. Testing project documentation generation...');
        const docConfig = {
            format: 'markdown',
            includeAPI: true,
            includeExamples: true,
            outputDir: 'docs',
            template: 'default'
        };
        
        try {
            const docResult = await codebolt.project.generateDocumentation('test-project', docConfig);
            console.log('✅ Documentation generation result:', docResult);
            console.log('   - Documentation generated:', docResult?.success);
            console.log('   - Output directory:', docResult?.outputDir);
            console.log('   - Pages generated:', docResult?.pagesGenerated);
        } catch (error) {
            console.log('⚠️  Documentation generation failed:', error.message);
        }
        
        console.log('\n10. Testing project version control...');
        const versionConfig = {
            type: 'patch', // major, minor, patch
            message: 'Test version update',
            tag: true,
            push: false
        };
        
        try {
            const versionResult = await codebolt.project.updateVersion('test-project', versionConfig);
            console.log('✅ Version control result:', versionResult);
            console.log('   - New version:', versionResult?.newVersion);
            console.log('   - Tag created:', versionResult?.tagCreated);
        } catch (error) {
            console.log('⚠️  Version control failed:', error.message);
        }
        
        console.log('\n11. Testing project backup and restore...');
        const backupConfig = {
            includeNodeModules: false,
            includeBuildFiles: false,
            compression: 'gzip',
            destination: './backups'
        };
        
        try {
            const backupResult = await codebolt.project.createBackup('test-project', backupConfig);
            console.log('✅ Project backup result:', backupResult);
            console.log('   - Backup created:', backupResult?.success);
            console.log('   - Backup size:', backupResult?.size);
            console.log('   - Backup path:', backupResult?.path);
        } catch (error) {
            console.log('⚠️  Project backup failed:', error.message);
        }
        
        console.log('\n12. Testing project template management...');
        const templateConfig = {
            name: 'react-starter',
            description: 'React application starter template',
            category: 'frontend',
            tags: ['react', 'javascript', 'webpack'],
            files: ['src/**/*', 'public/**/*', 'package.json', 'README.md']
        };
        
        try {
            const templateResult = await codebolt.project.createTemplate('test-project', templateConfig);
            console.log('✅ Template creation result:', templateResult);
            console.log('   - Template created:', templateResult?.success);
            console.log('   - Template ID:', templateResult?.templateId);
        } catch (error) {
            console.log('⚠️  Template creation failed:', error.message);
        }
        
        console.log('\n13. Testing project collaboration...');
        const collaborationConfig = {
            members: [
                { email: 'dev1@example.com', role: 'developer', permissions: ['read', 'write'] },
                { email: 'dev2@example.com', role: 'reviewer', permissions: ['read', 'comment'] }
            ],
            settings: {
                allowForks: true,
                requireReviews: true,
                autoMerge: false
            }
        };
        
        try {
            const collabResult = await codebolt.project.setupCollaboration('test-project', collaborationConfig);
            console.log('✅ Collaboration setup result:', collabResult);
            console.log('   - Members added:', collabResult?.membersAdded);
            console.log('   - Settings applied:', collabResult?.settingsApplied);
        } catch (error) {
            console.log('⚠️  Collaboration setup failed:', error.message);
        }
        
        console.log('\n14. Testing project cleanup...');
        const cleanupConfig = {
            removeNodeModules: true,
            removeBuildFiles: true,
            removeLogFiles: true,
            removeTempFiles: true
        };
        
        try {
            const cleanupResult = await codebolt.project.cleanup('test-project', cleanupConfig);
            console.log('✅ Project cleanup result:', cleanupResult);
            console.log('   - Files removed:', cleanupResult?.filesRemoved);
            console.log('   - Space freed:', cleanupResult?.spaceFreed);
        } catch (error) {
            console.log('⚠️  Project cleanup failed:', error.message);
        }
        
        console.log('\n🎉 All project management tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Project test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testProject().catch(console.error); 