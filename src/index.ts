#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { extractUrls } from "./website-verification/urlExtractor.js";
import { verifyUrl } from "./website-verification/urlVerifier.js";

const server = new McpServer(
  {
    name: "mcp-server/website-verifier",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register the website verification tool
server.tool(
  'website-verifier',
  'Verifies a list of URLs to check for accessibility, timeouts, or other errors.',
  {
    text: z.string().optional().describe('Text containing URLs to extract and verify'),
    urls: z.array(z.string()).optional().describe('Array of URLs to verify directly'),
  },
  async ({ text, urls }) => {
    let urlsToVerify: string[] = [];

    if (urls) {
      urlsToVerify = urls;
    } else if (text) {
      urlsToVerify = extractUrls(text);
    }

    if (urlsToVerify.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              total_links: 0,
              accessible: 0,
              problematic: 0,
              issues: [],
              recommendation: 'LOOKS_GOOD',
            }, null, 2),
          },
        ],
      };
    }

    const verificationPromises = urlsToVerify.map(url => verifyUrl(url));
    const results = await Promise.all(verificationPromises);

    const problematicResults = results.filter(r => r.status !== 'ACCESSIBLE');

    const report = {
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

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(err => {
  console.error(err);
  process.exit(1);
});
