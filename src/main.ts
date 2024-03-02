import dayjs from 'dayjs';
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;

type SlackStatus = {
  profile: {
    status_text: string;
    status_emoji: string;
    status_expiration?: number;
  };
};

const prop = PropertiesService.getScriptProperties().getProperties();
const SLACK_TOKEN = prop.SLACK_TOKEN;
const GCAL_ID = prop.GCAL_ID;
const default_status: SlackStatus = {
  profile: {
    status_text: '',
    status_emoji: '',
  },
};
const isMTG = (event: CalendarEvent) => event.getGuestList().length > 0;
const isVacation = (event: CalendarEvent) => event.getTitle().includes('休暇');
const createStatusText = (event: CalendarEvent): SlackStatus => {
  // 整形した開始時刻・終了時刻
  const start = dayjs(event.getStartTime().getDate()).format('HH:mm');
  const end = dayjs(event.getEndTime().getDate()).format('HH:mm');
  // ステータステキスト
  const text = `${event.getTitle()} (${start}〜${end})`;
  if (isMTG(event)) {
    return {
      profile: {
        status_text: text,
        status_emoji: ':google_meet_new:',
      },
    };
  }
  if (isVacation(event)) {
    return {
      profile: {
        status_text: text,
        status_emoji: ':yasumi:',
      },
    };
  }
  return default_status;
};

const postSlackStatus = (status: SlackStatus) => {
  const URL = 'https://slack.com/api/users.profile.set';
  // HTTPヘッダー
  const headers = {
    Authorization: 'Bearer ' + SLACK_TOKEN,
  };

  //POSTデータ
  const option: URLFetchRequestOptions = {
    contentType: 'application/json; charset=utf-8',
    headers,
    method: 'post',
    payload: JSON.stringify(status),
  };
  try {
    const res = UrlFetchApp.fetch(URL, option);
    console.log(
      `🐛 debug: ${res.getResponseCode()} ${res.getContentText()} ${JSON.stringify(
        status
      )}`
    );
  } catch (e) {
    console.error(e);
  }
};

export const main = () => {
  const date = dayjs().date(2).toDate();
  // カレンダーから今日の予定を取得
  const events = CalendarApp.getCalendarById(GCAL_ID).getEventsForDay(date);
  // 今日のイベントがない場合は何もしない
  if (events.length === 0) {
    return;
  }
  const target = events.find(
    e => e.getStartTime() <= date && e.getEndTime() >= date
  );
  const status = target ? createStatusText(target) : default_status;
  postSlackStatus(status);
};

export const test = () => {
  const status = {
    profile: {
      status_text: '',
      status_emoji: '',
    },
  };
  postSlackStatus(status);
};
