# あかりクエスト｜iPad用 第1〜第3ミッション Netlify Free 試遊版の公開手順

- 対象 Draft PR: https://github.com/stusaurus/rika-quest/pull/39
- 統合全14面の本体はPR #39内に保持。公開対象は**第1〜第3ミッションだけ**。
- 独立したNetlifyサイト: https://app.netlify.com/projects/akari-quest-three-review
- Netlify project ID: `15caa087-4154-4481-b7ba-14659f2eb1ac`
- Account: `stusaurus`、Netlify team plan `Free` を確認済み
- 無料プランを超える課金・有料移行はしない
- URLを知る者は閲覧・転送可。匿名閲覧設定。**検索除外は認証・アクセス制限ではない**
- `main`、本番ゲーム、既存の第1ミッション公開ページ、Draft PR #35〜#38は変更しない

## 配布物の生成

```bash
node scripts/build-akari-workshops.mjs
node scripts/build-akari-netlify-three.mjs
```

出力: `artifacts/netlify-akari-three/`

`index.html` は第1〜第3の範囲を制限した実操作可能な単体HTML。`akari-missions-1-3.html` は同一バイトのダウンロード版。`robots.txt`、`_headers` はインデックス除外、リファラの抑止、キャッシュ制限を指定。`build-manifest.json` はHTMLのSHA-256とスコープを記録。

通常版とは異なる保存キー `rika-akari-three-netlify-v1` を使う。児童名・メールアドレス入力、分析タグ・広告は追加しない。学習の進行状況のみブラウザ内のlocalStorageに保存。

## 自動試遊テスト

```bash
ENGINE=chromium WIDTH=390 node scripts/test-akari-netlify-three.mjs
ENGINE=webkit WIDTH=768 node scripts/test-akari-netlify-three.mjs
```

GitHub Actions `Village workshop review` の `trial-three` ジョブでChromium/WebKitの390・768pxを検証。実際のUIで第1→第2→第3をクリアし、理由の正答、セーブ、再試遊、4以降への到達禁止、外部HTTP通信ゼロ、noindexなどを検証。全14ミッションの既存統合テストも並走。

**CI全成功前に新サイトへ配布しない。**

## Netlifyへの反映

当チャットが使用できる接続ツールはサイト作成・閲覧・アクセス制御が可能だが、サイトのHTMLデプロイ操作は提供されていない。したがって、サイト作成だけで「公開済み」と見なさない。

CIで `netlify-akari-three-static` 成果物ができたら、GitHub ActionsからZIPを取得し、展開したフォルダをNetlify管理画面のDeploysにドラッグ＆ドロップする（`index.html` と `_headers`、`robots.txt` が同じルートに置かれること）。ドラッグ操作が必要な場合のみユーザーにその一回の操作を依頼する。

新サイトの`currentDeploy`が`ready`であることを確認するまでは公開完了と報告しない。

## 公開後の必須検証

1. Cookieゼロの匿名ブラウザでHTTPSの試遊URLへアクセス可能
2. コンテンツが想定したハッシュで配布されている（少なくとも`index.html`と配布HTMLが同一）
3. 第1→第2→第3の完走、4以降の画面への移動禁止、独立した保存と再読み込み
4. `robots.txt`、`X-Robots-Tag`、HTML `noindex` の実応答
5. 第1〜第3のみ公開、外部分析タグなし、入力個人情報なし
6. **実機**iPad Safariのタップ・ドラッグ・スクロール・音声・画面回転を確認。WebKitエミュレーションとは区別
7. 児童の初見試遊は実施時のみ記録する

## 状態
- NetlifyチームFree、独立サイト作成、匿名閲覧設定は済み
- ゲーム本体のアップロードと公開後検証は未実施
