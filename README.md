# laxnumbers-mcp-server

An MCP (Model Context Protocol) server that exposes Oregon Boys High School lacrosse team rankings from [laxnumbers.com](https://laxnumbers.com) to Claude Desktop.

## Overview

This server fetches live ranking data from laxnumbers.com and makes it available as MCP tools. Once connected to Claude Desktop, you can ask natural language questions about Oregon Boys HS lacrosse standings, team stats, and historical seasons.

## Requirements

- Node.js >= 18.0.0
- npm

## Installation

```bash
git clone https://github.com/your-username/laxnumbers-mcp-server.git
cd laxnumbers-mcp-server
npm install
npm run build
```

## MCP Tools

### `get_rankings`

Returns the full Oregon Boys HS lacrosse rankings table for a given season.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | No | Season year (default: current year) |

**Returns:** Sorted array of all teams with rank, record, rating, average goal differential, schedule strength, games played, goals for, and goals against.

### `get_team_ranking`

Looks up a specific team's ranking and stats by name.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `team_name` | string | Yes | Team name or partial name (case-insensitive) |
| `year` | number | No | Season year (default: current year) |

**Returns:** A single team object, or a not-found message if no match is found.

## Data Fields

| Field | Description |
|-------|-------------|
| `rank` | Current ranking position |
| `name` | Team name |
| `record` | W-L or W-L-T |
| `rating` | LaxNumbers rating score |
| `avgGoalDiff` | Average goal differential per game |
| `scheduleStrength` | Strength of schedule score |
| `gamesPlayed` | Total games played |
| `goalsFor` | Total goals scored |
| `goalsAgainst` | Total goals allowed |

## Data Source

Rankings are pulled from:

```
https://laxnumbers.com/ratings/service?y={year}&v=3443
```

- `v=3443` is the fixed identifier for the Oregon Boys HS division — do not change it
- `y=` is the season year (e.g. `2026`)
- No authentication required

## Project Structure

```
src/
  index.ts                 # MCP stdio entry point
  server.ts                # Tool definitions
  types.ts                 # TypeScript interfaces
  config.ts                # Constants (URL, v= param, default year)
  cli.ts                   # Interactive CLI test harness
  fetchers/
    rankingsFetcher.ts     # HTTP fetch + JSON parsing
```

## Development

```bash
npm run build        # Compile TypeScript → dist/
npm run dev          # Watch mode (recompiles on save)
```

### CLI Test Harness

A local interactive CLI is included for testing without Claude Desktop:

```bash
npm run build && npm run cli
```

Menu options:
1. View all rankings (table)
2. Search for a team by name
3. View top N teams
4. Change year
0. Exit

## Claude Desktop Integration

Add the following to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "laxnumbers": {
      "command": "node",
      "args": ["C:/Users/<your-username>/Desktop/Projects/laxnumbers-mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. The `laxnumbers` server will appear in the MCP tools list.

## Example Queries for Claude

- "What are the top 10 Oregon Boys HS lacrosse teams in 2026?"
- "Where does Jesuit rank this season?"
- "Which team has the best average goal differential?"
- "Show me all Oregon lacrosse rankings for 2025"
- "How did South Eugene do last year?"

## Running as MCP Server

```bash
npm run build
npm start    # Starts the stdio MCP server
```
