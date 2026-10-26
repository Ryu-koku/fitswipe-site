# FitSwipe site

「筋トレ入力を、サクッとスワイプ。」を伝える日本語のLP。Astro＋TypeScriptによる静的サイトです。アプリや共有APIには接続せず、アクセス解析・フォーム・外部フォント配信は使いません。自サイト配信の小さなスクリプトだけで、スクロール時の表示モーションを付けています。

## 開発

Node.js 24（`.node-version`）とpnpm 11を使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm check
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

既存のChromiumを使う場合：

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium pnpm test:e2e
```

## 構成

```text
src/pages/         紹介・データの扱い・サポート・404
src/components/    ブランド、機能説明図、ストア案内、フッター
src/layouts/       メタ情報と共通レイアウト
src/styles/        緑のポップなUIとレスポンシブ対応
src/scripts/       スクロール時のフェードイン（依存ライブラリなし）
src/lib/           設定と公開先URLの検証
public/            アイコン、共有用画像、Cloudflare用ヘッダー
tests/             設定の単体テスト、ブラウザテスト
docs/              合意済みの方針と公開前チェック
```

## 設定

### スクロール時のモーション

機能紹介・見出し・質問・配布案内は、画面内に入ると28px下から650msで一度だけフェードインします。最初から画面内の内容は隠しません。JavaScript無効・読み込み失敗・IntersectionObserver非対応時は全内容を表示し、「視差効果を減らす」設定ではモーションを無効にします。キーボードでのフォーカスと印刷時も内容を隠しません。

CloudflareのCSPは `script-src 'self'` に限定し、インラインスクリプトや外部JavaScriptを許可しません。JavaScriptはHTMLの基本機能に必要ではありません。

### 配布先と公開設定

`.env.example` を参考に必要な値を設定してから再ビルドします（すべて公開される情報。秘密情報を入れない）。

| 変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `PUBLIC_APP_STORE_URL` | 確認済みのApp Storeアプリ詳細URL | リンク無効・確認中表示 |
| `PUBLIC_GOOGLE_PLAY_URL` | 確認済みのGoogle Playアプリ詳細URL | リンク無効・確認中表示 |
| `PUBLIC_SUPPORT_EMAIL` | 承認済みの問い合わせ先 | 窓口準備中 |
| `PUBLIC_SITE_URL` | 本番のHTTPSオリジン | canonical・OG画像URLなし |
| `PUBLIC_INDEXABLE` | `true` で検索登録を許可 | `noindex, nofollow` |

ストアURLは公式ドメイン上のHTTPSアプリ詳細ページのみ受け付け、不正な値はビルドを失敗させます。ただしURL形式の検証は、実際の掲載やアプリ所有者の確認の代わりにはなりません。ストアの片方だけが公開済みの場合、その片方だけ有効になります。

現在のストア欄は独自デザインで、公式バッジではありません。正式な配布時に各ストアのブランド規約と掲載状態を確認してください。OG画像は `public/social.png`（1200×630）で、編集元は `public/social.svg` です。SVG変更時はPNGも書き出し直してください。

## Cloudflare Pages

静的な `dist/` を配信するため、SSRアダプターやサーバーは不要です。

- Gitリポジトリ：`Ryu-koku/fitswipe-site`
- ビルドコマンド：`pnpm build`
- 出力ディレクトリ：`dist`
- Node：24.16.0（必要ならPagesの`NODE_VERSION`にも設定）
- `PUBLIC_*` の環境変数：上記の確認済み値を設定
- カスタムドメイン：所有と設定権限を確認してから設定

CloudflareのGit連携には、この非公開リポジトリへのアクセスを許可してください。自動公開は、コミット・push・Pages連携を行った後に始まります。この作業ではまだ公開していません。

現行Astroの資料では新規CloudflareプロジェクトにWorkersも推奨されていますが、今回は合意済みのPages向けに、どちらでも配信できる静的出力だけを生成します。

## 公開前

`docs/release-checklist.md` を確認してください。特に一般配布URL、共有機能の設定・動作、問い合わせ先、正式なプライバシーポリシーは未確認です。準備中ページを正式なアプリの法的文書として公開しないでください。

参考：[AstroのCloudflareガイド](https://docs.astro.build/en/guides/deploy/cloudflare/) / [Cloudflare PagesのAstroガイド](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
