# progLearning bot

progLearning の bot

TypeScript, Node.js, discord.js, slack/bolt, slack/web-api, Heroku で作成

環境構築参考：https://typescript-jp.gitbook.io/deep-dive/nodejs

## 使い方

### 依存環境の install

```sh
yarn install
```

### 起動

```sh
yarn dev
```

### 本番ログの監視

```sh
heroku logs --tail -a proglearning-bot
```

## 備考

TypeScript で絶対パスを使用するために`tsconfig-paths`を install して

```sh
ts-node -r tsconfig-paths/register
```

を叩いている
