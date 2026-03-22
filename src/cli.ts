import * as readline from "readline";
import { DEFAULT_YEAR } from "./config.js";
import { fetchRankings, fetchTeamByName } from "./fetchers/rankingsFetcher.js";
import type { LaxTeam } from "./types.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function line(char = "─", width = 72): void {
  console.log(char.repeat(width));
}

function printTable(rows: string[][]): void {
  if (rows.length === 0) return;
  const cols = rows[0].length;
  const widths = Array.from({ length: cols }, (_, i) =>
    Math.max(...rows.map((r) => (r[i] ?? "").length))
  );
  for (const row of rows) {
    console.log(row.map((cell, i) => cell.padEnd(widths[i])).join("  "));
  }
}

function formatRecord(t: LaxTeam): string {
  return t.ties > 0
    ? `${t.wins}-${t.losses}-${t.ties}`
    : `${t.wins}-${t.losses}`;
}

function rankingsToTable(teams: LaxTeam[]): string[][] {
  const header = [
    "Rank",
    "Team",
    "Record",
    "Rating",
    "AGD",
    "Sched",
    "GP",
    "GF",
    "GA",
  ];
  const rows = teams.map((t) => [
    String(t.rank),
    t.name,
    formatRecord(t),
    String(t.rating),
    String(t.avgGoalDiff),
    String(t.scheduleStrength),
    String(t.gamesPlayed),
    String(t.goalsFor),
    String(t.goalsAgainst),
  ]);
  return [header, ...rows];
}

// ── Menu actions ─────────────────────────────────────────────────────────────

async function getAllRankings(year: number): Promise<void> {
  console.log(`\nFetching ${year} Oregon Boys HS rankings…`);
  const teams = await fetchRankings(year);
  line();
  console.log(`  ${year} Oregon Boys HS Lacrosse Rankings  (${teams.length} teams)`);
  line();
  printTable(rankingsToTable(teams));
  line();
}

async function searchTeam(year: number): Promise<void> {
  const name = await ask("Enter team name (partial match OK): ");
  if (!name.trim()) return;

  console.log(`\nSearching ${year} rankings for "${name}"…`);
  const team = await fetchTeamByName(name, year);

  if (!team) {
    console.log(`  No team matching "${name}" found in ${year}.`);
    return;
  }

  line();
  console.log(`  #${team.rank}  ${team.name}`);
  line();
  console.log(`  Record            ${formatRecord(team)}`);
  console.log(`  Games Played      ${team.gamesPlayed}`);
  console.log(`  Rating            ${team.rating}`);
  console.log(`  Avg Goal Diff     ${team.avgGoalDiff}`);
  console.log(`  Schedule Strength ${team.scheduleStrength}`);
  console.log(`  Goals For         ${team.goalsFor}`);
  console.log(`  Goals Against     ${team.goalsAgainst}`);
  if (team.website) console.log(`  Website           ${team.website}`);
  line();
}

async function getTopN(year: number): Promise<void> {
  const raw = await ask("How many teams to show? ");
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1) {
    console.log("  Invalid number.");
    return;
  }

  console.log(`\nFetching top ${n} teams for ${year}…`);
  const teams = (await fetchRankings(year)).slice(0, n);
  line();
  console.log(`  Top ${n} — ${year} Oregon Boys HS Lacrosse`);
  line();
  printTable(rankingsToTable(teams));
  line();
}

// ── Main loop ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   LaxNumbers MCP — CLI Test Tool     ║");
  console.log("╚══════════════════════════════════════╝");

  let year = DEFAULT_YEAR;

  while (true) {
    console.log(`\n  Current year: ${year}`);
    console.log("  1. Get all rankings");
    console.log("  2. Search for a team");
    console.log("  3. Get top N teams");
    console.log("  4. Change year");
    console.log("  0. Exit");

    const choice = (await ask("\nChoice: ")).trim();

    try {
      if (choice === "1") {
        await getAllRankings(year);
      } else if (choice === "2") {
        await searchTeam(year);
      } else if (choice === "3") {
        await getTopN(year);
      } else if (choice === "4") {
        const raw = await ask(`Enter year (current: ${year}): `);
        const y = parseInt(raw, 10);
        if (!isNaN(y) && y >= 2000 && y <= 2100) {
          year = y;
          console.log(`  Year set to ${year}.`);
        } else {
          console.log("  Invalid year.");
        }
      } else if (choice === "0") {
        console.log("\nBye!\n");
        break;
      } else {
        console.log("  Unknown option.");
      }
    } catch (err) {
      console.error(`\n  Error: ${err instanceof Error ? err.message : err}`);
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
