const { chromium } = require('playwright');  
const axeCore = require('axe-core'); 
const fs = require('fs');


const args = process.argv.slice(2);  // Extract command-line arguments after the script name
const url = args[args.length - 1];  // The URL is the last argument passed

async function injectAxeCore(page) {
  const axeSource = axeCore.source;
  await page.addScriptTag({ content: axeSource });  
}

async function runAccessibilityCheck(page, context="body",options={}) {
  const results = await page.evaluate(() => {
    return window.axe.run();
  });

  return results; 
}

function saveResultsToFile(results) {
  fs.writeFileSync('./detailedReport.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('Accessibility results have been saved to "detailedReport.json"');
}

async function runTest() {
  const browser = await chromium.launch();  
  const page = await browser.newPage(); 
  
  await page.goto(url);  

  await injectAxeCore(page);  
  const results = await runAccessibilityCheck(page,"body",{
    rules: {
      'color-contrast': { enabled: true },
      'image-alt': { enabled: true },
      'region': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'heading-order': { enabled: true }
    },
    tags: ['wcag2aa'],
    include: ['.content'],
    exclude: ['.header', '.footer', 'iframe']
  });  
  saveResultsToFile(results);  
  
  await browser.close();  
}


runTest().catch((error) => {
  console.error('Error running the accessibility test:', error);
});
