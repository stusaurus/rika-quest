# Rika Quest — 理科を、冒険に。

小学生が遊びながら科学の法則を発見できるゲームを集約するサイトです。

**公開サイト**: https://stusaurus.github.io/rika-quest/

## 現在遊べるゲーム

- [フリコ・クエスト v0.36](https://stusaurus.github.io/rika-quest/games/furiko/) — 21ステージ・49問・2ボス（開発中）

## 今後の追加予定

電流、天体、天気、水溶液、植物など、単元ごとに最適なゲームを順次制作します。現時点で未公開の単元はトップページに「準備中」と表示しています。

## 開発構成

- `index.html` — ゲーム一覧のトップページ
- `games/furiko/index.html` — フリコ・クエストの起動ページ
- `games/furiko/manifest.json` — 現行ゲームの分割ファイル情報
- `games/furiko/parts/` — v0.36 のゲーム本体（GitHub連携の転送制約に対応した24ファイル）
- `scripts/check-game.mjs` — ゲーム本体の欠落・JavaScript構文検証
- `.github/workflows/deploy-pages.yml` — 公開前検証とGitHub Pagesへの自動デプロイ

## 次のゲームの追加方法

新規単元は `games/<unit-slug>/` に独立したゲームを配置し、トップページのカードからリンクします。各ゲームのルールや状態管理を独立させ、サイト共通の入口だけ統一します。

## 動作環境

ゲームはHTTPS経由でSafariなどのブラウザから開いてください。ChatGPTのHTMLプレビューや `file://` での動作は保証されません。

公開に失敗した場合はリポジトリの **Actions → Deploy Rika Quest to GitHub Pages** を確認してください。
