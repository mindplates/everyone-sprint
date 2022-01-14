async function getPermissions(names) {
  const queryPromises = names.map((name) => {
    return navigator.permissions.query({ name });
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

    console.log(result);
    return result;
  }

  return null;
}

const mediaUtil = {
  getPermissions,
  getIsSupportMedia,
  getConnectedDevices,
  getBasicConstraint,
  getDeviceIds,
  getUserMedia,
  getPermissionNames,
};

export default mediaUtil;
