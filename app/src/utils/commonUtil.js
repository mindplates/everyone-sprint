import storage from '@/utils/storage';

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
    console.log(e);
  }
}

function getUserSpace(spaces) {
  const paths = window.location.pathname.split('/');
  let spaceSelected = false;

  console.log(paths);

  if ((paths || []).length > 1) {
    // URL 우선 처리
    const spaceCode = paths[1];
    const space = (spaces || []).find((d) => d.code === spaceCode);
    if (space) {
      spaceSelected = true;
      return space;
    }
    return {};
  }

  if (!spaceSelected) {
    const lastSpaceCode = storage.getItem('setting', 'space');
    const lastSpace = (spaces || []).find((d) => d.code === lastSpaceCode);
    if (lastSpace) {
      console.log(1);
      return lastSpace;
    }
  }

  if (!spaceSelected) {
    if ((spaces || []).length > 0) {
      console.log(2);
      return spaces[0];
    }
  }

  return {};
}

const commonUtil = {
  fullscreen,
  getUserSpace,
};

export default commonUtil;
