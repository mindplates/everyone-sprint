import moment from 'moment';
import store from '@/store';
import { DATE_FORMATS, DATE_FORMATS_TYPES } from '@/constants/constants';

function getDateString(val, format, isUtc = true) {
  const state = store.getState();

  if (isUtc) {
    return moment
      .utc(val)
      .local()
      .format(DATE_FORMATS[state.user.country || 'KR'][format || DATE_FORMATS_TYPES.full].moment);
  }

  return moment(val).format(DATE_FORMATS[state.user.country || 'KR'][format || DATE_FORMATS_TYPES.full].moment);
}

function getDate(val, isUtc = true) {
  if (isUtc) {
    return new Date(moment.utc(val).local().valueOf());
  }

  return new Date(moment(val).valueOf());
}

function getTime(val, isUtc = true) {
  if (isUtc) {
    return moment.utc(val).local().valueOf();
  }

  return moment(val).valueOf();
}

function isSameDay(val1, val2) {
  return (
    val1.getFullYear() === val2.getFullYear() &&
    val1.getMonth() === val2.getMonth() &&
    val1.getDate() === val2.getDate()
  );
}

const dateUtil = {
  getDateString,
  getDate,
  getTime,
  isSameDay,
};

export default dateUtil;
