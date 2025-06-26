# Mission Briefing: Post-Response Website Verification Tool

## Objective
Develop an MCP tool that acts as a **post-response validator**, checking websites that LLMs have already referenced in their answers and alerting when links are broken or inaccessible.

## Updated Problem Statement
Current workflow issue:
1. LLM performs web search and finds websites
2. **LLM creates response with website links** 
3. User clicks links → encounters 404s, broken sites, or errors
4. User loses trust and gets frustrated

**Our tool intercepts at step 3** - after the response is generated but before user interaction.

## Mission Requirements

### Primary Function
**Post-response link validation**: Scan LLM's completed response, extract all website URLs, verify each one, and provide feedback about link quality.

### Core Workflow
1. **Response Analysis**: Parse LLM's answer to extract all mentioned URLs
2. **Batch Verification**: Quickly check all extracted links in parallel
3. **Issue Reporting**: Alert LLM about any problematic links found
4. **Corrective Action**: Allow LLM to update response or add warnings

### Tool Interface Design
**Input:** 
- LLM's complete response text (with embedded URLs)
- OR extracted list of URLs from response

**Output:** Verification report:
```
{
  "total_links": 5,
  "accessible": 3,
  "problematic": 2,
  "issues": [
    {
      "url": "https://broken-site.com",
      "status": "NOT_ACCESSIBLE", 
      "reason": "404 Not Found"
    },
    {
      "url": "https://slow-site.com",
      "status": "TIMEOUT",
      "reason": "Request timeout after 10s"
    }
  ],
  "recommendation": "UPDATE_RESPONSE"
}
```

### Integration Flow - Updated
1. LLM completes web search and generates response with website references
2. **[NEW STEP]** Post-response verification tool automatically scans the answer
3. Tool extracts and validates all URLs mentioned
4. If issues found: Tool reports back to LLM with specific problems
5. LLM can then:
   - Remove broken links from response
   - Add warnings about potentially problematic sites
   - Replace with alternative working sources
   - Update response accordingly

### Advanced Capabilities
- **URL Extraction**: Parse various link formats (markdown, plain text, citations)
- **Smart Detection**: Identify when sites show "fake" content (soft 404s, parked domains)
- **Context Awareness**: Understand which links are critical vs supplementary
- **Batch Efficiency**: Handle responses with many links quickly

### Response Enhancement Options
When problematic links detected, LLM can:
- **Remove**: "~~https://broken-site.com~~ (link removed - site inaccessible)"
- **Warn**: "⚠️ Note: This link may be temporarily unavailable"
- **Replace**: Find alternative working sources
- **Annotate**: Add status indicators next to each link

### Success Metrics
- **Coverage**: Catch 95%+ of truly broken links in responses  
- **Speed**: Complete verification within 10-15 seconds for typical response
- **Actionability**: Provide clear guidance on which links need attention
- **User Protection**: Prevent users from encountering broken links

## Expected Impact - Updated
- **Proactive Quality Control**: Issues caught before user sees them
- **Dynamic Response Improvement**: LLMs can self-correct link problems
- **Enhanced User Trust**: Users receive only verified, working links
- **Reduced Support Issues**: Fewer complaints about broken references

## Mission Critical Success Factor
The tool must operate as a **quality gate** - every LLM response with web links gets automatically verified, ensuring users never receive unvetted website references.

**Core Philosophy**: Better to flag a working site as questionable than let broken links reach users.