import moment from 'moment';
import store from '@/store';
import { DATE_FORMATS, DATE_FORMATS_TYPES, TIMEZONES } from '@/constants/constants';

function getDateString(val, format) {
  const state = store.getState();

  return moment
    .utc(val)
    .local()
    .format(DATE_FORMATS[state.user.country || 'KR'][format || DATE_FORMATS_TYPES.full].moment);
}

function getDate(val) {
  return new Date(`${val}Z`);
}

function getTime(val) {
  return getDate(val).getTime();
}

function isSameDay(val1, val2) {
  return val1.getFullYear() === val2.getFullYear() && val1.getMonth() === val2.getMonth() && val1.getDate() === val2.getDate();
}

function getToday() {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today;
}

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function getTruncateDate(val) {
  val.setHours(0);
  val.setMinutes(0);
  val.setSeconds(0);
  val.setMilliseconds(0);
  return val;
}

function addDays(val, days) {
  val.setDate(val.getDate() + days);
  return val;
}

function getUserTimeInfo() {
  const state = store.getState();
  if (!TIMEZONES[state.user.timezone]) {
    return TIMEZONES['Asia/Seoul'];
  }

  return TIMEZONES[state.user.timezone];
}

function getUserOffsetHours() {
  const timezone = getUserTimeInfo();
  return timezone.dir * timezone.hours;
}

function getUserOffsetMinutes() {
  const timezone = getUserTimeInfo();
  return timezone.dir * timezone.minutes;
}

const dateUtil = {
  getDateString,
  getDate,
  getTime,
  isSameDay,
  getToday,
  getTomorrow,
  getTruncateDate,
  addDays,
  getUserTimeInfo,
  getUserOffsetHours,
  getUserOffsetMinutes,
};

export default dateUtil;
