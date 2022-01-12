import React, { createRef } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _, { debounce } from 'lodash';
import dialog from '@/utils/dialog';
import { Button, CapabilitiesEditor, Liner, VideoElement } from '@/components';
import { CAPABILITIES, MESSAGE_CATEGORY } from '@/constants/constants';
import images from '@/images';
import MediaDeviceConfigPopup from '@/pages/Meetings/MediaDeviceConfigPopup';
import { UserPropTypes } from '@/proptypes';
import './ConferenceDeviceConfig.scss';

class ConferenceDeviceConfig extends React.Component {
  myConfigVideo = createRef();

  resizeDebounced;

  permissions = {
    microphone: null,
    camera: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      openConfigPopup: false,
      openCapabilities: false,
      capabilities: [],
      size: {
        width: '100%',
        height: '100%',
      },
    };

    this.setDeviceInfoDebounced = _.debounce(this.setDeviceInfo, 100);
    this.resizeDebounced = debounce(this.resize, 500);
  }

  componentDidMount() {
    this.checkPermissions();
    this.setDeviceInfoDebounced();
    window.addEventListener('resize', this.resizeDebounced);
    this.resizeDebounced();
  }

  componentWillUnmount() {
    if (this.setDeviceInfoDebounced) {
      this.setDeviceInfoDebounced.cancel();
    }

    if (this.resizeDebounced) {
      this.resizeDebounced.cancel();
    }
  }

  resize = () => {
    this.setState({
      size: {
        width: window.innerWidth - 32,
        height: window.innerHeight - 32,
      },
    });
  };

  checkPermissions = () => {
    navigator.permissions.query({ name: 'microphone' }).then((permissionObj) => {
      this.permissions.microphone = permissionObj.state;
      this.showPermissionMessage(permissionObj);

      permissionObj.onchange = () => {
        this.permissions.microphone = permissionObj.state;
        this.onChangePermission(permissionObj);
      };
    });

    navigator.permissions.query({ name: 'camera' }).then((permissionObj) => {
      this.permissions.camera = permissionObj.state;
      this.showPermissionMessage(permissionObj);
      permissionObj.onchange = () => {
        this.permissions.camera = permissionObj.state;
        this.onChangePermission(permissionObj);
      };
    });
  };

  onChangePermission = () => {
    const { supportInfo, setSupportInfo } = this.props;

    setSupportInfo(
      {
        ...supportInfo,
        permissions: {
          ...this.permissions,
        },
      },
      () => {
        dialog.clearMessage();
        this.setDeviceInfoDebounced();
      },
    );
  };

  showPermissionMessage = (permissionObj) => {
    const { t, supportInfo, setSupportInfo } = this.props;

    setSupportInfo({
      ...supportInfo,
      permissions: {
        ...this.permissions,
      },
    });

    if (permissionObj.state === 'prompt') {
      dialog.setMessage(
        MESSAGE_CATEGORY.WARNING,
        t('카메라와 마이크가 사용하도록 허용'),
        <div>
          <span>
            {t(
              '다른 참가자들과 회의를 진행하기 위해서는 카메라와 마이크에 엑세스할 수 있어야 합니다. 사용하는 각 브라우저와 컴퓨터에서 이 사용 권한을 확인할 것을 요청하는 메세지가 표시됩니다.',
            )}
          </span>
        </div>,
      );
    }

    if (permissionObj.state === 'denied') {
      dialog.setMessage(
        MESSAGE_CATEGORY.WARNING,
        t('카메라와 마이크가 차단됨'),
        <div>
          <span>{t('카메라와 마이크에 엑세스가 필요합니다. 브라우저 주소 표시줄에서 차단된 카메라 아이콘')}</span>
          <span>
            <img src={images.cameraPermission} alt="camera" />
          </span>
          <span>{t('을 클릭해주세요.')}</span>
        </div>,
      );
    }
  };

  getDeviceIds = (stream, devices) => {
    const result = {
      audioinput: null,
      videoinput: null,
      audiooutput: null,
    };

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
  };

  setDeviceInfo = () => {
    const { t } = this.props;
    const { setSupportInfo, setMyStream, myStream } = this.props;

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      const { supportInfo } = this.props;
      const nextSupportInfo = { ...supportInfo };

      nextSupportInfo.supportUserMedia = false;
      nextSupportInfo.deviceInfo = {
        supported: false,
        errorName: t('미디어 API 오류'),
        errorMessage: t('디바이스 목록을 가져올 수 없습니다.'),
        devices: [],
      };
      setSupportInfo(nextSupportInfo);
    } else {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const { supportInfo } = this.props;

          const nextSupportInfo = {
            ...supportInfo,
          };

          nextSupportInfo.deviceInfo = {
            supported: true,
            errorName: '',
            errorMessage: '',
            devices,
          };

          setSupportInfo(nextSupportInfo);
        })
        .catch((e) => {
          const { supportInfo } = this.props;

          const nextSupportInfo = {
            ...supportInfo,
          };

          nextSupportInfo.supportUserMedia = false;
          nextSupportInfo.deviceInfo = {
            supported: false,
            errorName: e.name,
            errorMessage: e.message,
            devices: [],
          };

          setSupportInfo(nextSupportInfo);
        });
    }

    const { supportInfo: currentSupportInfo } = this.props;

    const constraints = {
      video: {},
      audio: {},
    };

    if (currentSupportInfo.enabledVideo && currentSupportInfo.mediaConfig.video.deviceId) {
      constraints.video.deviceId = { exact: currentSupportInfo.mediaConfig.video.deviceId };
    }

    if (currentSupportInfo.enabledVideo && currentSupportInfo.mediaConfig.sendResolution) {
      constraints.video.width = currentSupportInfo.mediaConfig.sendResolution;
      constraints.video.height = (currentSupportInfo.mediaConfig.sendResolution / 4) * 3;
    }

    if (currentSupportInfo.enabledAudio && currentSupportInfo.mediaConfig.audio.deviceId) {
      constraints.audio.deviceId = { exact: currentSupportInfo.mediaConfig.audio.deviceId };
    }

    if (myStream) {
      myStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMyStream(null);
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        let videoWidth = 720;
        let videoHeight = 540;
        stream.getVideoTracks().forEach((track) => {
          const settings = track.getSettings();
          videoWidth = settings.width;
          videoHeight = settings.height;
        });

        const { supportInfo } = this.props;

        const nextSupportInfo = {
          ...supportInfo,
        };

        const deviceIds = this.getDeviceIds(stream, supportInfo.deviceInfo.devices);

        nextSupportInfo.mediaConfig.audio.deviceId = deviceIds.audioinput;
        nextSupportInfo.mediaConfig.video.deviceId = deviceIds.videoinput;
        nextSupportInfo.mediaConfig.video.settings.width = videoWidth;
        nextSupportInfo.mediaConfig.video.settings.height = videoHeight;
        nextSupportInfo.mediaConfig.speaker.deviceId = deviceIds.audiooutput;

        setMyStream(stream);
        this.myConfigVideo.srcObject = stream;

        nextSupportInfo.supportUserMedia = true;
        nextSupportInfo.enabledAudio = true;
        nextSupportInfo.enabledVideo = true;

        setSupportInfo(nextSupportInfo);

        /*
        https://pretagteam.com/question/javascript-select-audio-device
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter(({
           kind
        }) => kind === 'audiooutput');
        const output = outputs[1]; // Choose a device

        const audio = new Audio();
        audio.setSinkId(output.deviceId);
        audio.play();
         */
      })
      .catch((e) => {
        // 일부 허용된 경우, 허용된 것만 보여주도록
        const { supportInfo } = this.props;
        if (supportInfo.permissions.microphone === 'granted' || supportInfo.permissions.camera === 'granted') {
          navigator.mediaDevices
            .getUserMedia({
              video: supportInfo.permissions.camera === 'granted',
              audio: supportInfo.permissions.microphone === 'granted',
            })
            .then((stream) => {
              setMyStream(stream);
              this.myConfigVideo.srcObject = stream;

              const { supportInfo: currentSupportedInfo } = this.props;

              const nextCurrentSupportedInfo = {
                ...currentSupportedInfo,
              };

              const deviceIds = this.getDeviceIds(stream, nextCurrentSupportedInfo.deviceInfo.devices);

              nextCurrentSupportedInfo.mediaConfig.audio.deviceId = deviceIds.audioinput;
              nextCurrentSupportedInfo.mediaConfig.video.deviceId = deviceIds.videoinput;
              nextCurrentSupportedInfo.mediaConfig.speaker.deviceId = deviceIds.audiooutput;

              nextCurrentSupportedInfo.supportUserMedia = false;
              nextCurrentSupportedInfo.enabledAudio = supportInfo.permissions.microphone === 'granted';
              nextCurrentSupportedInfo.enabledVideo = supportInfo.permissions.camera === 'granted';

              setSupportInfo(nextCurrentSupportedInfo);
            })
            .catch(() => {
              //
            });

          // 일부 허용된 것만 보여주고, 다시 권한 요청이 발생하도록 재요청
          navigator.mediaDevices
            .getUserMedia({
              video: true,
              audio: true,
            })
            .catch(() => {
              //
            });
        } else {
          const { supportInfo: currentSupportedInfo } = this.props;

          const nextCurrentSupportedInfo = {
            ...currentSupportedInfo,
          };

          nextCurrentSupportedInfo.supportUserMedia = false;
          nextCurrentSupportedInfo.enabledAudio = false;
          nextCurrentSupportedInfo.enabledVideo = false;
          setSupportInfo(nextCurrentSupportedInfo);
        }

        // 하나라도 차단된 경우, 메세지 표시
        if (supportInfo.permissions.microphone === 'denied' || supportInfo.permissions.camera === 'denied') {
          dialog.setMessage(
            MESSAGE_CATEGORY.WARNING,
            t('카메라와 마이크가 차단됨'),
            <div>
              <span>{t('카메라와 마이크에 엑세스가 필요합니다. 브라우저 주소 표시줄에서 차단된 카메라 아이콘')}</span>
              <span>
                <img src={images.cameraPermission} alt="camera" />
              </span>
              <span>{t('을 클릭해주세요.')}</span>
            </div>,
          );
        } else {
          // 권한 이외의 에러 표시
          const errorString = String(e);

          const { supportInfo: currentSupportedInfo } = this.props;

          let errorName = '';
          let errorMessage = '';

          const errs = errorString.split(':');
          if (errs.length > 1) {
            const [first, second] = errs;
            errorName = first.trim();
            errorMessage = second.trim();
          } else {
            errorName = errs.trim();
            errorMessage = '';
          }

          const nextCurrentSupportedInfo = {
            ...currentSupportedInfo,
          };

          nextCurrentSupportedInfo.supportUserMedia = false;
          nextCurrentSupportedInfo.deviceInfo = {
            ...nextCurrentSupportedInfo.deviceInfo,
            errorName,
            errorMessage,
          };

          setSupportInfo(nextCurrentSupportedInfo);
        }
      });
  };

  setOpenCapabilities = (value) => {
    const { myStream, supportInfo, setSupportInfo } = this.props;
    const metas = [];
    const capabilities = [];
    if (value && myStream) {
      myStream.getVideoTracks().forEach((track) => {
        const settings = track.getSettings();
        const deviceCapabilities = track.getCapabilities();

        CAPABILITIES.filter((d) => d.enabled).forEach((info) => {
          if (deviceCapabilities[info.key]) {
            if (!_.isEmpty(deviceCapabilities[info.key])) {
              metas.push({
                key: info.key,
                name: info.name,
                options: deviceCapabilities[info.key],
              });
            }
          }

          if (settings[info.key]) {
            capabilities.push({
              key: info.key,
              value: settings[info.key],
            });
          }
        });
      });
    }

    const nextSupportInfo = { ...supportInfo };
    nextSupportInfo.mediaConfig.video.capabilities = capabilities;
    setSupportInfo(nextSupportInfo);

    this.setState({
      openCapabilities: value,
      capabilities: metas,
    });
  };

  onChangeCapability = (type, key, value) => {
    const { myStream, supportInfo, setSupportInfo } = this.props;
    const nextSupportInfo = { ...supportInfo };
    const capability = nextSupportInfo.mediaConfig[type].capabilities.find((d) => d.key === key);
    if (capability) {
      capability.value = value;
    } else {
      nextSupportInfo.mediaConfig[type].capabilities.push({
        key,
        value,
      });
    }

    myStream.getVideoTracks().forEach((track) => {
      const values = { advanced: [] };
      const options = {};
      const capabilities = track.getCapabilities();

      nextSupportInfo.mediaConfig[type].capabilities.forEach((info) => {
        if (capabilities[info.key] && info.value) {
          options[info.key] = info.value;
        }
      });
      values.advanced.push(options);

      track.applyConstraints(values);
    });

    setSupportInfo(nextSupportInfo);
  };

  disableControl = (field, value) => {
    const { setControls, myStream } = this.props;
    const audioTrack = myStream.getTracks().find((d) => d.kind === field);
    if (audioTrack) {
      audioTrack.enabled = value;
    }

    setControls(field, value);
  };

  getButtonColor = (enabled, on) => {
    if (!enabled) {
      return 'gray';
    }

    if (enabled && !on) {
      return 'danger';
    }

    return 'white';
  };

  getButtonOutline = (enabled, on) => {
    if (!enabled) {
      return true;
    }

    if (enabled && on) {
      return true;
    }

    if (enabled && !on) {
      return false;
    }

    return false;
  };

  render() {
    const { supportInfo, setSupportInfo, t, conference, user, sendJoin, controls } = this.props;
    const { mediaConfig, enabledAudio, enabledVideo } = supportInfo;
    const { openConfigPopup, openCapabilities, capabilities, size } = this.state;

    const connectedUser = (conference?.users || []).filter((u) => u.participant?.connected && u.userId !== user.id);

    return (
      <div className="conference-device-config-wrapper">
        {openConfigPopup && (
          <MediaDeviceConfigPopup
            devices={supportInfo.deviceInfo.devices}
            setOpen={() => {
              this.setState({
                openConfigPopup: false,
              });
              this.setDeviceInfo();
            }}
            mediaConfig={mediaConfig}
            setMediaConfig={(nextMediaConfig) => {
              setSupportInfo({
                ...supportInfo,
                mediaConfig: nextMediaConfig,
              });
            }}
          />
        )}
        <div>
          <div className="current-user-info">
            {connectedUser.length < 1 && <div className="text">{t('아직 참가자가 없습니다.')}</div>}
            {connectedUser.length > 0 && (
              <>
                <div className="user-count">
                  {connectedUser.length}/{(conference?.users || []).length}명 참석중
                </div>
                <div className="user-list">
                  {connectedUser.map((u) => {
                    return <span key={u.userId}>{u.alias}</span>;
                  })}
                </div>
              </>
            )}
          </div>
          <div className="config-button">
            <Button
              size="lg"
              rounded
              color="white"
              outline
              onClick={() => {
                this.setState({
                  openConfigPopup: !openConfigPopup,
                });
              }}
            >
              <i className="fas fa-cog" />
            </Button>
            <Button
              size="lg"
              rounded
              color="white"
              outline
              disabled={!enabledVideo}
              onClick={() => {
                this.setOpenCapabilities(!openCapabilities);
              }}
            >
              <i className="fas fa-sliders-h" />
            </Button>
          </div>
          <div className="video-content">
            <div>
              <VideoElement
                className="config-video"
                useVideoInfo
                videoInfo={{
                  width: size.width < mediaConfig.video.settings.width ? size.width : mediaConfig.video.settings.width,
                  height: mediaConfig.video.settings.height,
                  videoWidth: mediaConfig.video.settings.width,
                  videoHeight: mediaConfig.video.settings.height,
                }}
                onRef={(d) => {
                  this.myConfigVideo = d;
                }}
                supportInfo={supportInfo}
                setUpUserMedia={this.setDeviceInfo}
                muted
                isPrompt={supportInfo.permissions.microphone === 'prompt' || supportInfo.permissions.camera === 'prompt'}
                isDenied={supportInfo.permissions.microphone === 'denied' || supportInfo.permissions.camera === 'denied'}
              />
            </div>
            {openCapabilities && (
              <div
                className="capabilities-editor"
                style={{
                  height: mediaConfig.video.settings.height,
                }}
              >
                <CapabilitiesEditor
                  metas={capabilities}
                  capabilities={mediaConfig.video.capabilities}
                  onChange={(key, value) => {
                    this.onChangeCapability('video', key, value);
                  }}
                  setOpened={this.setOpenCapabilities}
                />
              </div>
            )}
          </div>
          <div className="user-media-config-buttons">
            {supportInfo.permissions.camera === 'prompt' && <span>권한 요청 중</span>}
            {supportInfo.permissions.camera !== 'prompt' && (
              <Button
                size="lg"
                disabled={!enabledVideo}
                rounded
                color={this.getButtonColor(enabledVideo, controls.video)}
                outline={this.getButtonOutline(enabledVideo, controls.video)}
                onClick={() => {
                  this.disableControl('video', !controls.video);
                }}
              >
                {!enabledVideo && (
                  <span className="icon">
                    <i className="fas fa-exclamation-triangle" />
                  </span>
                )}
                {enabledVideo && controls.video && <i className="fas fa-video" />}
                {enabledVideo && !controls.video && <i className="fas fa-video-slash" />}
                {!enabledVideo && <i className="fas fa-video-slash" />}
              </Button>
            )}
            {supportInfo.permissions.camera !== 'prompt' && supportInfo.permissions.microphone === 'prompt' && <span>권한 요청 중</span>}
            {supportInfo.permissions.microphone !== 'prompt' && (
              <Button
                size="lg"
                disabled={!enabledAudio}
                rounded
                color={this.getButtonColor(enabledAudio, controls.audio)}
                outline={this.getButtonOutline(enabledAudio, controls.audio)}
                onClick={() => {
                  this.disableControl('audio', !controls.audio);
                }}
                className={supportInfo.enabledAudio ? '' : ''}
              >
                {!enabledAudio && (
                  <span className="icon">
                    <i className="fas fa-exclamation-triangle" />
                  </span>
                )}
                {enabledAudio && <i className="fas fa-microphone" />}
                {!enabledAudio && <i className="fas fa-microphone-slash" />}
              </Button>
            )}
            <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem 0 0.5rem" />
            <Button
              size="lg"
              color="primary"
              onClick={() => {
                sendJoin();
              }}
            >
              {t('참가하기')}
            </Button>
          </div>
          {(!supportInfo.deviceInfo.supported || !supportInfo.supportUserMedia) && (
            <div className="device-error-info">
              <div className="error-name">{supportInfo.deviceInfo.errorName}</div>
              <div className="error-message">{supportInfo.deviceInfo.errorMessage}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation()(ConferenceDeviceConfig);

ConferenceDeviceConfig.propTypes = {
  t: PropTypes.func,
  supportInfo: PropTypes.shape({
    supportUserMedia: PropTypes.bool,
    retrying: PropTypes.bool,
    permissions: PropTypes.shape({
      microphone: PropTypes.string,
      camera: PropTypes.string,
    }),
    deviceInfo: PropTypes.shape({
      supported: PropTypes.bool,
      errorName: PropTypes.string,
      errorMessage: PropTypes.string,
      devices: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.name,
        }),
      ),
    }),
    mediaConfig: PropTypes.shape({
      speaker: PropTypes.shape({
        deviceId: PropTypes.string,
      }),
      audio: PropTypes.shape({
        deviceId: PropTypes.string,
        settings: PropTypes.objectOf(PropTypes.any),
        capabilities: PropTypes.arrayOf(PropTypes.any),
      }),
      video: PropTypes.shape({
        deviceId: PropTypes.string,
        settings: PropTypes.objectOf(PropTypes.any),
        capabilities: PropTypes.arrayOf(PropTypes.any),
      }),
      sendResolution: PropTypes.number,
      receiveResolution: PropTypes.number,
    }),
    enabledAudio: PropTypes.bool,
    enabledVideo: PropTypes.bool,
  }),
  setSupportInfo: PropTypes.func,
  myStream: PropTypes.objectOf(PropTypes.any),
  setMyStream: PropTypes.func,
  user: UserPropTypes,
  conference: PropTypes.shape({
    code: PropTypes.string,
    endDate: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string,
    sprintDailyMeetingId: PropTypes.number,
    sprintId: PropTypes.number,
    sprintName: PropTypes.string,
    startDate: PropTypes.string,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        alias: PropTypes.string,
        email: PropTypes.string,
        id: PropTypes.number,
        imageData: PropTypes.string,
        imageType: PropTypes.string,
        name: PropTypes.string,
        participant: PropTypes.shape({
          alias: PropTypes.string,
          audio: PropTypes.bool,
          code: PropTypes.string,
          connected: PropTypes.bool,
          email: PropTypes.string,
          id: PropTypes.string,
          imageData: PropTypes.string,
          imageType: PropTypes.string,
          ip: PropTypes.string,
          joinTime: PropTypes.string,
          key: PropTypes.string,
          leaveTime: PropTypes.string,
          name: PropTypes.string,
          socketId: PropTypes.string,
          video: PropTypes.bool,
        }),
      }),
    ),
  }),
  sendJoin: PropTypes.func,
  controls: PropTypes.shape({
    audio: PropTypes.bool,
    video: PropTypes.bool,
    participants: PropTypes.bool,
    sharing: PropTypes.bool,
  }),
  setControls: PropTypes.func,
};
