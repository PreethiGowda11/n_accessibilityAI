
<p align="center">
  <img src="https://raw.githubusercontent.com/triconinfotech/nilgiri/main/files/nilgiri.PNG" alt="Nilgiri Logo" width="200"/>
</p>
<h1 align="center">Nilgiri Framework</h1>
<p align="center">
    <a href="https://npmjs.com/package/nilgiriaccessibility">
        <img src="https://img.shields.io/npm/v/nilgiriaccessibility.svg" alt="npm version">
    </a>
    <a href="https://npmjs.com/package/nilgiriaccessibility">
        <img src="https://img.shields.io/npm/dm/nilgiriaccessibility.svg" alt="npm downloads">
    </a>
    <a href="https://npmjs.com/package/nilgiriaccessibility">
        <img src="https://img.shields.io/npm/l/nilgiriaccessibility.svg" alt="license">
</a>

</p>

## **nilgiri-accessibility**: A Core Component of the Nilgiri Framework

The `nilgiri-accessibility` module integrates **Playwright** and **Axe Core** with **AI-driven insights** to simplify and enhance web accessibility testing. It scans web pages for **WCAG 2.1 compliance issues** and generates **detailed JSON and HTML reports**. With AI-generated insights, it highlights critical accessibility problems, offering actionable solutions to improve your web content.  
Perfect for teams aiming to automate, analyze, and enhance their web accessibility workflows with ease.

---

<h1 align="center">How to Setup?</h1>

### Prerequisites

1. **Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **IDE**: This project is written in **TypeScript**, so use an IDE that supports Node.js, such as **VSCode** or **WebStorm**.
3. **AI API Key and Endpoint**: The project uses AI for report generation. Make sure you have your **AI API key** and **endpoint** ready.

---

## Setup: Install and Run

1. **Install the Dependency**:
   ```bash
   npm install nilgiri-accessibility --save -d
   ```

2. **Import the `runAccessibilityCheck` method from nilgiri-accessibility**:
   ```typescript
   import { runAccessibilityCheck } from 'nilgiri-accessibility';
   ```

3. **Call the `runAccessibilityCheck` function with the required parameters**:
   ```typescript
   const aiEndpoint = 'https://api.openai.com/v1/completions';  // Your AI service endpoint
   const aiApiKey = 'sk-xxxxxx12345';  // Your AI service API key
   const systemUnderTestUrl = 'https://example.com';  // The URL to scan

   runAccessibilityCheck(aiEndpoint, aiApiKey, systemUnderTestUrl)
     .then(() => console.log('Accessibility analysis completed!'))
     .catch(err => console.error('Error:', err));
   ```

---

### Parameters

| Parameter          | Type   | Description                                                             | Example                                     |
|--------------------|--------|-------------------------------------------------------------------------|---------------------------------------------|
| `aiEndpoint`       | string | The endpoint URL of the AI service (e.g., OpenAI API).                  | `'https://api.openai.com/v1/completions'`   |
| `aiApiKey`         | string | The API key for authenticating with the AI service.                     | `'sk-xxxxxx12345'`                          |
| `systemUnderTestUrl` | string | The URL of the target web page to scan for accessibility issues.         | `'https://example.com'`                     |

---

<h1 align="center">How to Run the Application?</h1>

### **Running the Application**
To run the `runAccessibilityCheck` method, import and call it in your script:

Example: `testFile.ts`
```typescript
import { runAccessibilityCheck } from 'nilgiri-accessibility';

const aiEndpoint = 'https://api.openai.com/v1/completions';
const aiApiKey = 'sk-xxxxxx12345';
const systemUnderTestUrl = 'https://example.com';

runAccessibilityCheck(aiEndpoint, aiApiKey, systemUnderTestUrl)
  .then(() => console.log('Accessibility analysis completed!'))
  .catch(err => console.error('Error during analysis:', err));
```

#### If you are running your file in Type Script then follow this Step 

### Prerequisites
1. Ensure you have **Node.js** and **TypeScript** installed on your machine.
   - You can download Node.js from [here](https://nodejs.org/).
   - To install TypeScript globally, run the following command:
     ```bash
     npm install -g typescript
     ```

### Steps to Run

1. **Compile the TypeScript file**:
   In your terminal, navigate to the project folder and run the following command to compile the TypeScript file:
   ```bash
   tsc <your-file-name>.ts
   node <your-file-name>.js
   

---

<h1 align="center">How Report Looks Like?</h1>

* Add a sample report GIF or screenshot here.

---

## Features
- Automated accessibility scans using **Playwright** and **Axe Core**.
- AI-powered analysis for accessibility insights and suggestions.
- Simple, configurable interface for passing **AI endpoint**, **API key**, and **SUT URL**.
- Generates:
  - **JSON Report**: Contains detailed findings and scan summary.
  - **HTML Report**: A human-readable report with detailed accessibility analysis and solutions.
- Fully compatible with **TypeScript** and **Node.js**.

---

## Support  
* For any support, please feel free to drop your query at the [nilgiri-accessibility GitHub repository](https://github.com/triconinfotech/nilgiriaccessibility/issues).  

---

<p align="center">
    Copyright (c) 2025 Tricon Infotech
</p>
