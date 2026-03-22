# laxnumbers-mcp-server

MCP server that exposes Oregon Boys High School lacrosse team rankings from [laxnumbers.com](https://laxnumbers.com) to Claude Desktop.

## Data Source

- **URL pattern:** `https://laxnumbers.com/ratings/service?y={year}&v=3443`
- `v=3443` is the fixed identifier for Oregon Boys HS — do not change it
- `y=` is the season year (e.g. `2026`)
- Returns a JSON array of team objects — no authentication required

## MCP Tools

### `get_rankings`
Get the full Oregon Boys HS lacrosse rankings table.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | No | Season year (default: current year) |

Returns: sorted array of all teams with rank, record, rating, AGD, schedule strength, goals for/against.

### `get_team_ranking`
Look up a specific team's ranking and stats by name.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `team_name` | string | Yes | Team name or partial name (case-insensitive) |
| `year` | number | No | Season year (default: current year) |

Returns: single team object or a not-found message.

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

## Setup & Development

```bash
npm install
npm run build        # compile TypeScript → dist/
npm run dev          # watch mode
```

## Testing with the CLI

```bash
npm run build && npm run cli
```

The CLI menu supports:
1. View all rankings (table)
2. Search for a team by name
3. View top N teams
4. Change year
0. Exit

## Running as MCP Server

```bash
npm run build
npm start            # starts stdio server
```

## Claude Desktop Integration

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

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

Then restart Claude Desktop. You should see the `laxnumbers` server in the MCP tools list.

## Example Queries for Claude

- "What are the top 10 Oregon Boys HS lacrosse teams in 2026?"
- "Where does Jesuit rank this season?"
- "Which team has the best average goal differential?"
- "Show me all Oregon lacrosse rankings for 2025"

## Key Data Fields

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
