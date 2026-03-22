import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_YEAR } from "./config.js";
import { fetchRankings, fetchTeamByName } from "./fetchers/rankingsFetcher.js";
import type { LaxTeam } from "./types.js";

function formatRecord(t: LaxTeam): string {
  return t.ties > 0 ? `${t.wins}-${t.losses}-${t.ties}` : `${t.wins}-${t.losses}`;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "laxnumbers",
    version: "1.0.0",
  });

  // Tool: get_rankings
  server.tool(
    "get_rankings",
    "Get Oregon Boys HS lacrosse team rankings from laxnumbers.com",
    {
      year: z
        .number()
        .int()
        .min(2000)
        .max(2100)
        .optional()
        .describe(
          `Season year (e.g. 2026). Defaults to current year (${DEFAULT_YEAR}).`
        ),
    },
    async ({ year }) => {
      const y = year ?? DEFAULT_YEAR;
      const teams = await fetchRankings(y);

      const result = teams.map((t) => ({
        rank: t.rank,
        name: t.name,
        record: formatRecord(t),
        rating: t.rating,
        avgGoalDiff: t.avgGoalDiff,
        scheduleStrength: t.scheduleStrength,
        gamesPlayed: t.gamesPlayed,
        goalsFor: t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        ...(t.website ? { website: t.website } : {}),
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { year: y, totalTeams: result.length, rankings: result },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: get_team_ranking
  server.tool(
    "get_team_ranking",
    "Look up a specific Oregon Boys HS lacrosse team's ranking and stats by name",
    {
      team_name: z
        .string()
        .min(1)
        .describe("Team name or partial name to search for (case-insensitive)"),
      year: z
        .number()
        .int()
        .min(2000)
        .max(2100)
        .optional()
        .describe(
          `Season year (e.g. 2026). Defaults to current year (${DEFAULT_YEAR}).`
        ),
    },
    async ({ team_name, year }) => {
      const y = year ?? DEFAULT_YEAR;
      const team = await fetchTeamByName(team_name, y);

      if (!team) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                found: false,
                message: `No team matching "${team_name}" found in ${y} Oregon Boys HS rankings.`,
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                found: true,
                year: y,
                team: {
                  rank: team.rank,
                  name: team.name,
                  record: formatRecord(team),
                  rating: team.rating,
                  avgGoalDiff: team.avgGoalDiff,
                  scheduleStrength: team.scheduleStrength,
                  gamesPlayed: team.gamesPlayed,
                  goalsFor: team.goalsFor,
                  goalsAgainst: team.goalsAgainst,
                  ...(team.website ? { website: team.website } : {}),
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  return server;
}
