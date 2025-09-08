# Camera Viewer

Tauri 2.0とRustで構築されたクロスプラットフォーム対応のカメラ/画像表示デスクトップアプリケーション

## 機能

- 📹 Webカメラからの撮影
- 📸 画像のキャプチャ
- 📂 画像ファイルの読み込み（PNG, JPG, JPEG, GIF, BMP, WebP）
- 💾 画像の保存
- 🔄 画像のリサイズ
- 🖼️ 直感的なUI

## サポートプラットフォーム

- 🐧 Linux (Ubuntu 22.04+)
- 🍎 macOS (Intel & Apple Silicon)
- 🪟 Windows 10/11
- 📱 iOS (実験的サポート)

## 必要要件

### 開発環境

- Node.js 20+
- Rust (最新安定版)
- システム依存ライブラリ：

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev
```

#### macOS
```bash
# Homebrewが必要
xcode-select --install
```

#### Windows
```bash
# Visual Studio Build Tools が必要
```

## インストール

1. リポジトリをクローン：
```bash
git clone <repository-url>
cd camera_viewer
```

2. 依存関係をインストール：
```bash
npm install
```

3. Rustターゲットを追加（クロスコンパイル用）：
```bash
# macOS用
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Windows用
rustup target add x86_64-pc-windows-msvc

# iOS用
rustup target add aarch64-apple-ios x86_64-apple-ios
```

## 使用方法

### 開発モード

```bash
npm run tauri:dev
```

### プロダクションビルド

```bash
npm run tauri:build
```

### プラットフォーム別ビルド

```bash
# Windows
npm run tauri:build -- --target x86_64-pc-windows-msvc

# macOS Intel
npm run tauri:build -- --target x86_64-apple-darwin

# macOS Apple Silicon
npm run tauri:build -- --target aarch64-apple-darwin

# Linux
npm run tauri:build -- --target x86_64-unknown-linux-gnu
```

### iOS開発

```bash
# iOS初期化
npm run tauri ios init

# iOS開発モード
npm run tauri ios dev

# iOSビルド
npm run tauri ios build
```

## プロジェクト構造

```
camera_viewer/
├── src/                    # フロントエンドソース
│   └── main.js            # メインJavaScript
├── src-tauri/             # Rustバックエンド
│   ├── src/
│   │   └── main.rs        # Rustメインコード
│   ├── Cargo.toml         # Rust依存関係
│   └── tauri.conf.json    # Tauri設定
├── .github/
│   └── workflows/
│       └── build.yml      # CI/CDパイプライン
├── index.html             # メインHTML
├── vite.config.js         # Viteビルド設定
└── package.json           # Node.js設定
```

## GitHub Actions CI/CD

このプロジェクトはGitHub Actions v2を使用して、以下のプラットフォーム向けの自動ビルドを提供します：

- Ubuntu 22.04 (x86_64)
- macOS (Intel & Apple Silicon)
- Windows (x86_64)

### リリース作成

1. バージョンタグをプッシュ：
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. GitHub Actionsが自動的に全プラットフォーム向けのバイナリを生成
3. リリースページにアーティファクトが自動アップロード

## カメラ権限

### macOS
- システム設定 > プライバシーとセキュリティ > カメラ

### Windows
- 設定 > プライバシー > カメラ

### iOS
- 設定 > プライバシー > カメラ

## トラブルシューティング

### カメラが認識されない
1. 他のアプリでカメラが使用されていないか確認
2. ブラウザの権限設定を確認
3. システムレベルでの権限を確認

### ビルドエラー
1. Rust toolchain のアップデート：
```bash
rustup update
```

2. Node modules の再インストール：
```bash
rm -rf node_modules package-lock.json
npm install
```

## ライセンス

MIT License

## 貢献

1. Forkする
2. feature ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES2021)
- **バックエンド**: Rust
- **フレームワーク**: Tauri 2.0
- **ビルドツール**: Vite 5.0
- **CI/CD**: GitHub Actions v2
- **画像処理**: image crate (Rust)
- **UI**: カスタムCSS with Backdrop Filter