# Website Verification MCP Tool

This project provides a Model-Context-Protocol (MCP) tool for verifying website URLs from an LLM's response.

## Mission
The tool acts as a post-response validator, checking websites that LLMs have already referenced in their answers and alerting when links are broken or inaccessible.

## Features
- Extracts URLs from text.
- Verifies URLs in parallel.
- Reports on accessible, problematic, and broken links.
- Provides a recommendation for the LLM (e.g., update the response).

## Getting Started

### Installation
First, install the dependencies:
```bash
npm install
```

### Running the server
To start the MCP server, run:
```bash
npm start
```

### Running tests
To run the test suite:
```bash
npm test
```

## Usage with MCP Clients

To use this tool with an MCP-compatible client like [Dive](https://github.com/OpenAgentPlatform/Dive), you can register it as a local server. Add the following configuration to your client, replacing `<path-to-your-project>` with the absolute path to this project's directory on your machine.

```json
{
  "mcpServers": {
    "website-verifier": {
      "transport": "stdio",
      "enabled": true,
      "command": "node",
      "args": [
        "<path-to-your-project>/dist/index.cjs"
      ],
      "env": {}
    }
  }
}
```

## License

MIT