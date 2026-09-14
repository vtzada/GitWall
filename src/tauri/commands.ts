import { invoke } from "@tauri-apps/api/core";

export interface UserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface ContributionDayDto {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionPayload {
  user: UserProfile;
  days: ContributionDayDto[];
  total: number;
}

export type GithubError =
  | { kind: "AuthRequired" }
  | { kind: "UserNotFound"; message: string }
  | { kind: "RateLimited" }
  | { kind: "Network"; message: string }
  | { kind: "Api"; message: string }
  | { kind: "InvalidResponse"; message: string };

export interface FetchContributionsArgs {
  username: string;
  year: number;
  token: string;
}

export async function fetchContributions(
  args: FetchContributionsArgs,
): Promise<ContributionPayload> {
  try {
    return await invoke<ContributionPayload>("fetch_contributions_cmd", { ...args });
  } catch (err) {
    // O Tauri serializa o erro como o payload que definimos no Rust.
    throw err as GithubError;
  }
}