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
const createStatusBody = (event: CalendarEvent): SlackStatus => {
  // 整形した開始時刻・終了時刻
  const start = dayjs(event.getStartTime().getDate()).format('HH:mm');
  const end = dayjs(event.getEndTime().getDate()).format('HH:mm');
  // ステータステキスト
  const text = `${event.getTitle()} (${start}〜${end})`;

  const isMTG = event.getGuestList().length > 0;
  if (isMTG) {
    return {
      profile: {
        status_text: text,
        status_emoji: ':google_meet_new:',
      },
    };
  }

  const isVacation = event.getTitle().includes('休暇');
  if (isVacation) {
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
  const headers = {
    Authorization: `Bearer ${SLACK_TOKEN}`,
  };

  const option: URLFetchRequestOptions = {
    contentType: 'application/json; charset=utf-8',
    headers,
    method: 'post',
    payload: JSON.stringify(status),
  };
  const res = UrlFetchApp.fetch(URL, option);
  if (JSON.parse(res.getContentText()).ok) {
    console.log('success');
    return;
  }
  console.log('failed');
  console.log(
    `debug: ${res.getResponseCode()} ${res.getContentText()} ${JSON.stringify(
      status
    )}`
  );
};

export const main = () => {
  const date = dayjs();
  const events = CalendarApp.getCalendarById(GCAL_ID).getEventsForDay(
    date.toDate()
  );

  if (events.length === 0) {
    return;
  }
  const target = events.find(
    e =>
      date.isAfter(dayjs(e.getStartTime().getDate())) &&
      date.isBefore(dayjs(e.getEndTime().getDate()))
  );
  const status = target ? createStatusBody(target) : default_status;
  postSlackStatus(status);
};
