#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/dist/esm/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/dist/esm/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/dist/esm/shared/protocol.js";
import { WebsiteVerificationTool } from "./website-verification/websiteVerificationTool.js";

const webTool = new WebsiteVerificationTool();
// @ts-ignore - The 'definition' property is inherited from the base Tool class.
const tools = [webTool.definition];

const server = new Server(
  {
    name: "mcp-server/website-verifier",
    version: "0.1.0",
  },
  {
    capabilities: {
      description: "An MCP server for verifying website link accessibility.",
      tools: {
        // @ts-ignore - The 'id' and 'definition' properties are inherited.
        [webTool.id]: webTool.definition,
      },
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  try {
    const { name, arguments: args } = request.params;

    // @ts-ignore - The 'id' property is inherited from the base Tool class.
    if (name !== webTool.id) {
      throw new Error(`Tool ${name} not found.`);
    }

    if (!args) {
      throw new Error("No parameters provided");
    }
    
    // @ts-ignore - The 'call' method is inherited from the base Tool class.
    const result = await webTool.call(args);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError: false,
    };

  } catch (error: any) {
    return {
      content: [{ type: "text", text: error.message || "An unexpected error occurred." }],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.listen(transport);
}

runServer().catch(err => {
  console.error(err);
  process.exit(1);
});
