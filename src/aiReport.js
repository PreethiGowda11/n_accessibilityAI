console.log('Running test...');
const axios = require('axios'); 
const dotenv = require('dotenv');

dotenv.config();

let RuleID=null;
const fs = require('fs');

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = process.env.OPENAI_API_ENDPOINT;

if (!API_URL || !API_KEY) {
    throw new Error("Missing OpenAI API URL or API Key in the .env file.");
}
let api_url = API_URL;
let api_key = API_KEY;



const data = JSON.parse(fs.readFileSync('./detailedReport.json', 'utf8'));

const impactLevels = {
  critical: 0,
  serious: 0,
  moderate: 0
};

if (data.violations && Array.isArray(data.violations)) { 
for (let violationIndex = 0; violationIndex < data.violations.length; violationIndex++) {
  const violation = data.violations[violationIndex];
  if (violation && violation.nodes) {
    for (let nodeIndex = 0; nodeIndex < violation.nodes.length; nodeIndex++) {
      const node = violation.nodes[nodeIndex];
 
      if (node.any && Array.isArray(node.any) && node.any.length > 0) {
        const impact = violation.impact;
        if (impactLevels.hasOwnProperty(impact)) {
          impactLevels[impact]++;
        }
      }
 
      if (node.all && Array.isArray(node.all) && node.all.length > 0) {
        const impact = violation.impact;
        if (impactLevels.hasOwnProperty(impact)) {
          impactLevels[impact]++;
        }
      }
      if (node.none && Array.isArray(node.none) && node.none.length > 0) {
        const impact = violation.impact;
        if (impactLevels.hasOwnProperty(impact)) {
          impactLevels[impact]++;
        }
      }
 
    }
  }

}
}
else {
  console.error("No violations found or data.violations is not an array.");
}


// Log the results
console.log('Impact Levels:', impactLevels);
// Calculate the total count of all specified impacts
const totalCount = Object.values(impactLevels).reduce((sum, count) => sum + count, 0);


// Output the results
console.log('Violations Count by Impact:');
console.log(impactLevels);
console.log(`Total Violations (Critical, Serious, Moderate): ${totalCount}`);


