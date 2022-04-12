export const SET_USER = 'SET_USER';
export const SET_MESSAGE = 'SET_MESSAGE';
export const CLEAR_MESSAGE = 'CLEAR_ALL_MESSAGE';
export const SET_SUPPORTED = 'SET_SUPPORTED';
export const SET_LOADING = 'SET_LOADING';
export const ADD_LOADING = 'ADD_LOADING';
export const REMOVE_LOADING = 'REMOVE_LOADING';
export const SET_CONFIRM = 'SET_CONFIRM';
export const SET_SYSTEM_INFO = 'SET_SYSTEM_INFO';
export const SET_SETTING = 'SET_SETTING';
export const SET_SPACE = 'SET_SPACE';
export const SET_HISTORY = 'SET_HISTORY';


export function setSpaceInfo(space) {
  return {
    type: SET_SPACE,
    space,
  };
}

export function setUserInfo(user) {
  return {
    type: SET_USER,
    user,
  };
}

export function setMessage(category, title, content, okHandler) {
  return {
    type: SET_MESSAGE,
    category,
    title,
    content,
    okHandler,
  };
}

export function clearMessage() {
  return {
    type: CLEAR_MESSAGE,
  };
}

export function setSupported(value) {
  return {
    type: SET_SUPPORTED,
    supported: value,
  };
}

export function setLoading(loading) {
  return {
    type: SET_LOADING,
    loading,
  };
}

export function addLoading(id, text) {
  return {
    type: ADD_LOADING,
    id,
    text,
  };
}

export function removeLoading(id) {
  return {
    type: REMOVE_LOADING,
    id,
  };
}

export function setSystemInfo(systemInfo) {
  return {
    type: SET_SYSTEM_INFO,
    systemInfo,
  };
}

export function setSetting(key, value) {
  return {
    type: SET_SETTING,
    key,
    value,
  };
}

export function setHistory(history) {
  return {
    type: SET_HISTORY,
    history,
  };
}

export function setConfirm(category, title, content, okHandler, noHandler) {
  return {
    type: SET_CONFIRM,
    category,
    title,
    content,
    okHandler,
    noHandler,
  };
}
