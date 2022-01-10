import React, { createRef } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { Button, VideoElement } from '@/components';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import images from '@/images';
import './ConferenceDeviceConfig.scss';
import MediaDeviceConfigPopup from '@/pages/Meetings/MediaDeviceConfigPopup';

const constraints = {
  video: true,
  audio: true,
};

class ConferenceDeviceConfig extends React.Component {
  myConfigVideo = createRef();

  isAddedPermissionEvent = false;

  permissions = {
    microphone: null,
    camera: null,
  };

  constructor(props) {
    super(props);

    this.setConfigDebounced = debounce(this.setConfig, 100);

    this.state = {
      openConfigPopup: false,
    };
  }

  componentDidMount() {
    this.startConfig();
  }

  componentWillUnmount() {
    if (this.setConfigDebounced) {
      this.setConfigDebounced.cancel();
    }
  }

  startConfig = () => {
    const { supportInfo } = this.props;
    if (!this.isAddedPermissionEvent) {
      this.isAddedPermissionEvent = true;
      this.checkPermissions();
    }
    if (supportInfo.status === 'NONE') {
      this.setConfigDebounced();
    }
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
        this.setConfigDebounced();
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

  setConfig = () => {
    const { t } = this.props;
    const { setSupportInfo, setMyStream } = this.props;

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      const { supportInfo } = this.props;
      const nextSupportInfo = { ...supportInfo };
      nextSupportInfo.status = 'READY';
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

          nextSupportInfo.status = 'READY';
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

          nextSupportInfo.status = 'ERROR';
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

    // https://stackoverflow.com/questions/33761770/what-constraints-should-i-pass-to-getusermedia-in-order-to-get-two-video-media
    /*
    * navigator.mediaDevices.enumerateDevices()
.then(devices => {
  var camera = devices.find(device => device.kind == "videoinput");
  if (camera) {
    var constraints = { deviceId: { exact: camera.deviceId } };
    return navigator.mediaDevices.getUserMedia({ video: constraints });
  }
})
.then(stream => video.srcObject = stream)
.catch(e => console.error(e));
* */

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        const { supportInfo } = this.props;

        const nextSupportInfo = {
          ...supportInfo,
        };

        const deviceIds = this.getDeviceIds(stream, supportInfo.deviceInfo.devices);

        nextSupportInfo.mediaConfig = {
          ...nextSupportInfo.mediaConfig,
          ...deviceIds,
        };

        setMyStream(stream);
        this.myConfigVideo.srcObject = stream;

        nextSupportInfo.status = 'SUCCESS';
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
              ...constraints,
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

              nextCurrentSupportedInfo.mediaConfig = {
                ...nextCurrentSupportedInfo.mediaConfig,
                ...deviceIds,
              };

              nextCurrentSupportedInfo.status = 'ERROR';
              nextCurrentSupportedInfo.supportUserMedia = false;
              nextCurrentSupportedInfo.enabledAudio = supportInfo.permissions.microphone === 'granted';
              nextCurrentSupportedInfo.enabledVideo = supportInfo.permissions.camera === 'granted';

              setSupportInfo(nextCurrentSupportedInfo);
            })
            .catch(() => {
              //
            });

          // 일부 허용된 것만 보여주고, 다시 권한 요청이 발생하도록 재요청
          navigator.mediaDevices.getUserMedia(constraints).catch(() => {
            //
          });
        } else {
          const { supportInfo: currentSupportedInfo } = this.props;

          const nextCurrentSupportedInfo = {
            ...currentSupportedInfo,
          };

          nextCurrentSupportedInfo.status = 'ERROR';
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

          nextCurrentSupportedInfo.status = 'ERROR';
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

  render() {
    const { supportInfo, setSupportInfo, t } = this.props;
    const { mediaConfig } = supportInfo;
    const { openConfigPopup } = this.state;

    return (
      <div className="conference-device-config-wrapper">
        {openConfigPopup && (
          <MediaDeviceConfigPopup
            setOpen={() => {
              this.setState({
                openConfigPopup: false,
              });
            }}
            devices={supportInfo.deviceInfo.devices}
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
          </div>
          <div>
            <VideoElement
              useVideoInfo
              videoInfo={{
                width: 320,
                height: 240,
                videoWidth: 320,
                videoHeight: 240,
              }}
              onRef={(d) => {
                this.myConfigVideo = d;
              }}
              supportInfo={supportInfo}
              setUpUserMedia={this.setConfig}
              muted
              isPrompt={supportInfo.permissions.microphone === 'prompt' || supportInfo.permissions.camera === 'prompt'}
              isDenied={supportInfo.permissions.microphone === 'denied' || supportInfo.permissions.camera === 'denied'}
            />
          </div>
          <div className="user-media-config-buttons">
            {supportInfo.permissions.camera === 'prompt' && <span>권한 요청 중</span>}
            {supportInfo.permissions.camera !== 'prompt' && (
              <Button size="lg" rounded color="white" outline onClick={() => {}} className={supportInfo.enabledAudio ? '' : ''}>
                {supportInfo.enabledVideo && <i className="fas fa-video" />}
                {!supportInfo.enabledVideo && <i className="fas fa-video-slash" />}
              </Button>
            )}
            {supportInfo.permissions.camera !== 'prompt' && supportInfo.permissions.microphone === 'prompt' && <span>권한 요청 중</span>}
            {supportInfo.permissions.microphone !== 'prompt' && (
              <Button size="lg" rounded color="white" outline onClick={() => {}} data-tip={t('마이크 꺼짐')} className={supportInfo.enabledAudio ? '' : ''}>
                {supportInfo.enabledAudio && <i className="fas fa-microphone" />}
                {!supportInfo.enabledAudio && <i className="fas fa-microphone-slash" />}
              </Button>
            )}
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
    status: PropTypes.string,
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
      audiooutput: PropTypes.string,
      audioinput: PropTypes.string,
      videoinput: PropTypes.string,
      sendResolution: PropTypes.number,
      receiveResolution: PropTypes.number,
    }),
    enabledAudio: PropTypes.bool,
    enabledVideo: PropTypes.bool,
  }),
  setSupportInfo: PropTypes.func,
  setMyStream: PropTypes.func,
};
