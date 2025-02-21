const fs = require("fs");
const axios = require("axios");

// 🔹 Load Axe-core JSON violations
function loadAxeReport(jsonFilePath) {
  return JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
}

// 🔹 Format violations as a structured prompt for AI
function formatViolationsForAI(violations) {
  return violations.map((v, i) => `
    **Issue #${i + 1}: ${v.id}**
    - **Impact**: ${v.impact || "N/A"}
    - **Description**: ${v.description}
    - **WCAG Reference**: ${v.tags.join(", ") || "N/A"}
    - **Fix Guide**: ${v.help || "No fix available"}
    - **Help URL**: ${v.helpUrl || "N/A"}
  `).join("\n\n");
}

// 🔹 Call AI API (e.g., OpenAI GPT) for detailed analysis
async function getAIAnalysis(axeData, apiUrl, apiKey) {
  const formattedData = {
    url: axeData.url || "Unknown URL",
    timestamp: axeData.timestamp || "Unknown timestamp",
    testEnvironment: axeData.testEnvironment || {},
    violations: axeData.violations || [],
    incomplete: axeData.incomplete || []
  };

  const prompt = `
    Analyze the following accessibility test results and provide a detailed report:
    
    **Tested Page:** ${formattedData.url}
    **Test Run Time:** ${formattedData.timestamp}
    **Browser & OS:** ${JSON.stringify(formattedData.testEnvironment)}

    **Violations Found:** ${formattedData.violations.length}
    **Incomplete Issues (Possible False Negatives):** ${formattedData.incomplete.length}

    **Detailed Violations Report:**
    ${formatViolationsForAI(formattedData.violations)}

    **Possible False Negatives (Incomplete Issues):**
    ${JSON.stringify(formattedData.incomplete, null, 2)}
  `;

  try {
    const response = await axios.post(apiUrl, {
      messages: [
        { role: 'system', content: 'You are an expert in web accessibility and WCAG compliance. Provide structured analysis, explain each issue, suggest fixes, and highlight potential false negatives.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    }, {
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "AI analysis could not be generated.";
  }
}


// 🔹 Generate the final HTML report
function generateHTMLReport(violations, aiAnalysis, outputPath) {
  const impactLevels = {
    critical: violations.filter(v => v.impact === "critical").length,
    serious: violations.filter(v => v.impact === "serious").length,
    moderate: violations.filter(v => v.impact === "moderate").length,
    minor: violations.filter(v => v.impact === "minor").length
  };

  const totalCount = Object.values(impactLevels).reduce((sum, count) => sum + count, 0);
  // 🔹 Step 2: Define Fix & Test Explanation Functions
  function generateFix(violation) {
    return `
    <p><strong>Issue:</strong> ${violation.id}</p>
    <p>${violation.description}</p>
    <p><strong>Suggested Fix:</strong></p>
    <ul>
      ${violation.help ? `<li>${violation.help}</li>` : "<li>No specific fix available</li>"}
      ${violation.helpUrl ? `<li><a href="${violation.helpUrl}" target="_blank">Read More</a></li>` : ""}
    </ul>
  `;
  }

  function generateTestSteps(violation) {
    return `
    <p><strong>How to Test:</strong></p>
    <ul>
      <li>Use <strong>Axe DevTools</strong> to verify if this issue still exists.</li>
      <li>Use <strong>keyboard navigation</strong> to check if elements are accessible.</li>
      <li>Run a <strong>screen reader test</strong> (e.g., NVDA, JAWS) to confirm usability.</li>
      ${violation.helpUrl ? `<li>Refer to <a href="${violation.helpUrl}" target="_blank">this guide</a> for testing methods.</li>` : ""}
    </ul>
  `;
  }
  
  const reportHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Accessibility Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; background: #f9f9f9; }
      h1 { text-align: center; margin-bottom: 10px; }
      h2 { border-bottom: 2px solid #ccc; padding-bottom: 5px; }

      /* Summary Tiles */
      .summary-container { display: flex; justify-content: space-around; margin-bottom: 20px; }
      .summary-card {
        width: 23%; text-align: center; padding: 15px;
        border-radius: 10px; font-size: 18px; font-weight: bold; color: #fff;
        box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
        text-decoration: none; transition: transform 0.3s;
      }
      .summary-card:hover { transform: scale(1.05); }
      .critical { background: #e74c3c; }
      .serious { background: #f39c12; }
      .moderate { background: #3498db; }
      .minor { background: #2ecc71; }

      /* Table Styling */
      table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff; border-radius: 8px; overflow: hidden; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background: #2c3e50; color: white; }

      /* Impact Level Colors */
      .impact { font-weight: bold; text-transform: capitalize; }
      .critical { color: #e74c3c; }
      .serious { color: #f39c12; }
      .moderate { color: #3498db; }
      .minor { color: #2ecc71; }

      /* Violation Details */
      .violation { background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
      .violation h3 { margin-bottom: 5px; }
      .fix-section { background: #f4f4f9; padding: 10px; border-radius: 5px; }
      .code-block { background: #272822; color: #f8f8f2; padding: 10px; border-radius: 5px; font-family: monospace; }

      /* Expandable Details */
      .expand-btn { cursor: pointer; background: #007BFF; color: white; border: none; padding: 5px 10px; border-radius: 4px; }
      .expand-btn:hover { background: #0056b3; }
      .details-row { display: none; }

    </style>
  </head>
  <body>
    <h1>AI Accessibility Analysis Report</h1>
    
    <p style="text-align: center;">Generated on: ${new Date().toLocaleString()}</p>

    <!-- Summary Tiles with Links -->
    <div id="summary-bar">
      <div style="display: flex; justify-content: space-around; text-align: center; margin: 10px 0;">
          <div style="background-color: #e74c3c; padding: 15px; border-radius: 10px; flex: ${impactLevels.critical}; color: white; font-weight: bold;">
              Critical: ${impactLevels.critical}
          </div>
          <div style="background-color: #f39c12; padding: 15px; border-radius: 10px; flex: ${impactLevels.serious}; color: white; font-weight: bold;">
              Serious: ${impactLevels.serious}
          </div>
          <div style="background-color: #3498db; padding: 15px; border-radius: 10px; flex: ${impactLevels.moderate}; color: white; font-weight: bold;">
              Moderate: ${impactLevels.moderate}
          </div>
          <div style="background-color: #2ecc71; padding: 15px; border-radius: 10px; flex: ${impactLevels.minor}; color: white; font-weight: bold;">
              Minor: ${impactLevels.minor}
          </div>
      </div>
  </div>

    <!-- Violations Table -->
    <h2>🛠 Accessibility Violations</h2>
    <table>
      <tr>
        <th>#</th>
        <th>ID</th>
        <th>Impact</th>
        <th>Description</th>
        <th>Fix</th>
        <th>Test</th>
        <th>Details</th>
      </tr>
      ${violations.map((v, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${v.id}</td>
          <td class="impact ${v.impact}">${v.impact}</td>
          <td>${v.description}</td>
          <td><button class="expand-btn" onclick="toggleDetails('fix-${i}')">How to Fix</button></td>
          <td><button class="expand-btn" onclick="toggleDetails('test-${i}')">How to Test</button></td>
          <td><button class="expand-btn" onclick="toggleDetails('details-${i}')">View Details</button></td>
        </tr>
        <tr id="fix-${i}" class="details-row"><td colspan="7">
          <div class="fix-section"><strong>How to Fix:</strong><br>${generateFix(v)}</div>
        </td></tr>
        <tr id="test-${i}" class="details-row"><td colspan="7">
          <div class="fix-section"><strong>How to Test:</strong><br>${generateTestSteps(v)}</div>
        </td></tr>
        <tr id="details-${i}" class="details-row"><td colspan="7">
          <pre class="code-block">${JSON.stringify(v, null, 2)}</pre>
        </td></tr>
      `).join("")}
    </table>

    <script>
      function toggleDetails(id) {
        let row = document.getElementById(id);
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
      }
    </script>

  </body>
  </html>
`;

  fs.writeFileSync(outputPath, reportHtml);
  console.log(`✅ AI-enhanced accessibility report saved at: ${outputPath}`);
}

// 🔹 Main function: Load, analyze, and generate report
async function analyzeAxeReport(axeJsonPath, outputHtmlPath, apiKey, apiEndpoint) {
  const axeData = loadAxeReport(axeJsonPath);
  if (!axeData.violations || axeData.violations.length === 0) {
    console.log("No violations found in the Axe-core report.");
    return;
  }

  console.log("🔍 Sending violations to AI for analysis...");
  const aiAnalysis = await getAIAnalysis(axeData, apiKey, apiEndpoint);
  generateHTMLReport(axeData.violations, aiAnalysis, outputHtmlPath);
}
module.exports = { analyzeAxeReport };
