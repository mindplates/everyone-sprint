import moment from 'moment';
import store from '@/store';
import { DATE_FORMATS } from '@/constants/constants';

function getDateString(val, isUtc = true) {
  const state = store.getState();

  if (isUtc) {
    return moment
      .utc(val)
      .local()
      .format(DATE_FORMATS[state.user.country || 'KR'].moment);
  }

  return moment(val).format(DATE_FORMATS[state.user.country || 'KR'].moment);
}

function getDateValue(val, isUtc = true) {
  if (isUtc) {
    return moment.utc(val).local().valueOf();
  }

  return moment(val).valueOf();
}

const dateUtil = {
  getDateString,
  getDateValue,
};

export default dateUtil;
