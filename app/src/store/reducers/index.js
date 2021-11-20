import { combineReducers } from 'redux';
import {
  CLEAR_MESSAGE,
  SET_CONFIRM,
  SET_LOADING,
  SET_MESSAGE,
  SET_SUPPORTED,
  SET_SYSTEM_INFO,
  SET_USER_AND_GRP,
} from '../actions';

const userState = {
  user: null,
  grpId: null,
  grps: [],
  shareCount: 0,
  join: {
    email: null,
  },
  weather: 'sunny',
};

const user = (state = userState, action) => {
  const currentState = { ...state };

  switch (action.type) {
    case SET_USER_AND_GRP:
      return {
        ...state,
        user: { ...action.user, isAdmin: action.user.activeRoleCode === 'SUPER_MAN' },
        grps: action.grps,
        shareCount: action.shareCount,
      };

    default:
      return state;
  }
};

const messageState = {
  category: null,
  title: null,
  content: null,
  okHandler: null,
};

const message = (state = messageState, action) => {
  switch (action.type) {
    case SET_MESSAGE:
      return {
        ...state,
        category: action.category,
        title: action.title,
        content: action.content,
        okHandler: action.okHandler,
      };

    case CLEAR_MESSAGE:
      return { category: null, title: null, content: null, okHandler: null };

    default:
      return state;
  }
};

const loadingState = {
  loading: false,
};

const loading = (state = loadingState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.loading };
    default:
      return state;
  }
};

const confirmState = {
  category: null,
  title: null,
  content: null,
  okHandler: null,
  noHandler: null,
};

const confirm = (state = confirmState, action) => {
  switch (action.type) {
    case SET_CONFIRM:
      return {
        ...state,
        category: action.category,
        title: action.title,
        content: action.content,
        okHandler: action.okHandler,
        noHandler: action.noHandler,
      };
    default:
      return state;
  }
};

const supportedState = {
  supported: true,
};

const supported = (state = supportedState, action) => {
  switch (action.type) {
    case SET_SUPPORTED:
      return { ...state, supported: action.supported };
    default:
      return state;
  }
};

const systemInfoState = {
  version: '',
};

const systemInfo = (state = systemInfoState, action) => {
  switch (action.type) {
    case SET_SYSTEM_INFO:
      return { ...state, ...action.systemInfo };
    default:
      return state;
  }
};

const reducers = combineReducers({
  supported,
  user,
  message,
  loading,
  confirm,
  systemInfo,
});

export default reducers;
