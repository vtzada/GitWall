use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE: &str = "gitwall";
const KEY_TOKEN: &str = "github_token";
const KEY_USER: &str = "github_username";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialsPayload {
    pub username: String,
    pub token: String,
}

pub fn save_credentials(username: &str, token: &str) -> Result<(), String> {
    Entry::new(SERVICE, KEY_USER)
        .map_err(|e| e.to_string())?
        .set_password(username)
        .map_err(|e| e.to_string())?;

    Entry::new(SERVICE, KEY_TOKEN)
        .map_err(|e| e.to_string())?
        .set_password(token)
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn get_credentials() -> Result<Option<CredentialsPayload>, String> {
    let user_entry = Entry::new(SERVICE, KEY_USER).map_err(|e| e.to_string())?;
    let username = match user_entry.get_password() {
        Ok(u) => u,
        Err(keyring::Error::NoEntry) => return Ok(None),
        Err(e) => return Err(e.to_string()),
    };

    let token_entry = Entry::new(SERVICE, KEY_TOKEN).map_err(|e| e.to_string())?;
    let token = match token_entry.get_password() {
        Ok(t) => t,
        Err(keyring::Error::NoEntry) => return Ok(None),
        Err(e) => return Err(e.to_string()),
    };

    Ok(Some(CredentialsPayload { username, token }))
}

pub fn delete_credentials() -> Result<(), String> {
    if let Ok(entry) = Entry::new(SERVICE, KEY_USER) {
        let _ = entry.delete_credential();
    }
    if let Ok(entry) = Entry::new(SERVICE, KEY_TOKEN) {
        let _ = entry.delete_credential();
    }
    Ok(())
}