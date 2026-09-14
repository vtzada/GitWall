export interface ContributionDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export interface StreakStats {
    current: number;
    longest: number;
    total: number;
    last30Days: number;
    lastContributionDate: string | null;
}

