import { createLogger } from './testUtils.js';
import { spawn } from 'child_process';
import path from 'path';

const log = createLogger("test-runner");

function runTest(testFile: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const testPath = path.join('src', 'tests', testFile);
    const child = spawn('npx', ['tsx', testPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    child.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text.trim());
    });

    child.stderr?.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error(text.trim());
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output + errorOutput
      });
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        output: `Process error: ${error.message}`
      });
    });
  });
}

async function runAllTests() {
  log('=== Starting All Tests ===\n');

  const tests = [
    { name: 'Review Options Test', file: 'reviewOptionsTest.ts' },
    { name: 'Review Summary V1 Test', file: 'reviewSummaryV1Test.ts' },
    { name: 'MCP Tools Test', file: 'mcpToolsTest.ts' }
  ];

  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const test of tests) {
    try {
      log(`\n🧪 Running ${test.name}...`);
      log('=' + '='.repeat(test.name.length + 20));
      
      const result = await runTest(test.file);
      
      if (result.success) {
        log(`✅ ${test.name} completed successfully\n`);
        results.push({ name: test.name, success: true });
      } else {
        log(`❌ ${test.name} failed\n`);
        results.push({ name: test.name, success: false, error: 'Test execution failed' });
      }
    } catch (error) {
      log(`❌ ${test.name} failed: ${error instanceof Error ? error.message : String(error)}\n`);
      results.push({ 
        name: test.name, 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  log('=== Test Results Summary ===');
  results.forEach(result => {
    log(`${result.success ? '✅' : '❌'} ${result.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
    if (!result.success && result.error) {
      log(`   Error: ${result.error}`);
    }
  });

  const allPassed = results.every(r => r.success);
  log(`\n=== Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`);

  return allPassed;
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(err => {
    console.error('Test runner failed:', err);
    process.exit(1);
  });
}

export { runAllTests };
