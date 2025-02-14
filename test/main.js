const { runAccessibilityTest } = require('../src/accessibility');
const { processAllViolations } = require('../src/aiReport');
const fs = require('fs');

async function runAccessibilityCheck(aiEndpoint, aiApiKey, systemUnderTestUrl) {
  if (!aiEndpoint || !aiApiKey || !systemUnderTestUrl) {
    throw new Error('AI Endpoint, API Key, and System Under Test URL are required.');
  }

  try {
    console.log('Running Accessibility Test...');
    await runAccessibilityTest(systemUnderTestUrl);

    console.log('Generating AI Report...');
    const reportData = JSON.parse(fs.readFileSync('./detailedReport.json', 'utf8'));
    await processAllViolations(reportData, aiEndpoint, aiApiKey);

    console.log('Accessibility analysis completed. Report generated at "violation_report.html".');
  } catch (error) {
    console.error('Error during accessibility testing:', error.message || error);
  }
}

module.exports = { runAccessibilityCheck };