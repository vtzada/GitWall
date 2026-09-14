mod github;
mod secure_store;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            github::commands::fetch_contributions_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}