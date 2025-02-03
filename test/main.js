const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to execute a shell command
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(stderr);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

// Function to prompt the user for a URL and run the scripts
const runScripts = async () => {
  // Prompt the user to input the URL
  rl.question('Please enter the URL for accessibility check: ', async (url) => {
    if (!url) {
      console.log('You must provide a URL to continue.');
      rl.close();  // Close the readline interface
      return;
    }

    try {
     
      await executeCommand(`node src/accessibility.js ${url}`);
      console.log('Accessibility check completed.');

      console.log('AI is generating Report...');
      await executeCommand('node src/aiReport.js');
      console.log('AI report generated.');

      rl.close();
    } catch (error) {
      console.error('Error executing scripts:', error);
      rl.close();  // Close the readline interface if there's an error
    }
  });
};

// Export all functions and objects
module.exports = {
  rl,
  executeCommand,
  runScripts,
};
