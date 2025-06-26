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

## License

MIT