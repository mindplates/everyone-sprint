import moment from 'moment';
import store from '@/store';
import { DATE_FORMATS, DATE_FORMATS_TYPES, TIMEZONES } from '@/constants/constants';

function getUserLocale() {
  const state = store.getState();
  return `${state.user.language || 'ko'}_${state.user.country || 'KR'}`;
}

/**
 * 서버의 UTC 시간을 사용자 시간에 맞도록 표현
 * @param val
 * @param format
 * @returns {string}
 */
function getDateString(val, format) {
  return moment
    .utc(val)
    .local()
    .format(DATE_FORMATS[getUserLocale()][format || DATE_FORMATS_TYPES.full].moment);
}

function getLocalDateISOString(val) {
  return moment.utc(val).local().format('YYYY-MM-DD');
}

function getLocalDate(val) {
  return moment.utc(val).local();
}

function getDate(val) {
  return new Date(`${val}Z`);
}

/**
 * 서버 문자열을 사용자 시간의 time으로 변환
 * @param val
 * @returns {number}
 */
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

function getSpan(startDate, endDate) {
  const hours = Math.floor((endDate - startDate) / (1000 * 60 * 60));
  const days = hours > 0 ? Math.floor(hours / 24) : 0;
  return {
    days,
    hours: hours - days * 24,
  };
}

function getSpanHours(startDate, endDate, point) {
  if (point) {
    return (endDate - startDate) / (1000 * 60 * 60);
  }
  return Math.floor((endDate - startDate) / (1000 * 60 * 60));
}

function getTimeAtStartOfDay(dateString) {
  const today = new Date(Date.parse(dateString));
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today.getTime();
}

function getDurationMinutes(val, format) {
  return moment
    .utc(val)
    .local()
    .format(DATE_FORMATS[getUserLocale()][format || DATE_FORMATS_TYPES.minutes].moment);
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
  getSpan,
  getSpanHours,
  getUserLocale,
  getTimeAtStartOfDay,
  getLocalDateISOString,
  getDurationMinutes,
  getLocalDate,
};

export default dateUtil;
