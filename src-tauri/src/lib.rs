use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_autostart::ManagerExt;

mod commands;
mod github;
mod secure_store;
mod wallpaper;

/// Estado global: estamos em modo wallpaper agora?
pub(crate) static WALLPAPER_MODE: AtomicBool = AtomicBool::new(false);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            // === Auto-start status log ===
            let autolaunch = app.autolaunch();
            if let Ok(enabled) = autolaunch.is_enabled() {
                println!("[autostart] status inicial: {enabled}");
            }

            // === Tray ===
            let settings_item =
                MenuItem::with_id(app, "settings", "Configurações", true, None::<&str>)?;
            let toggle_wallpaper = MenuItem::with_id(
                app,
                "toggle",
                "Alternar modo wallpaper",
                true,
                None::<&str>,
            )?;
            let quit_item = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&settings_item, &toggle_wallpaper, &quit_item])?;

            TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "settings" => {
                        if let Some(w) = app.get_webview_window("main") {
                            if WALLPAPER_MODE.load(Ordering::Relaxed) {
                                if let Err(e) = crate::commands::detach_wallpaper_impl(&w) {
                                    eprintln!("[tray] detach antes de mostrar falhou: {e}");
                                } else {
                                    WALLPAPER_MODE.store(false, Ordering::Relaxed);
                                    let _ = app.emit("wallpaper-mode", false);
                                }
                            }
                            let _ = w.show();
                            let _ = w.set_focus();
                            let _ = app.emit("open-settings", ());
                        }
                    }
                    "toggle" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let in_wallpaper = WALLPAPER_MODE.load(Ordering::Relaxed);
                            let result = if in_wallpaper {
                                crate::commands::detach_wallpaper_impl(&w)
                            } else {
                                crate::commands::attach_wallpaper_impl(&w)
                            };
                            match result {
                                Ok(()) => {
                                    let new_mode = !in_wallpaper;
                                    WALLPAPER_MODE.store(new_mode, Ordering::Relaxed);
                                    let _ = app.emit("wallpaper-mode", new_mode);
                                }
                                Err(e) => eprintln!("[tray] toggle falhou: {e}"),
                            }
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            if WALLPAPER_MODE.load(Ordering::Relaxed) {
                                if crate::commands::detach_wallpaper_impl(&w).is_ok() {
                                    WALLPAPER_MODE.store(false, Ordering::Relaxed);
                                    let _ = app.emit("wallpaper-mode", false);
                                }
                            }
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            github::commands::fetch_contributions_cmd,
            commands::attach_wallpaper,
            commands::detach_wallpaper,
            commands::store_credentials,
            commands::get_stored_credentials,
            commands::delete_stored_credentials,
            commands::save_cached_contributions,
            commands::get_cached_contributions,
            commands::set_autostart,
            commands::get_autostart,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}