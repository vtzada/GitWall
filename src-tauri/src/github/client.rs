use chrono::Utc;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, USER_AGENT};

use super::errors::GithubError;
use super::query::CONTRIBUTIONS_QUERY;
use super::types::{
    ContributionDayDto, ContributionPayload, GqlResponse, UserData, UserProfile,
};

const GITHUB_GRAPHQL: &str = "https://api.github.com/graphql";

pub async fn fetch_contributions(
    username: &str,
    _year: i32,          // ignorado por enquanto
    token: &str,
) -> Result<ContributionPayload, GithubError> {
    let today = Utc::now().date_naive();
    let from_date = today - chrono::Duration::days(365);

    let from = from_date.and_hms_opt(0, 0, 0).unwrap().and_utc();
    let to = today.and_hms_opt(23, 59, 59).unwrap().and_utc();

    let body = serde_json::json!({
        "query": CONTRIBUTIONS_QUERY,
        "variables": {
            "login": username,
            "from": from.to_rfc3339(),
            "to": to.to_rfc3339(),
        }
    });

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("GitWall/0.1"));
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", token))
            .map_err(|e| GithubError::Api(e.to_string()))?,
    );

    let client = reqwest::Client::builder()
        .default_headers(headers)
        .build()
        .map_err(|e| GithubError::Network(e.to_string()))?;

    let resp = client
        .post(GITHUB_GRAPHQL)
        .json(&body)
        .send()
        .await
        .map_err(|e| GithubError::Network(e.to_string()))?;

    let status = resp.status();
    if status == reqwest::StatusCode::UNAUTHORIZED {
        return Err(GithubError::AuthRequired);
    }
    if status == reqwest::StatusCode::FORBIDDEN {
        return Err(GithubError::RateLimited);
    }
    if !status.is_success() {
        return Err(GithubError::Api(format!("HTTP {}", status)));
    }

    let parsed: GqlResponse<UserData> = resp
        .json()
        .await
        .map_err(|e| GithubError::InvalidResponse(e.to_string()))?;

    if let Some(errors) = parsed.errors {
        let msg = errors
            .iter()
            .map(|e| e.message.clone())
            .collect::<Vec<_>>()
            .join("; ");
        // GitHub retorna "Could not resolve to a User" quando o user não existe.
        if msg.contains("Could not resolve to a User") {
            return Err(GithubError::UserNotFound(username.to_string()));
        }
        return Err(GithubError::Api(msg));
    }

    let user = parsed
        .data
        .and_then(|d| d.user)
        .ok_or_else(|| GithubError::UserNotFound(username.to_string()))?;

    let mut days: Vec<ContributionDayDto> = Vec::new();
    for week in user.contributions_collection.contribution_calendar.weeks {
        for d in week.contribution_days {
            days.push(ContributionDayDto {
                date: d.date,
                count: d.contribution_count,
                level: level_to_u8(&d.contribution_level),
            });
        }
    }

    Ok(ContributionPayload {
        user: UserProfile {
            login: user.login,
            name: user.name,
            avatar_url: user.avatar_url,
        },
        days,
        total: user
            .contributions_collection
            .contribution_calendar
            .total_contributions,
    })
}

fn level_to_u8(level: &str) -> u8 {
    match level {
        "NONE" => 0,
        "FIRST_QUARTILE" => 1,
        "SECOND_QUARTILE" => 2,
        "THIRD_QUARTILE" => 3,
        "FOURTH_QUARTILE" => 4,
        _ => 0,
    }
}