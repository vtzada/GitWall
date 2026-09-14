use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GqlResponse<T> {
    pub data: Option<T>,
    pub errors: Option<Vec<GqlError>>,
}

#[derive(Debug, Deserialize)]
pub struct GqlError {
    pub message: String,
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UserData {
    pub user: Option<User>,
}

#[derive(Debug, Deserialize)]
pub struct User {
    pub login: String,
    pub name: Option<String>,
    #[serde(rename = "avatarUrl")]
    pub avatar_url: String,
    #[serde(rename = "contributionsCollection")]
    pub contributions_collection: ContributionsCollection,
}

#[derive(Debug, Deserialize)]
pub struct ContributionsCollection {
    #[serde(rename = "contributionCalendar")]
    pub contribution_calendar: ContributionCalendar,
}

#[derive(Debug, Deserialize)]
pub struct ContributionCalendar {
    #[serde(rename = "totalContributions")]
    pub total_contributions: u32,
    pub weeks: Vec<Week>,
}

#[derive(Debug, Deserialize)]
pub struct Week {
    #[serde(rename = "contributionDays")]
    pub contribution_days: Vec<ContributionDayRaw>,
}

#[derive(Debug, Deserialize)]
pub struct ContributionDayRaw {
    pub date: String, // "YYYY-MM-DD"
    #[serde(rename = "contributionCount")]
    pub contribution_count: u32,
    #[serde(rename = "contributionLevel")]
    pub contribution_level: String, // "NONE" | "FIRST_QUARTILE" | ...
}

#[derive(Debug, Serialize)]
pub struct ContributionPayload {
    pub user: UserProfile,
    pub days: Vec<ContributionDayDto>,
    pub total: u32,
}

#[derive(Debug, Serialize)]
pub struct UserProfile {
    pub login: String,
    pub name: Option<String>,
    pub avatar_url: String,
}

#[derive(Debug, Serialize)]
pub struct ContributionDayDto {
    pub date: String,
    pub count: u32,
    pub level: u8, // 0..4
}