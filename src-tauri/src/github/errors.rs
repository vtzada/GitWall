use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum GithubError {
    #[error("Github token not configured")]
    AuthRequired,

    #[error("Github User '{0}' not found")]
    UserNotFound(String),

    #[error("GitHub API rate limit exceeded")]
    RateLimited,

    #[error("Network error: {0}")]
    Network(String),

    #[error("GitHub API error: {0}")]
    Api(String),

    #[error("Invalid response: {0}")]
    InvalidResponse(String),
}

#[derive(Debug, Serialize)]
#[serde(tag = "kind", content = "message")]
pub enum GithubErrorPayload {
    AuthRequired,
    UserNotFound(String),
    RateLimited,
    Network(String),
    Api(String),
    InvalidResponse(String),
}

impl From<GithubError> for GithubErrorPayload {
    fn from(e: GithubError) -> Self {
        match e {
            GithubError::AuthRequired => Self::AuthRequired,
            GithubError::UserNotFound(u) => Self::UserNotFound(u),
            GithubError::RateLimited => Self::RateLimited,
            GithubError::Network(m) => Self::Network(m),
            GithubError::Api(m) => Self::Api(m),
            GithubError::InvalidResponse(m) => Self::InvalidResponse(m),
        }
    }
}