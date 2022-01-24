import React, { createRef } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _, { debounce } from 'lodash';
import { detect } from 'detect-browser';
import dialog from '@/utils/dialog';
import { Button, CapabilitiesEditor, ConferenceVideoItem, Liner, PixInfoEditor, VideoElement } from '@/components';
import { CAPABILITIES, MESSAGE_CATEGORY } from '@/constants/constants';
import images from '@/images';
import MediaDeviceConfigPopup from '@/pages/Meetings/Conference/MediaDeviceConfigPopup';
import { UserPropTypes } from '@/proptypes';
import mediaUtil from '@/utils/mediaUtil';
import './ConferenceDeviceConfig.scss';

const browser = detect();

class ConferenceDeviceConfig extends React.Component {
  firefoxPermissionInterval = null;

  isShowFirefoxPermissionMessage = false;

  myConfigVideo = createRef();

  resizeDebounced;

  permissions = {
    microphone: null,
    camera: null,
  };

  // Running BodyPix on a video stream
  // https://jameshfisher.com/2020/09/23/running-bodypix-on-a-video-stream/
  constructor(props) {
    super(props);

    this.state = {
      openConfigPopup: false,
      openCapabilities: false,
      openPixInfo: false,
      capabilities: [],
      size: {
        width: '100%',
        height: '100%',
      },
      pixInfo: {
        enabled: false,
        type: 'effect',
        key: 'none',
        value: null,
      },
    };

    this.setDeviceInfoDebounced = _.debounce(this.setDeviceInfo, 100);
    this.resizeDebounced = debounce(this.resize, 500);
  }

