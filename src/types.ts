// Raw shape returned by the laxnumbers.com JSON API
export interface LaxNumbersApiTeam {
  team_nbr: number;
  name: string;
  web: string;
  logo: string;
  gp: number;
  gf: number;
  ga: number;
  wins: number;
  losses: number;
  ties: number;
  agd: number;
  sched: number;
  rating: number;
  adj_average: number;
  suffix: string;
  state: string;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  div_rank_live: number;
  logo_large_url: string | null;
  ranking: number;
}

// Normalized team shape used throughout the app
export interface LaxTeam {
  rank: number;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  rating: number;
  avgGoalDiff: number;
  scheduleStrength: number;
  website?: string;
}