async function processViolation(violationIndex, nodeIndex) {
  const violation = data.violations[violationIndex];
  if (violation && violation.nodes && violation.nodes[nodeIndex]) {
    const node = violation.nodes[nodeIndex];
    
    // Convert the violation node to JSON format
    const jsonData = JSON.stringify({
      violationId: violation.id,
      violationIndex: violationIndex,
      nodeIndex: nodeIndex,
      node: node
    }, null, 2);
    RuleID = violation.id
    console.log(RuleID);
    // Create the prompt for the AI
    const prompt = `
    ${jsonData}
    Analyze the following accessibility JSON report and generate a comprehensive table in HTML format with the following structure for each issue:
    <table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="dropdown-btn">Issue ID</td>
      <td>[Issue ID]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Issue ID]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Impact Level</td>
      <td>[Impact Level]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Impact Level]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Description</td>
      <td>[Description of the issue]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Description]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Help Message</td>
      <td>[Help Message]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Help Message]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Tags</td>
      <td>
        - [Tag1] <br>
        - [Tag2]  
      </td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Tags]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Help URL</td>
      <td><a href="[Help URL]" target="_blank">Fix it here</a></td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Help URL]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Failure Summary</td>
      <td>[Failure Summary with specific problems listed]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Failure Summary]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">HTML Element Affected</td>
      <td>[Exact HTML element causing the issue]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about HTML Element Affected]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Target Selector</td>
      <td>[CSS Selector pointing to the affected element]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Target Selector]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Message</td>
      <td>[Detailed message describing what went wrong]</td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about the Message]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Recommended Fixes</td>
      <td>
        <ul>
          <li>1. [Fix 1: Step-by-step solution]</li>
          <li>2. [Fix 2: Step-by-step solution]</li>
          <li>3. [Fix 3: Step-by-step solution]</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Recommended Fixes]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Fix Examples</td>
     <td>
    <div style="margin-bottom: 10px;">
        Before (Issue Exists):<br>
        <code>&lt;a href="/pages/holiday-gift-guide"&gt;Holiday Gift Guide&lt;/a&gt;</code>
    </div>

    <div style="margin-bottom: 10px;">
        After Fix with <main>:<br>
        <code>&lt;main&gt;&lt;a href="/pages/holiday-gift-guide"&gt;Holiday Gift Guide&lt;/a&gt;&lt;/main&gt;</code>
    </div>

    <div style="margin-bottom: 10px;">
        After Fix with <nav>:<br>
        <code>&lt;nav&gt;&lt;a href="/pages/holiday-gift-guide"&gt;Holiday Gift Guide&lt;/a&gt;&lt;/nav&gt;</code>
    </div>

    <div style="margin-bottom: 10px;">
        After Fix with ARIA Role:<br>
        <code>&lt;div role="main"&gt;&lt;a href="/pages/holiday-gift-guide"&gt;Holiday Gift Guide&lt;/a&gt;&lt;/div&gt;</code>
    </div>
</td>

    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Fix Examples]</p>
      </td>
    </tr>
    <tr>
      <td class="dropdown-btn">Testing the Fix</td>
      <td>
        <ul>
          <li>1. Use Axe: Run the Axe browser extension or script to check for remaining accessibility issues.</li>
          <li>2. Use Lighthouse: Run Lighthouse in Chrome DevTools to check for errors.</li>
          <li>3. Test with a screen reader: Confirm landmarks are announced and content is accessible.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td colspan="2" class="dropdown-content" style="display:none;">
        <p>Details: [Detailed information about Testing the Fix]</p>
      </td>
    </tr>
  </tbody>
</table>

<script>
  document.querySelectorAll('.dropdown-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
    });
  });
</script>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-family: Arial, sans-serif;
    background-color: #000;
    color: #fff;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
    height: 60px; /* Adjust height for better box appearance */
  }

  th {
    background-color: #333;
    text-align: center;
  }

  td {
    vertical-align: top;
  }

  tr:nth-child(even) {
    background-color: #222;
  }

  tr:hover {
    background-color: #444;
  }

  code {
    background-color: #333;
    color: #f4f4f4;
    padding: 5px;
    border-radius: 3px;
  }

  a {
    color: #1e90ff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
  }

  .dropdown-btn {
    cursor: pointer;
    background-color: #444;
    color: #fff;
  }

  .dropdown-content {
    padding: 12px;
    background-color: #333;
  }
</style>
`;

 try {
      const response = await axios.post(
        API_URL,
        {
          messages: [
            { role: 'system', content: "You are a senior web accessibility expert with extensive experience in UX design, web development, and WCAG compliance. Provide a thorough and strategic analysis of the web accessibility issues based on the provided data. Your analysis should include detailed recommendations for addressing common accessibility issues, including but not limited to WCAG 2.1 guidelines, ARIA best practices, semantic HTML, and keyboard accessibility. Your response should be clear, actionable, and tailored to the specific issues identified in the input data." },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': API_KEY,
          },
        }
      );
      const aiHtmlStructure= response.data.choices[0].message.content.trim();
      appendToHtmlReport(aiHtmlStructure);

    } catch (error) {
      console.error('Error while calling OpenAI API:', error.message || 'Unknown error');
    }
  }
    
}

