import { detect } from 'detect-browser';

const browser = detect();

async function getPermissions(names) {
  if (browser.name === 'firefox') {
    return [];
  }

  const queryPromises = names.map((name) => {
    try {
      return navigator.permissions.query({ name });
    } catch (e) {
      //
    }

    return null;
  });

  return Promise.all(queryPromises);
}

function getPermissionNames(hasAudio, hasVideo) {
  const list = [];
  if (hasAudio) {
    list.push('microphone');
  }

  if (hasVideo) {
    list.push('camera');
  }

  return list;
}

async function getConnectedDevices(type) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  if (type) {
    return devices.filter((device) => device.kind === type);
  }

  return devices;
}

async function getUserMedia(constraint) {
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraint);
  } catch (e) {
    console.error(e);
    return {
      error: e,
    };
    //
  }

  return stream;
}

function getIsSupportMedia() {
  return navigator.mediaDevices?.enumerateDevices && navigator.mediaDevices?.getUserMedia;
}

async function getDeviceIds(stream) {
  const result = {
    audioinput: null,
    videoinput: null,
    audiooutput: null,
  };

  const devices = await getConnectedDevices();

  stream.getTracks().forEach((track) => {
    const { kind } = track;
    const settings = track.getSettings();
    const { deviceId } = settings || {};

    if (kind === 'audio') {
      result.audioinput = deviceId;
    }

    if (kind === 'video') {
      result.videoinput = deviceId;
    }
  });

  const defaultAudioOut = devices?.find((d) => d.kind === 'audiooutput' && d.deviceId === 'default');
  if (defaultAudioOut) {
    result.audiooutput = defaultAudioOut.deviceId;
  }

  return result;
}

async function getBasicConstraint(permissions) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  if (devices) {
    const result = {};
    const audio = permissions.microphone !== 'denied' && devices.filter((device) => device.kind === 'audioinput').length > 0;
    const video = permissions.camera !== 'denied' && devices.filter((device) => device.kind === 'videoinput').length > 0;
    if (audio) {
      result.audio = true;
    }
    if (video) {
      result.video = true;
    }

    return result;
  }

  return null;
}

function getCurrentConstraints(supportInfo) {
  let constraints = null;

  if (supportInfo.enabledVideo && supportInfo.mediaConfig.video.deviceId) {
    if (!constraints) {
      constraints = {};
    }

    if (constraints && !constraints.video) {
      constraints.video = {};
    }

    if (constraints) {
      constraints.video.deviceId = { exact: supportInfo.mediaConfig.video.deviceId };
    }

    if (constraints && supportInfo.mediaConfig.sendResolution) {
      constraints.video.width = supportInfo.mediaConfig.sendResolution;
      constraints.video.height = (supportInfo.mediaConfig.sendResolution / 4) * 3;
    }
  }

  if (supportInfo.enabledAudio && supportInfo.mediaConfig.audio.deviceId) {
    if (!constraints) {
      constraints = {
        audio: {},
      };
    }

    if (!constraints.audio) {
      constraints.audio = {};
    }

    constraints.audio.deviceId = { exact: supportInfo.mediaConfig.audio.deviceId };
  }

  return constraints;
}

const mediaUtil = {
  getPermissions,
  getIsSupportMedia,
  getConnectedDevices,
  getBasicConstraint,
  getDeviceIds,
  getUserMedia,
  getPermissionNames,
  getCurrentConstraints,
};

export default mediaUtil;
