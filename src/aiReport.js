console.log('Running test...');
const axios = require('axios');
const fs = require('fs');

async function processAllViolations(data, apiUrl, apiKey) {
  const impactLevels = { critical: 0, serious: 0, moderate: 0 };
  let violationsHtml = "";

  if (data.violations && Array.isArray(data.violations) && data.violations.length > 0) {
    for (let violation of data.violations) {
      if (violation && violation.nodes && violation.nodes.length > 0) {
        calculateImpactLevels(violation, impactLevels);
        for (let node of violation.nodes) {
          const aiHtml = await processViolation(violation, node, apiUrl, apiKey);
          violationsHtml += formatViolationHtml(violation, aiHtml);
        }
      }
    }
  } else {
    violationsHtml = `<p>No accessibility violations found!</p>`;
  }

  generateFullHtmlReport(impactLevels, violationsHtml);
}

function calculateImpactLevels(violation, impactLevels) {
  if (impactLevels.hasOwnProperty(violation.impact)) {
    impactLevels[violation.impact]++;
  }
}

async function processViolation(violation, node, apiUrl, apiKey) {
  const jsonData = JSON.stringify({ violationId: violation.id, node }, null, 2);
  const prompt = `Analyze this accessibility issue and generate a structured HTML report:\n\n${jsonData}`;
  
  try {
    const response = await callAIService(prompt, apiUrl, apiKey);
    return sanitizeAIResponse(response.data.choices[0].message.content.trim());
  } catch (error) {
    console.error('Error while calling AI API:', error.message || 'Unknown error');
    return '<p>Error fetching AI report.</p>';
  }
}

async function callAIService(prompt, apiUrl, apiKey) {
  return axios.post(apiUrl, {
    messages: [
      { role: 'system', content: 'You are an expert in web accessibility audits.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3
  }, { headers: { 'Content-Type': 'application/json', 'api-key': apiKey } });
}

function sanitizeAIResponse(aiHtml) {
  return aiHtml.replace(/```html|```/g, '').trim();
}

function formatViolationHtml(violation, aiHtml) {
  return `
    <div class="violation">
      <h3>${violation.id} Issue</h3>
      <p><strong>Impact Level:</strong> ${violation.impact || "Unknown"}</p>
      <details>
        <summary>View AI Report</summary>
        <div class="ai-report">${aiHtml}</div>
      </details>
    </div>
  `;
}
function generateFullHtmlReport(impactLevels, violationsHtml) {
  const reportHtml = `
    <html>
      <head>
        <title>Accessibility AI Report</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f9fafb;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          h1 {
            text-align: center;
            color: #222;
          }
          .summary-grid {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
          }
          .summary-card {
            min-width: 220px;
            padding: 15px;
            text-align: center;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .critical {
            background: #ffebee;
            border: 2px solid #d32f2f;
            color: #b71c1c;
          }
          .serious {
            background: #fff3e0;
            border: 2px solid #f57c00;
            color: #e65100;
          }
          .moderate {
            background: #e3f2fd;
            border: 2px solid #1976d2;
            color: #0d47a1;
          }
          .violation {
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          details {
            margin-top: 10px;
            background: #f1f1f1;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
          }
          summary {
            font-weight: bold;
            color: #333;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h1>Comprehensive Web Accessibility Audit Report</h1>
        <p style="text-align: center;">Generated on: ${new Date().toLocaleString()}</p>
        <section class="summary-grid">
          <div class="summary-card critical">
            <h3>Critical Issues</h3>
            <p>${impactLevels.critical}</p>
          </div>
          <div class="summary-card serious">
            <h3>Serious Issues</h3>
            <p>${impactLevels.serious}</p>
          </div>
          <div class="summary-card moderate">
            <h3>Moderate Issues</h3>
            <p>${impactLevels.moderate}</p>
          </div>
        </section>
        <section>
          ${violationsHtml}
        </section>
      </body>
    </html>
  `;
  fs.writeFileSync('violation_report.html', reportHtml, 'utf8');
}


module.exports = { processAllViolations };
