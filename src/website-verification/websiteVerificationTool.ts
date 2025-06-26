import { Tool, ToolInput, ToolOutput } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { extractUrls } from './urlExtractor.js';
import { verifyUrl, VerificationResult } from './urlVerifier.js';

interface WebsiteVerificationInput extends ToolInput {
  text?: string;
  urls?: string[];
}

interface WebsiteVerificationOutput extends ToolOutput {
  total_links: number;
  accessible: number;
  problematic: number;
  issues: {
    url: string;
    status: string;
    reason: string;
  }[];
  recommendation: 'UPDATE_RESPONSE' | 'LOOKS_GOOD';
}

export class WebsiteVerificationTool extends Tool<WebsiteVerificationInput, WebsiteVerificationOutput> {
  // @ts-ignore
  id = 'website-verifier';
  name = 'Website Verifier';
  description = 'Verifies a list of URLs to check for accessibility, timeouts, or other errors.';
  
  private isIncompleteUrl(url: string): boolean {
    // Check if URL is missing protocol (http:// or https://)
    return !url.startsWith('http://') && !url.startsWith('https://') && 
           (url.includes('.') || url.startsWith('www.'));
  }
  
  // @ts-ignore
  async _call(input: WebsiteVerificationInput): Promise<WebsiteVerificationOutput> {
    let urlsToVerify: string[] = [];

    if (input.urls) {
      urlsToVerify = input.urls;
    } else if (input.text) {
      urlsToVerify = extractUrls(input.text);
    }

    if (urlsToVerify.length === 0) {
      return {
        total_links: 0,
        accessible: 0,
        problematic: 0,
        issues: [],
        recommendation: 'LOOKS_GOOD',
      };
    }

    // Check for incomplete URLs and handle them separately
    const results: VerificationResult[] = [];
    
    for (const url of urlsToVerify) {
      if (this.isIncompleteUrl(url)) {
        results.push({
          url,
          status: 'NOT_ACCESSIBLE',
          reason: 'Incomplete URL - missing protocol (http:// or https://)',
        });
      } else {
        const verificationResult = await verifyUrl(url);
        results.push(verificationResult);
      }
    }

    const problematicResults = results.filter(r => r.status !== 'ACCESSIBLE');

    const report: WebsiteVerificationOutput = {
      total_links: results.length,
      accessible: results.length - problematicResults.length,
      problematic: problematicResults.length,
      issues: problematicResults.map(r => ({
        url: r.url,
        status: r.status,
        reason: r.reason,
      })),
      recommendation: problematicResults.length > 0 ? 'UPDATE_RESPONSE' : 'LOOKS_GOOD',
    };

    return report;
  }
} 