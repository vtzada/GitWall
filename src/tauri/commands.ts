import { invoke } from "@tauri-apps/api/core";
import type { ContributionDay } from "@/domain/streak";

export interface UserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
}

export type ContributionDayDto = ContributionDay;

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

export interface CredentialsPayload {
  username: string;
  token: string;
}

export async function storeCredentials(username: string, token: string): Promise<void> {
  await invoke("store_credentials", { username, token });
}

export async function getStoredCredentials(): Promise<CredentialsPayload | null> {
  return await invoke<CredentialsPayload | null>("get_stored_credentials");
}

export async function deleteStoredCredentials(): Promise<void> {
  await invoke("delete_stored_credentials");
}

export async function saveCachedContributions(payload: ContributionPayload): Promise<void> {
  await invoke("save_cached_contributions", { payload });
}

export async function getCachedContributions(): Promise<ContributionPayload | null> {
  return await invoke<ContributionPayload | null>("get_cached_contributions");
}

export async function setAutostart(enable: boolean): Promise<boolean> {
  return await invoke<boolean>("set_autostart", { enable });
}

export async function getAutostart(): Promise<boolean> {
  return await invoke<boolean>("get_autostart");
}

export async function attachWallpaper(): Promise<void> {
  await invoke("attach_wallpaper");
}

export async function detachWallpaper(): Promise<void> {
  await invoke("detach_wallpaper");
}