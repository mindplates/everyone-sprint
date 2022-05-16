import storage from '@/utils/storage';
import store from '@/store';
import { SYSTEM_PATHS } from '@/constants/constants';

function getCurrentSpaceCode() {
  const state = store.getState();
  return `${state.space.code || ''}`;
}

function fullscreen(value) {
  const elem = document.documentElement;
  try {
    if (value) {
      if (elem.requestFullscreen) {
        const promise = elem.requestFullscreen();
        promise.catch(() => {});
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }

    if (!value) {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  } catch (e) {
    //
  }
}

function getUserSpace(spaces, code) {
  const paths = window.location.pathname.split('/');

  if (code) {
    const space = (spaces || []).find((d) => d.code === code);
    if (space) {
      return space;
    }
  }

  if ((paths || []).length > 1 && paths[1] && !SYSTEM_PATHS.includes(paths[1])) {
    // URL 우선 처리
    const spaceCode = paths[1];
    const space = (spaces || []).find((d) => d.code === spaceCode);
    if (space) {
      return space;
    }
    return {};
  }

  const lastSpaceCode = storage.getItem('setting', 'space');
  const lastSpace = (spaces || []).find((d) => d.code === lastSpaceCode);
  if (lastSpace) {
    return lastSpace;
  }

  if ((spaces || []).length > 0) {
    return spaces[0];
  }

  return {};
}

function move(url, prependSpace = true) {
  const state = store.getState();
  if (prependSpace) {
    state.history.push(`/${getCurrentSpaceCode()}${url}`);
  } else {
    state.history.push(`${url}`);
  }
}

function goBack() {
  const state = store.getState();
  state.history.goBack();
}

function getSpaceUrl(url) {
  return `/${getCurrentSpaceCode()}${url}`;
}

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

const commonUtil = {
  fullscreen,
  getUserSpace,
  move,
  getSpaceUrl,
  getCurrentSpaceCode,
  goBack,
  isDev,
};

export default commonUtil;
