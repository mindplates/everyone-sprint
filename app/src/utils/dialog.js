import { setConfirm as setConfirmAction, setMessage as setMessageAction } from '@/store/actions';
import store from '@/store';

function setMessage(category, title, content, okHandler) {
  store.dispatch(setMessageAction(category, title, content, okHandler));
}

function clearMessage() {
  store.dispatch(setMessageAction(null, null, null, null));
}

function setConfirm(category, title, content, okHandler, noHandler) {
  store.dispatch(setConfirmAction(category, title, content, okHandler, noHandler));
}

function clearConfirm() {
  store.dispatch(setConfirmAction(null, null, null, null, null));
}

const dialog = {
  setMessage,
  clearMessage,
  setConfirm,
  clearConfirm,
};

export default dialog;
