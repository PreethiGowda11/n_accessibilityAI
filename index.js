// npm init

// #!/usr/bin/env node
// const fs = require('fs');
// const path = require('path');
// const gitIgnorefile = require('./gitignore.js');
// const workflowsDir = path.join(projectPath, '.github/workflows');

// function generateProjectStructure(projectName) {
//     const projectPath = path.join(process.cwd(), projectName);
  
//     if (!fs.existsSync(projectPath)) {
//       fs.mkdirSync(projectPath);
//     }

//     const srcPath = path.join(projectPath, 'src');
//     const testPath=path.join(projectPath,'test');
//     const packageJsonPath = path.join(projectPath, 'package.json');
//     const readMePath = path.join(projectPath, 'README.md');
//     const gitIgnorePath = path.join(projectPath, '.gitignore');
//     const envPath = path.join(projectPath, '.env');

//     fs.mkdirSync(srcPath);
//     fs.mkdirSync(testPath);
  
//     const axecore='axe-core';
//     const typesnode='@types/node';
//     const readlineSync='readline-sync';
//     const tsnode='ts-node'

//     const packageJson = {
//         name: projectName,
//         version: '0.0.0',
//         description: "Automated accessibility testing using Playwright and axe-core",
//         scripts: {
//         dependencyInstall: "npm install axios dotenv playwright readline-sync ts-node typescript --save-dev",
//         test: "node test/main.js"
//         },
//         dependencies: {
//          [axecore]: "^4.10.2"
//         },

//         devDependencies: {
//          [typesnode]: "^20.6.0",
//          axios: "^1.7.9",
//          dotenv: "^16.4.7",
//          playwright: "^1.50.0",
//          [readlineSync]: "^1.4.10",
//          [tsnode]: "^10.9.2",
//          typescript: "^5.7.3"
//         }
//     }
    

//     fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

   

//     const envScript = srcfile.envData;
//     fs.writeFileSync(envPath, envScript);

//     const gitIgnoreScript = gitIgnorefile.gitIgnore;
//     fs.writeFileSync(gitIgnorePath, gitIgnoreScript);


// }

// const projectName = "nilgiri_accessibility"; 

// if (!projectName) {
//   console.error('Please provide a project name.');
//   process.exit(1);
// }

// generateProjectStructure(projectName);

// console.log(`Initialized project: ${projectName}`);

// npm install
const main = require('./main');

module.exports = {
  ...main,
 
};