const { runAccessibilityTest } = require('../src/accessibility');
const { analyzeAxeReport } = require('../src/aiReport');

/**
 * Runs an accessibility check on a given system under test.
 *
 * This function performs the following steps:
 * 1. Runs an Axe-core accessibility test on the specified URL.
 * 2. Analyzes the generated report using AI for enhanced insights.
 * 3. Outputs a detailed HTML report.
 *
 * @param {string} aiEndpoint - The AI API endpoint used for analysis.
 * @param {string} aiApiKey - The API key required for authentication.
 * @param {string} systemUnderTestUrl - The URL of the system to be tested for accessibility.
 * @throws {Error} If any of the required parameters are missing.
 * @returns {Promise<void>} Resolves when the process is complete.
 */
async function runAccessibilityCheck(aiEndpoint, aiApiKey, systemUnderTestUrl) {
  if (!aiEndpoint || !aiApiKey || !systemUnderTestUrl) {
    throw new Error('AI Endpoint, API Key, and System Under Test URL are required.');
  }

  try {
    console.log('🎯 Running Accessibility Test...');
    await runAccessibilityTest(systemUnderTestUrl);

    console.log('🛠 Generating AI Report...');
    await analyzeAxeReport("detailedReport.json","violation_report.html",aiApiKey, aiEndpoint );

    console.log('🚀 AI-Generated Analysis is completed. Report generated at "violation_report.html".');
  } catch (error) {
    console.error('Error during accessibility testing:', error.message || error);
  }
}

module.exports = { runAccessibilityCheck };