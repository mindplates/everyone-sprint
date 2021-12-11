import axios from 'axios';
import i18n from 'i18next';
import store from '@/store';
import storage from '@/utils/storage';
import { addLoading, removeLoading, setLoading, setUserInfo } from '@/store/actions';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import dialog from '@/utils/dialog';

const loadingTime = 500;

const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

const local = ['localhost', '127.0.0.1', '192.168.39.3'].some((d) => d === window.location.hostname);

const logging = true;
// eslint-disable-next-line no-nested-ternary
let base = local
  ? window.location.hostname === '192.168.39.3'
    ? 'http://192.168.39.3:15000'
    : 'http://localhost:15000'
  : '';
base = window.location.port === '5000' ? `http://${window.location.hostname}:15000` : '';

function getBase() {
  return base;
}

function beforeRequest(showLoading, uri, method) {
  if (logging) {
    // eslint-disable-next-line no-console
    console.log(`${method} ${uri}`);
  }
  if (showLoading) {
    if (typeof showLoading === 'string') {
      store.dispatch(addLoading(showLoading, showLoading));
    } else {
      store.dispatch(setLoading(true));
    }
  }

  const token = storage.getItem('auth', 'token');
  if (!axiosConfig.headers.Token && token) {
    axiosConfig.headers.Token = token;
  }

  if (axiosConfig.headers.Token && !token) {
    delete axiosConfig.headers.Token;
  }
}

function processSuccess(response, successHandler) {
  if (logging) {
    // eslint-disable-next-line no-console
    console.log(response);
  }

  if (successHandler && typeof successHandler === 'function') {
    try {
      successHandler(response.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dialog.setMessage(MESSAGE_CATEGORY.ERROR, '동작 오류', '스크립트 동작 중 오류가 발생했습니다.');
    }
  }
}

function processError(error, failHandler) {
  if (logging && error.response) {
    // eslint-disable-next-line no-console
    console.log(error.response);
  } else if (logging && error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }

  let completeHandliing = false;
  if (failHandler && typeof failHandler === 'function') {
    completeHandliing = failHandler(error, error.response);
  }

  if (!completeHandliing && (!error.response || !error.response.status)) {
    dialog.setMessage(MESSAGE_CATEGORY.ERROR, 'NETWORK ERROR', i18n.t('네트워크 오류'));
  } else if (!completeHandliing && error && error.response) {
    switch (error.response.status) {
      case 400: {
        if (
          error.response.data &&
          error.response.data &&
          error.response.data.errors &&
          error.response.data.errors.length > 0
        ) {
          dialog.setMessage(
            MESSAGE_CATEGORY.ERROR,
            '요청이 올바르지 않습니다.',
            `${error.response.data.errors[0].field.toUpperCase()} : ${error.response.data.errors[0].defaultMessage}`,
          );
        } else {
          dialog.setMessage(
            MESSAGE_CATEGORY.ERROR,
            '요청이 올바르지 않습니다.',
            error.response && error.response.data && error.response.data.message,
          );
        }

        break;
      }

      case 401: {
        store.dispatch(setUserInfo({}));

        dialog.setConfirm(
          MESSAGE_CATEGORY.ERROR,
          '인증 실패',
          '인증이 되어 있지 않거나, 만료되었습니다. 로그인 페이지로 이동하시겠습니까?',
          () => {
            window.location.href = '/starting-line';
          },
        );

        break;
      }

      case 404: {
        dialog.setMessage(MESSAGE_CATEGORY.ERROR, '404 NOT FOUND', i18n.t('message.resourceNotFount'));
        break;
      }

      case 409: {
        dialog.setMessage(
          MESSAGE_CATEGORY.ERROR,
          '요청이 올바르지 않습니다.',
          error.response && error.response.data && error.response.data.message,
        );
        break;
      }

      default: {
        dialog.setMessage(
          MESSAGE_CATEGORY.ERROR,
          '오류',
          error.response && error.response.data && error.response.data.message,
        );

        break;
      }
    }
  } else if (!completeHandliing) {
    dialog.setMessage(MESSAGE_CATEGORY.ERROR, '오류', '알 수 없는 오류가 발생했습니다.');
  }
}

function afterRequest(response, showLoading) {
  if (showLoading) {
    if (typeof showLoading === 'string') {
      setTimeout(() => {
        store.dispatch(removeLoading(showLoading));
      }, loadingTime);
    } else {
      setTimeout(() => {
        store.dispatch(setLoading(false));
      }, loadingTime);
    }
  }
}

function get(uri, params, successHandler, failHandler, showLoading) {
  beforeRequest(showLoading, uri, 'get');
  return axios
    .get(`${base}${uri}`, {
      params,
      ...axiosConfig,
    })
    .then((response) => {
      processSuccess(response, successHandler);
    })
    .catch((error) => {
      processError(error, failHandler);
    })
    .finally((response) => {
      afterRequest(response, showLoading);
    });
}

function post(uri, params, successHandler, failHandler, showLoading) {
  beforeRequest(showLoading, uri, 'post');
  return axios
    .post(`${base}${uri}`, params, axiosConfig)
    .then((response) => {
      processSuccess(response, successHandler);
    })
    .catch((error) => {
      processError(error, failHandler);
    })
    .finally((response) => {
      afterRequest(response, showLoading);
    });
}

function put(uri, params, successHandler, failHandler, showLoading) {
  beforeRequest(showLoading, uri, 'put');
  return axios
    .put(`${base}${uri}`, params, axiosConfig)
    .then((response) => {
      processSuccess(response, successHandler);
    })
    .catch((error) => {
      processError(error, failHandler);
    })
    .finally((response) => {
      afterRequest(response, showLoading);
    });
}

function del(uri, params, successHandler, failHandler, showLoading) {
  beforeRequest(showLoading, uri, 'del');
  return axios
    .delete(`${base}${uri}`, { ...axiosConfig, data: { ...params } })
    .then((response) => {
      processSuccess(response, successHandler);
    })
    .catch((error) => {
      processError(error, failHandler);
    })
    .finally((response) => {
      afterRequest(response, showLoading);
    });
}

export function waitFor(promises, callback) {
  return axios.all(promises).then(callback);
}

const request = {
  get,
  post,
  put,
  del,
  getBase,
  processError,
  waitFor,
};

export default request;
