import moment from 'moment';
import store from '@/store';
import { DATE_FORMATS } from '@/constants/constants';

function getDate(val, isUtc = true) {
  const state = store.getState();

  if (isUtc) {
    return moment
      .utc(val)
      .local()
      .format(DATE_FORMATS[state.user.country || 'KR'].moment);
  }

  return moment(val).format(DATE_FORMATS[state.user.country || 'KR'].moment);
}

const dateUtil = {
  getDate,
};

export default dateUtil;
