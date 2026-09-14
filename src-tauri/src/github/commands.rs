use super::client::fetch_contributions;
use super::errors::GithubErrorPayload;

#[tauri::command]
pub async fn fetch_contributions_cmd(
    username: String,
    year: i32,
    token: String,
) -> Result<super::types::ContributionPayload, GithubErrorPayload> {
    fetch_contributions(&username, year, &token)
        .await
        .map_err(Into::into)
}