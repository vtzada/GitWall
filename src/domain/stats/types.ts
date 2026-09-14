export interface AggregateInput {
    days: ReadonlyArray<{date: string, count: number}>;
}

export interface AggregateOutput {
    total: number;
    last30Days: number;
    lastContributionDate: string | null;
}