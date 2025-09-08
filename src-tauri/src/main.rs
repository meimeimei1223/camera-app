#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
async fn load_image(path: String) -> Result<String, String> {
    match fs::read(&path) {
        Ok(contents) => {
            let base64_string = general_purpose::STANDARD.encode(&contents);
            let extension = std::path::Path::new(&path)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("png")
                .to_lowercase();
            
            let mime_type = match extension.as_str() {
                "jpg" | "jpeg" => "image/jpeg",
                "png" => "image/png",
                "gif" => "image/gif",
                "bmp" => "image/bmp",
                "webp" => "image/webp",
                _ => "image/png",
            };
            
            Ok(format!("data:{};base64,{}", mime_type, base64_string))
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn save_image(data: String, path: String) -> Result<(), String> {
    let parts: Vec<&str> = data.split(',').collect();
    if parts.len() != 2 {
        return Err("Invalid data URL".to_string());
    }
    
    match general_purpose::STANDARD.decode(parts[1]) {
        Ok(decoded) => {
            fs::write(path, decoded).map_err(|e| e.to_string())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn resize_image(data: String, width: u32, height: u32) -> Result<String, String> {
    let parts: Vec<&str> = data.split(',').collect();
    if parts.len() != 2 {
        return Err("Invalid data URL".to_string());
    }
    
    let decoded = general_purpose::STANDARD
        .decode(parts[1])
        .map_err(|e| e.to_string())?;
    
    let img = image::load_from_memory(&decoded)
        .map_err(|e| e.to_string())?;
    
    let resized = img.resize(width, height, image::imageops::FilterType::Lanczos3);
    
    let mut output = Vec::new();
    resized.write_to(&mut std::io::Cursor::new(&mut output), image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    
    let base64_string = general_purpose::STANDARD.encode(&output);
    Ok(format!("data:image/png;base64,{}", base64_string))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            load_image,
            save_image,
            resize_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}