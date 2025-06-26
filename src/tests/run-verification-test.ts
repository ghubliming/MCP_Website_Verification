import { extractUrls } from '../website-verification/urlExtractor.js';
import { verifyUrl } from '../website-verification/urlVerifier.js';
import fs from 'fs';
import path from 'path';

// --- Logger Setup ---
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
const logFile = path.join(logsDir, `brutal-test-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\\n');
}

// --- Test Cases ---
const URL_TEST_CASES = [
  'https://www.google.com',           // Good URL
  'https://httpstat.us/404',          // Bad URL (404)
  'https://httpstat.us/503',          // Server Error
  'https://thissitedoesnotexist.blah', // Non-existent domain
  'https://httpstat.us/200?sleep=11000' // Timeout URL
];

const TEXT_TEST_CASES = [
    'Here are some links: https://www.google.com and a broken one http://broken-site.com. Also check https://slow-site.com.',
    'This text has no links.',
    'Only one link here: https://www.bing.com'
];


async function runBrutalTest() {
  log('--- Starting Brutal, Direct Test Run ---');
  let allTestsPassed = true;

  // 1. Test URL Extraction
  log('\\n--- Testing URL Extractor ---');
  for (const text of TEXT_TEST_CASES) {
      log(`Input Text: "${text}"`);
      const extracted = extractUrls(text);
      log(`Extracted: ${JSON.stringify(extracted)}`);
  }

  // 2. Test URL Verification
  log('\\n--- Testing URL Verifier (with real network calls) ---');
  for (const url of URL_TEST_CASES) {
    log(`Testing URL: ${url}`);
    try {
      const result = await verifyUrl(url);
      log(`Result: ${JSON.stringify(result)}`);
      if (result.status === 'ACCESSIBLE' && (url.includes('404') || url.includes('503'))) {
        log('--> TEST FAILED: Site was supposed to be inaccessible.');
        allTestsPassed = false;
      }
    } catch (e: any) {
      log(`--> TEST FAILED WITH ERROR: ${e.message}`);
      allTestsPassed = false;
    }
  }

  log('\\n--- Test Run Summary ---');
  if (allTestsPassed) {
    log('All core functions appear to be working correctly.');
  } else {
    log('One or more direct function tests failed.');
  }
  log('--- End of Test Run ---');

  if (!allTestsPassed) {
    process.exit(1);
  }
}

runBrutalTest(); 