  componentDidMount() {
    this.checkPermissions();
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

  checkPermissions = async () => {
    const { setSupportInfo, t } = this.props;

    if (!mediaUtil.getIsSupportMedia()) {
      const nextSupportInfo = {
        enabledAudio: false,
        enabledVideo: false,
        deviceInfo: {
          supported: false,
          errorMessage: t('디바이스 목록을 가져올 수 없습니다.'),
          devices: [],
        },
      };
      setSupportInfo(nextSupportInfo);
      return;
    }

    const connectedDevices = await mediaUtil.getConnectedDevices();

    const hasAudio = connectedDevices.filter((device) => device.kind === 'audioinput').length > 0;
    const hasVideo = connectedDevices.filter((device) => device.kind === 'videoinput').length > 0;

    const names = mediaUtil.getPermissionNames(hasAudio, hasVideo);
    const permissions = await mediaUtil.getPermissions(names);

    permissions.forEach((permission, inx) => {
      this.permissions[names[inx]] = permission.state;
      this.showPermissionMessage(permission);
      permission.onchange = () => {
        this.permissions[names[inx]] = permission.state;
        this.onChangePermission(permission);
      };
    });

    this.setDeviceInfoDebounced();
  };

  onChangePermission = () => {
    const { setSupportInfo } = this.props;
    const nextSupportInfo = {
      permissions: {
        ...this.permissions,
      },
    };

    setSupportInfo(nextSupportInfo, () => {
      dialog.clearMessage();
      this.setDeviceInfoDebounced();
    });
  };

  showPermissionMessage = (permissionObj) => {
    const { t, setSupportInfo } = this.props;

    setSupportInfo({
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

  setDeviceInfo = async () => {
    const { supportInfo, setSupportInfo, setStream, stream } = this.props;

    // 관련 API가 없는 경우, 관련된 메세지는 checkPermissions()에서 처리됨
    if (!mediaUtil.getIsSupportMedia()) {
      return;
    }

    const constraints = mediaUtil.getCurrentConstraints(supportInfo);
    // denied가 아닌 상태만 먼저 요청 (denied를 요청하는 경우 권한 오류로 가능한 디바이스도 요청 안됨)
    const basicConstraint = await mediaUtil.getBasicConstraint(this.permissions);
    if (constraints) {
      if (!constraints.audio && basicConstraint.audio) {
        constraints.audio = true;
      }

      if (!constraints.video && basicConstraint.video) {
        constraints.video = true;
      }
    }

    const devices = await mediaUtil.getConnectedDevices();

    const currentStream = await mediaUtil.getUserMedia(constraints || basicConstraint);

    if (currentStream && currentStream.error) {
      setSupportInfo({
        deviceInfo: {
          supported: false,
          errorMessage: String(currentStream.error),
        },
      });

      if (browser.name === 'firefox') {
        if (!this.isShowFirefoxPermissionMessage) {
          this.isShowFirefoxPermissionMessage = true;
          this.showPermissionMessage({
            state: 'denied',
          });
        }

        if (this.firefoxPermissionInterval) {
          clearTimeout(this.firefoxPermissionInterval);
          this.firefoxPermissionInterval = null;
        }

        this.firefoxPermissionInterval = setTimeout(() => {
          this.setDeviceInfoDebounced();
        }, 2000);
      }
    }

    if (currentStream && !currentStream.error) {
      if (this.firefoxPermissionInterval) {
        clearInterval(this.firefoxPermissionInterval);
        this.firefoxPermissionInterval = null;
      }

      // 현재 동작중인 스트림이 있다면 중지
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setStream(null);
      }

      // 반환된 스트림 지정
      setStream(currentStream);
      // this.myConfigVideo.srcObject = currentStream;

      // 현재 세팅된 내용을 저장
      let vw = null;
      let vh = null;
      currentStream.getVideoTracks().forEach((track) => {
        const settings = track.getSettings();
        vw = settings.width;
        vh = settings.height;
      });

      const deviceIdMap = await mediaUtil.getDeviceIds(currentStream);

      const next = {
        mediaConfig: {
          audio: {
            deviceId: deviceIdMap.audioinput,
          },
          video: {
            deviceId: deviceIdMap.videoinput,
            settings: {
              width: vw,
              height: vh,
            },
          },
          speaker: {
            deviceId: deviceIdMap.audiooutput,
          },
        },
        deviceInfo: {
          supported: true,
          errorMessage: '',
          devices,
        },
        enabledAudio: basicConstraint.audio,
        enabledVideo: basicConstraint.video,
      };

      setSupportInfo(next);
    } else {
      setSupportInfo({
        deviceInfo: {
          devices,
        },
      });
    }

    // 디바이스가 존재(not null)하는데, 권한이 없는 경우가 있다면, 브라우저 상단에 존재하는 기계에 대한 허용 아이콘이 뜨도록 존재하는 기계에 대해 미디어 요청
    if (
      (this.permissions.microphone !== null && this.permissions.microphone !== 'granted') ||
      (this.permissions.camera !== null && this.permissions.camera !== 'granted')
    ) {
      await mediaUtil.getUserMedia({
        video: this.permissions.camera !== null,
        audio: this.permissions.microphone !== null,
      });
    }
  };

  setOpenCapabilities = (value) => {
    const { stream, supportInfo, setSupportInfo } = this.props;
    const metas = [];
    const capabilities = [];
    if (value && stream) {
      stream.getVideoTracks().forEach((track) => {
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

  setOpenPixInfo = (value) => {
    this.setState({
      openPixInfo: value,
    });
  };

  onChangePixInfo = (type, key, value) => {
    const { setPixInfo } = this.props;
    const { pixInfo } = this.state;
    const nextPixInfo = { ...pixInfo };
    nextPixInfo.type = type;
    nextPixInfo.key = key;
    nextPixInfo.value = value;

    if (nextPixInfo.type === 'effect' && nextPixInfo.key === 'none') {
      nextPixInfo.enabled = false;
    } else {
      nextPixInfo.enabled = true;
    }

    console.log(nextPixInfo);

    this.setState({
      pixInfo: nextPixInfo,
    });

    setPixInfo(nextPixInfo);
  };

  onChangeCapability = (type, key, value) => {
    const { stream, supportInfo, setSupportInfo } = this.props;
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

    stream.getVideoTracks().forEach((track) => {
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
    const { setControls, stream } = this.props;
    const audioTrack = stream.getTracks().find((d) => d.kind === field);
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
    const { supportInfo, setSupportInfo, t, conference, user, onJoinClick, controls, stream } = this.props;
    const { mediaConfig, enabledAudio, enabledVideo } = supportInfo;
    const { openConfigPopup, openCapabilities, capabilities, size, pixInfo, openPixInfo } = this.state;

    const connectedUser = (conference?.users || []).filter((u) => u.participant?.connected && u.userId !== user.id);

    console.log(pixInfo);

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
            <Button
              size="lg"
              rounded
              color="white"
              outline
              disabled={!enabledVideo}
              onClick={() => {
                this.setOpenPixInfo(!openPixInfo);
              }}
            >
              <i className="fas fa-magic" />
            </Button>
          </div>
          <div className="video-content">
            <div>
              {false && (
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
                  isMicrophoneDenied={supportInfo.permissions.microphone === 'denied'}
                  isCameraDenied={supportInfo.permissions.camera === 'denied'}
                  pixInfo={pixInfo}
                />
              )}
              <div className="my-video">
                <ConferenceVideoItem useVideoInfo controls={controls} supportInfo={supportInfo} alias={user.alias} muted stream={stream} pixInfo={pixInfo} />
              </div>
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
            {openPixInfo && (
              <div
                className="pix-info-editor"
                style={{
                  height: mediaConfig.video.settings.height,
                }}
              >
                <PixInfoEditor pixInfo={pixInfo} onChange={this.onChangePixInfo} setOpened={this.setOpenPixInfo} />
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
                onJoinClick();
              }}
            >
              {t('참가하기')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(ConferenceDeviceConfig);

ConferenceDeviceConfig.propTypes = {
  t: PropTypes.func,
  supportInfo: PropTypes.shape({
    permissions: PropTypes.shape({
      microphone: PropTypes.string,
      camera: PropTypes.string,
    }),
    deviceInfo: PropTypes.shape({
      supported: PropTypes.bool,
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
  stream: PropTypes.objectOf(PropTypes.any),
  setStream: PropTypes.func,
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
  onJoinClick: PropTypes.func,
  controls: PropTypes.shape({
    audio: PropTypes.bool,
    video: PropTypes.bool,
    participants: PropTypes.bool,
    sharing: PropTypes.bool,
  }),
  setControls: PropTypes.func,
  setPixInfo: PropTypes.func,
};