// Function to append the generated HTML to the report file
function appendToHtmlReport(htmlContent) {
  console.log('Running test  AI report ...');
  const reportFilePath = 'violation_report.html';

  if (!fs.existsSync(reportFilePath)) {
    fs.writeFileSync(reportFilePath, `
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
    background-color: #4CAF50;  /* Keeps the background color */
    color: #2c3e50;  /* Dark text color */
    padding: 15px;
    text-align: center;
    margin: 0;
    border-bottom: 3px solid #ddd;
  }
            .container {
              margin: 20px;
            }
            .violation {
              background-color: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 10px;
              margin: 10px 0;
            }
            .violation h3 {
              color: #555;
              margin: 0;
            }
            .violation p {
              margin: 5px 0;
              color: #666;
            }
            footer {
              text-align: center;
              font-size: 12px;
              color: #888;
              margin-top: 30px;
            }
              p {
    text-align: center;  /* Center the text horizontally */
    font-size: 16px;      /* Optional: Adjust font size if needed */
    color: #333;          /* Optional: Adjust text color */
    margin-top: 10px;     /* Optional: Add space above the paragraph */
  }

          </style>
<head>
    <style>
        /* Styling for the body */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9; /* Light background color */
            margin: 0;
            padding: 0;
        }

        /* Header styling */
        h1 {
            background-color: #3498db; /* Blue background */
            color: #fff; /* White text for contrast */
            text-align: center; /* Center-align the text */
            padding: 20px 0; /* Add space inside the header */
            margin: 0; /* Remove default margin */
            font-size: 30px; /* Font size for the title */
            font-weight: bold; /* Bold font for emphasis */
            letter-spacing: 1px; /* Letter spacing for a clean look */
            border-bottom: 4px solid #ddd; /* Subtle border under the header */
            text-transform: capitalize; /* Capitalize each word */
        }

        /* Date paragraph styling */
        p {
            text-align: center; /* Center-align the date */
            font-size: 16px; /* Smaller font size for the date */
            margin-top: 10px; /* Add space between title and date */
            color: #555; /* Slightly darker text for the date */
            /*font-style: italic;  Italicize the date */
        }
    </style>
</head>
<body>
    <h1>Comprehensive Web Accessibility Audit Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
</body>

<section class="summary-grid" style="
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
  
  <div class="summary-card critical" style="
      flex: 1;
      min-width: 200px;
      max-width: 300px;
      background-color: #ffe6e6;
      border: 1px solid #ff4d4d;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;">
    <h3 style="margin: 0 0 10px; font-size: 18px; color: #d80000;">Critical Issues</h3>
    <p style="font-size: 24px; font-weight: bold; margin: 0;"> <strong>${impactLevels.critical}</strong></p>
  </div>
  
  <div class="summary-card serious" style="
      flex: 1;
      min-width: 200px;
      max-width: 300px;
      background-color: #fff4e6;
      border: 1px solid #ffa64d;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;">
    <h3 style="margin: 0 0 10px; font-size: 18px; color: #d87f00;">Serious Issues</h3>
    <p style="font-size: 24px; font-weight: bold; margin: 0;"><strong>${impactLevels.serious}</strong></p>
  </div>
  
  <div class="summary-card moderate" style="
      flex: 1;
      min-width: 200px;
      max-width: 300px;
      background-color: #e6f7ff;
      border: 1px solid #66c2ff;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;">
    <h3 style="margin: 0 0 10px; font-size: 18px; color: #007acc;">Moderate Issues</h3>
    <p style="font-size: 24px; font-weight: bold; margin: 0;"> <strong>${impactLevels.moderate}</strong></p>
  </div>
  
  <div class="summary-card minor" style="
      flex: 1;
      min-width: 200px;
      max-width: 300px;
      background-color: #e6ffe6;
      border: 1px solid #4dff4d;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;">
    <h3 style="margin: 0 0 10px; font-size: 18px; color: #009900;">Total Issues</h3>
    <p style="font-size: 24px; font-weight: bold; margin: 0;"> <strong>${totalCount}</strong></p>
  </div>
</section>


<script>
  document.getElementById("showReportBtn").addEventListener("click", function () {
      const chickReportContainer = document.getElementById("chickReportContainer");
      // Toggle the visibility of the report
      if (chickReportContainer.style.display === "none") {
          chickReportContainer.style.display = "block";
      } else {
          chickReportContainer.style.display = "none";
      }
  });
</script>

<style>
    /* General Styles */
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #222;
        color: #fff;
    }

    h1, h3 {
        color: #fff;
    }

    header {
        background-color: #444;
        padding: 20px;
        text-align: center;
    }

    header p {
        font-size: 14px;
        margin-top: 5px;
        color: #ddd;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        padding: 20px;
    }

    .summary-card {
        background-color: #333;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        font-size: 18px;
    }

    .critical {
        background-color: #e74c3c;
        color: white;
    }

    .serious {
        background-color: #f39c12;
        color: white;
    }

    .moderate {
        background-color: #3498db;
        color: white;
    }

    .minor {
        background-color: #2ecc71;
        color: white;
    }
</style>
          
    `, 'utf8');
  }
  
  // Append the generated HTML content to the report file
  fs.appendFileSync(reportFilePath, `
    <div class="violation" style="border: 1px solid #ccc; padding: 12px 15px; border-radius: 5px; width: 100%; margin: 0; background-color: #f9f9f9;">
      <h3 style="font-family: Arial, sans-serif; font-size: 1.5em; margin: 0; color: #333;">${RuleID} Issue</h3>
      <details style="font-family: Arial, sans-serif; font-size: 1em; padding: 0; margin: 0;">
        <summary style="cursor: pointer; font-weight: bold; color: #007BFF; padding-bottom: 5px; margin: 0;">View Detailed AI Report</summary>
        <p style="margin: 5px 0 0 0; line-height: 1.6; color: #333;">${htmlContent}</p>
      </details>
    </div>
  
    
  `, 'utf8');
  
  // Optionally, you can close the HTML file with a footer and closing tags
  fs.appendFileSync(reportFilePath, `
         
        </body>
      </html>
  `, 'utf8');
}

// Function to process all violations sequentially
async function processAllViolations() {
  // Loop through all violations and nodes
  for (let violationIndex = 0; violationIndex < data.violations.length; violationIndex++) {
    const violation = data.violations[violationIndex];
    if (violation && violation.nodes) {
      for (let nodeIndex = 0; nodeIndex < violation.nodes.length; nodeIndex++) {
        // Process each violation node one at a time
        await processViolation(violationIndex, nodeIndex);
      }
    }
  }
  
  console.log('All violations processed!');
}

// Start processing all violations
processAllViolations()

setTimeout(() => {
  console.log('AI is Generation Report');
}, 3000);


