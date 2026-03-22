import { LAXNUMBERS_BASE_URL, OREGON_BOYS_V } from "../config.js";
import type { LaxNumbersApiTeam, LaxTeam } from "../types.js";

function mapTeam(raw: LaxNumbersApiTeam): LaxTeam {
  return {
    rank: raw.ranking,
    name: raw.name,
    wins: raw.wins,
    losses: raw.losses,
    ties: raw.ties,
    gamesPlayed: raw.gp,
    goalsFor: raw.gf,
    goalsAgainst: raw.ga,
    rating: raw.rating,
    avgGoalDiff: raw.agd,
    scheduleStrength: raw.sched,
    website: raw.web || undefined,
  };
}

export async function fetchRankings(year: number): Promise<LaxTeam[]> {
  const url = `${LAXNUMBERS_BASE_URL}?y=${year}&v=${OREGON_BOYS_V}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      Referer: `https://laxnumbers.com/ratings.php?y=${year}&v=${OREGON_BOYS_V}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `laxnumbers.com returned HTTP ${response.status} for year ${year}`
    );
  }

  const data = (await response.json()) as LaxNumbersApiTeam[];

  if (!Array.isArray(data)) {
    throw new Error(`Unexpected response format from laxnumbers.com`);
  }

  return data.map(mapTeam).sort((a, b) => a.rank - b.rank);
}

export async function fetchTeamByName(
  teamName: string,
  year: number
): Promise<LaxTeam | null> {
  const teams = await fetchRankings(year);
  const lower = teamName.toLowerCase();
  return teams.find((t) => t.name.toLowerCase().includes(lower)) ?? null;
}
