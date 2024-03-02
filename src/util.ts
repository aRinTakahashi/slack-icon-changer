export const setTrigger = () => {
  const min = 5;
  ScriptApp.newTrigger('main').timeBased().everyMinutes(min).create();
  console.log(`🐛 debug: ${min}分間隔で実行するようにトリガーを設定しました`);
};
