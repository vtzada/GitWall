use std::sync::atomic::Ordering;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use tauri_plugin_autostart::ManagerExt;
use windows::Win32::Foundation::HWND;
use crate::github::types::ContributionPayload;
use crate::secure_store::{self, CredentialsPayload};
use crate::wallpaper;

pub fn hwnd_of(window: &WebviewWindow) -> Result<HWND, String> {
    let raw = window.hwnd().map_err(|e| e.to_string())?.0;
    Ok(HWND(raw as _))
}

/// Anexa a janela ao wallpaper. Chamável de Rust ou do front (via IPC).
pub fn attach_wallpaper_impl(window: &WebviewWindow) -> Result<(), String> {
    let hwnd = hwnd_of(window)?;
    wallpaper::attach_to_desktop(hwnd)
}

/// Destaca a janela do wallpaper.
pub fn detach_wallpaper_impl(window: &WebviewWindow) -> Result<(), String> {
    let hwnd = hwnd_of(window)?;
    wallpaper::detach_from_desktop(hwnd)
}

// ===== Comandos IPC (chamados pelo front via invoke) =====

#[tauri::command]
pub async fn attach_wallpaper(window: WebviewWindow) -> Result<(), String> {
    attach_wallpaper_impl(&window)?;
    crate::WALLPAPER_MODE.store(true, Ordering::Relaxed);
    let _ = window.emit("wallpaper-mode", true);
    Ok(())
}

#[tauri::command]
pub async fn detach_wallpaper(window: WebviewWindow) -> Result<(), String> {
    detach_wallpaper_impl(&window)?;
    crate::WALLPAPER_MODE.store(false, Ordering::Relaxed);
    let _ = window.emit("wallpaper-mode", false);
    Ok(())
}

#[tauri::command]
pub async fn store_credentials(username: String, token: String) -> Result<(), String> {
    secure_store::save_credentials(&username, &token)
}

#[tauri::command]
pub async fn get_stored_credentials() -> Result<Option<CredentialsPayload>, String> {
    secure_store::get_credentials()
}

#[tauri::command]
pub async fn delete_stored_credentials() -> Result<(), String> {
    secure_store::delete_credentials()
}

#[tauri::command]
pub async fn save_cached_contributions(
    app: AppHandle,
    payload: ContributionPayload,
) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let file = dir.join("contributions_cache.json");
    let content = serde_json::to_string(&payload).map_err(|e| e.to_string())?;
    std::fs::write(file, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_cached_contributions(
    app: AppHandle,
) -> Result<Option<ContributionPayload>, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file = dir.join("contributions_cache.json");
    if !file.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(file).map_err(|e| e.to_string())?;
    let payload: ContributionPayload = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(Some(payload))
}

#[tauri::command]
pub async fn set_autostart(app: AppHandle, enable: bool) -> Result<bool, String> {
    let autolaunch = app.autolaunch();
    if enable {
        autolaunch.enable().map_err(|e| e.to_string())?;
    } else {
        autolaunch.disable().map_err(|e| e.to_string())?;
    }
    autolaunch.is_enabled().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_autostart(app: AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}