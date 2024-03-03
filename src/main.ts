import dayjs from 'dayjs';
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import CalendarEvent = GoogleAppsScript.Calendar.Schema.Event;

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
  const end = dayjs(event.end?.dateTime).format('HH:mm');
  // ステータステキスト
  const text = `${event.summary} ${end}まで`;

  const isMTG = (event.attendees || []).length > 1;
  if (isMTG) {
    return {
      profile: {
        status_text: text,
        status_emoji: ':google_meet_new:',
      },
    };
  }

  const isVacation = event.eventType === 'outOfOffice';
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
    console.log('success', status.profile);
    return;
  }
  console.log('failed');
  console.log(
    `debug: ${res.getResponseCode()} ${res.getContentText()} ${status}`
  );
};

export const main = () => {
  const now = dayjs();
  const e = Calendar.Events?.list(GCAL_ID, {
    timeMin: now.startOf('d').toISOString(),
    timeMax: now.add(1, 'day').startOf('d').toISOString(),
    timeZone: 'JST',
    singleEvents: true,
    orderBy: 'startTime',
  });
  const target = e?.items?.find(item => {
    const start = item.start?.dateTime;
    const end = item.end?.dateTime;
    if (!start || !end) {
      return false;
    }
    return now.isAfter(start) && now.isBefore(end);
  });
  const status = target ? createStatusBody(target) : default_status;
  postSlackStatus(status);
};
