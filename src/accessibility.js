const { chromium } = require('playwright');
const axeCore = require('axe-core');
const fs = require('fs');

// Function to inject Axe Core into the page
async function injectAxeCore(page) {
  const axeSource = axeCore.source;
  await page.addScriptTag({ content: axeSource });
}

// Function to run the accessibility check
async function runAccessibilityCheck(page, context = 'body', options = {}) {
  const results = await page.evaluate(() => {
    return window.axe.run();
  });
  return results;
}

// Function to save results to a file
function saveResultsToFile(results, filePath = './detailedReport.json') {
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`✅Accessibility results have been saved to "${filePath}"`);
}

// Main function to run the accessibility test
async function runAccessibilityTest(url, options = {}, resultFilePath = './detailedReport.json') {
  if (!url) {
    throw new Error('A URL must be provided to run the accessibility test.');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url);

    await injectAxeCore(page);
    console.log('Running accessibility check...');
    const results = await runAccessibilityCheck(page, 'body', options);

    saveResultsToFile(results, resultFilePath);
    console.log('Accessibility test completed.');
  } catch (error) {
    console.error('Error during the accessibility test:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { runAccessibilityTest };
