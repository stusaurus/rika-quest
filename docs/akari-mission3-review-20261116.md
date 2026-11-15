# 第3ミッション・制作と検証記録

- ベース: PR #36 `art/akari-mission2-painted-20261113` / `f3610104f7de997b18bc048e9a6377fa0d57dcdd`。
- PR #35 HEAD: `0fd04c4c74df24a672583074936856fc8f55aa95`。#36はこのブランチを含む積み上げDraft。両方の最新CI成功を確認。
- 新ブランチ: `feat/akari-mission3-materials-20261116`。変更は `?visual=painted` の第3ミッションに限定。既存の標準14ミッションは維持。
- 材料は鉄のクリップ、アルミ板、乾いた木、プラスチック。共通画像を発見・所持・ドラッグ・取付に利用。
- 比較する変数を材料1つにそろえるため、切れ目を1か所に整理。両接点が触れ、基準配線がある実験だけ性質の比較記録へ残す。
- 材料の性質と実際の回路グラフから点灯・消灯・ショートを判定。予想の誤りは減点しない。導体と不導体の両方を試してから理由を選ぶ。
- 配線・切断・ハサミ・短絡の既存機能と画像演出を共用。第1ミッションの公開Siteは変更しない。
- 文科省の電気の通り道（物とつなぎ方を比較する活動）に沿う。乾いた木・無塗装の金属という条件を明示する。
  https://www.mext.go.jp/component/a_menu/education/micro_detail/__icsFiles/afieldfile/2019/03/18/1387017_005_1.pdf
- Pointer Events、pointer capture、touch-actionで材料を移動。タップ選択→予想→切れ目タップの代替操作もある。
  https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Using_Pointer_Events
- 実機iPhone Safari、児童の初見試遊は未実施。WebKitのタッチドラッグは合成PointerEvents、ChromiumはCDPのタッチ入力を使用して区別する。
- ローカルのブラウザ起動はOSのsocket制限で不成立。ブラウザ実操作・スクリーンショット確認はGitHub ActionsのPlaywright環境で実施する。
- mainマージ・本番・公開済み第1ミッションSite変更は禁止。新規公開は行わず、HTMLを受け渡す。

## 進行中

モデル10件、既存理科判定17件、14ミッション回帰を実行。ブラウザQA・美術検証結果は追記予定。初回Draftは検証中として扱う。
