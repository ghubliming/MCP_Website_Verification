import fs from 'fs';
import path from 'path';

export function createLogger(testName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logDir = path.join(process.cwd(), 'logs');
  const logFile = path.join(logDir, `${testName}-${timestamp}.log`);

  // Ensure logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Create write stream
  const stream = fs.createWriteStream(logFile, { flags: 'a' });

  // Return logging function
  return function log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}\n`;
    stream.write(logMessage);
    console.log(message);
  };
}