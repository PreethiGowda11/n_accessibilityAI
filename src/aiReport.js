console.log('Running test...');
const axios = require('axios');
const fs = require('fs');

async function processAllViolations(data, apiUrl, apiKey) {
  const impactLevels = { critical: 0, serious: 0, moderate: 0 };

  if (data.violations && Array.isArray(data.violations)) {
    for (let violationIndex = 0; violationIndex < data.violations.length; violationIndex++) {
      const violation = data.violations[violationIndex];
      if (violation && violation.nodes) {
        for (let nodeIndex = 0; nodeIndex < violation.nodes.length; nodeIndex++) {
          const node = violation.nodes[nodeIndex];
          calculateImpactLevels(violation, impactLevels);
          await processViolation(violation, node, apiUrl, apiKey);
        }
      }
    }
  } else {
    console.error('No violations found or data.violations is not an array.');
  }

  logImpactSummary(impactLevels);
}

function calculateImpactLevels(violation, impactLevels) {
  const impact = violation.impact;
  if (impactLevels.hasOwnProperty(impact)) {
    impactLevels[impact]++;
  }
}

function logImpactSummary(impactLevels) {
  console.log('Impact Levels:', impactLevels);
  const totalCount = Object.values(impactLevels).reduce((sum, count) => sum + count, 0);
  console.log('Violations Count by Impact:', impactLevels);
  console.log(`Total Violations (Critical, Serious, Moderate): ${totalCount}`);
}

async function processViolation(violation, node, apiUrl, apiKey) {
  const jsonData = JSON.stringify({ violationId: violation.id, node }, null, 2);
  const prompt = generatePrompt(jsonData);
  try {
    const response = await callAIService(prompt, apiUrl, apiKey);
    const aiHtmlStructure = response.data.choices[0].message.content.trim();
    appendToHtmlReport(aiHtmlStructure, violation.id);
  } catch (error) {
    console.error('Error while calling OpenAI API:', error.message || 'Unknown error');
  }
}

function generatePrompt(jsonData) {
  return `
    ${jsonData}
    Analyze the following accessibility JSON report and generate a comprehensive table in HTML format...
    (Full prompt content is preserved)
  `;
}

async function callAIService(prompt, apiUrl, apiKey) {
  return axios.post(
    apiUrl,
    { messages: [{ role: 'system', content: 'You are a senior web accessibility expert...' }, { role: 'user', content: prompt }], temperature: 0.3 },
    { headers: { 'Content-Type': 'application/json', 'api-key': apiKey } }
  );
}

function appendToHtmlReport(htmlContent, ruleId) {
  console.log('Appending AI report...');
  const reportFilePath = 'violation_report.html';

  if (!fs.existsSync(reportFilePath)) {
    fs.writeFileSync(reportFilePath, generateHtmlHeader(), 'utf8');
  }

  const formattedHtml = `
    <div class="violation">
      <h3>${ruleId} Issue</h3>
      <details><summary>View Detailed AI Report</summary><p>${htmlContent}</p></details>
    </div>
  `;
  fs.appendFileSync(reportFilePath, formattedHtml, 'utf8');
}

function generateHtmlHeader() {
  return `
    <html>
      <head>
        <title>Accessibility AI Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          h1 {
            background-color: #4CAF50;
            color: #2c3e50;
            padding: 15px;
            text-align: center;
            margin: 0;
            border-bottom: 3px solid #ddd;
          }
          .summary-grid {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
            padding: 20px;
          }
          .summary-card {
            flex: 1;
            min-width: 200px;
            max-width: 300px;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .critical { background-color: #ffe6e6; border: 1px solid #ff4d4d; }
          .serious { background-color: #fff4e6; border: 1px solid #ffa64d; }
          .moderate { background-color: #e6f7ff; border: 1px solid #66c2ff; }
        </style>
      </head>
      <body>
        <h1>Comprehensive Web Accessibility Audit Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <section class="summary-grid">
          <div class="summary-card critical">
            <h3>Critical Issues</h3>
            <p><strong>[Critical Count]</strong></p>
          </div>
          <div class="summary-card serious">
            <h3>Serious Issues</h3>
            <p><strong>[Serious Count]</strong></p>
          </div>
          <div class="summary-card moderate">
            <h3>Moderate Issues</h3>
            <p><strong>[Moderate Count]</strong></p>
          </div>
        </section>
  `;
}

module.exports = { processAllViolations };
