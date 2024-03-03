# slack-icon-changer

## 概要
SlackのカスタムステータスをGoogleカレンダーの予定に基づいて変更するGASスクリプトを作成する

## 機能
5分間隔でカスタムステータスを変更する

間隔はGASのページから変更可能

### テキスト
タイトル+終了時間をカスタムステータスのテキストに設定する
### 絵文字
* outOfOffice(不在)の場合、休みの絵文字
* 予定にゲストが存在する場合、GoogleMeetの絵文字
* それ以外の場合、カスタムステータスを空にする

## 使い方

```
git clone git@github.com:aRinTakahashi/slack-icon-changer.git
cd slack-icon-changer
```

1. packagesをインストールする
  ```bash
  yarn
  ```
2. claspにログインする
```bash
yarn clasp login
```

3. 新しいプロジェクトを作成する
```bash
yarn clasp create
```
4. root directoryに作られた `appscript.json`を削除する


5. `.clasp.json`に`rootDir`を追加する
```
{
  "scriptId":"xxxxxxxxxxxxx",
  "rootDir": "./dist" // !! Add this line !!
}
```

6. `yarn clasp login`したアカウントで以下のURLにアクセスし `Google Apps Script API` をONにする  

https://script.google.com/home/usersettings

7. プッシュする
```bash
yarn push
```

8. プッシュしたApps Scriptを開き、プロジェクトの設定からスクリプトプロパティに`GCAL_ID`と`SLACK_TOKEN`を追加する
![script_properties.png](img/script_properties.png)

9. Apps Scriptを開いてエディタから`setTrigger`関数を選択肢、実行ボタンを押下することで定期実行を設定する。
![trigger.png](img%2Ftrigger.png)

### SLACK_TOKENの取得方法
1. [Slack API](https://api.slack.com/apps)にアクセスする
2. `Create New App`を選択し、アプリを作成する
   * ダイアログは`From scratch`を選択する
   * `App Name`には任意の値を入力し、カスタムステータスを適用したいワークスペースを選択し、`Create App`を押下する
3. 左側の`OAuth & Permissions`を選択し、`Scopes`までスクロールする
4. `User Token Scopes`以下の`Add on OAuth Scope`を押下し、`users.profile:write`を追加する
5. `Install to Workspace`を押下し、アプリをワークスペースにインストールする
   * 権限のリクエスト画面が開く場合があるので、許可する
6. `OAuth Tokens for Your Workspace`に表示されるトークンをコピーし、スクリプトプロパティに設定する
### GCAL_IDの取得方法
1. [Googleカレンダー](https://calendar.google.com/calendar)にアクセスする
2. 左側のカレンダー一覧から参照したいカレンダーを選択し、`設定と共有`を選択する
3. カレンダーの設定画面が開くので、カレンダーの統合からカレンダーIDをコピーし、スクリプトプロパティに設定する
