import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Button, Liner, Page, PageContent, PageTitle, ParticipantsList, SocketClient, VideoElement } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import './Conference.scss';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import images from '@/images';

/*
const constraints = {
  video: {
    width: { max: 320 },
    height: { max: 240 },
    frameRate: { max: 30 },
  },
  audio: true,
};
 */

const constraints = {
  video: true,
  audio: true,
};

const peerConnectionConfig = {
  iceServers: [{ urls: 'stun:stun.services.mozilla.com' }, { urls: 'stun:stun.l.google.com:19302' }],
};

const logging = true;

class Conference extends React.Component {
  myStream = null;

  myScreenStream = null;

  myScreenStreamVideo = createRef();

  socket = createRef();

  myVideo = createRef();

  myConfigVideo = createRef();

  streamingContent = createRef();

  setVideoInfoDebounced;

  isAddedPermissionEvent = false;

  permissions = {
    microphone: null,
    camera: null,
  };

  constructor(props) {
    super(props);

    this.setVideoInfoDebounced = debounce(this.setVideoInfo, 100);

    this.setConfigDebounced = debounce(this.setConfig, 100);

    this.state = {
      conference: null,
      code: null,
      align: {
        type: 'CONNECT',
        order: 'ASC',
      },
      videoInfo: {
        init: false,
        width: 320,
        height: 240,
        videoWidth: 320,
        videoHeight: 240,
      },
      controls: {
        audio: true,
        video: true,
        participants: true,
        sharing: false,
      },
      screenShare: {
        sharing: false,
      },
      supportInfo: {
        status: 'NONE', // NONE, READY, COMPLETE, ERROR
        supportUserMedia: null,
        retrying: false,
        permissions: {
          microphone: null,
          camera: null,
        },
        deviceInfo: {
          supported: true,
          errorName: '',
          errorMessage: '',
          devices: [],
        },
        enabledAudio: true,
        enabledVideo: true,
      },
    };
  }

  static getDerivedStateFromProps(props, state) {
    const {
      match: {
        params: { code },
      },
    } = props;

    if (code && code !== state.code) {
      return {
        code,
      };
    }

    return null;
  }

  componentDidMount() {
    const { code, supportInfo } = this.state;
    window.addEventListener('resize', this.setVideoInfoDebounced);
    this.setVideoInfoDebounced();

    if (!this.isAddedPermissionEvent) {
      this.isAddedPermissionEvent = true;
      this.checkPermissions();
    }

    if (supportInfo.status === 'NONE') {
      this.setConfigDebounced();
    }

    if (code) {
      this.getConference(code);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { code, videoInfo, supportInfo } = this.state;

    if (!this.isAddedPermissionEvent) {
      this.isAddedPermissionEvent = true;
      this.checkPermissions();
    }
    if (supportInfo.status === 'NONE') {
      this.setConfigDebounced();
    }

    if (!videoInfo.init) {
      this.setVideoInfo();
    }

    if (code && code !== prevState.code) {
      this.getConference(code);
    }
  }

  componentWillUnmount() {
    if (this.myStream) {
      this.myStream.getTracks().forEach(function (track) {
        track.stop();
      });
      this.myStream = null;
    }

    this.stopStreamAndVideo(this.myVideo.current);

    if (this.myScreenStream) {
      this.myScreenStream.getTracks().forEach(function (track) {
        track.stop();
      });
      this.myScreenStream = null;
    }
    this.stopStreamAndVideo(this.myScreenStreamVideo.current);

    if (this.setVideoInfoDebounced) {
      this.setVideoInfoDebounced.cancel();
    }

    window.removeEventListener('resize', this.setVideoInfoDebounced);
  }

  showPermissionMessage = (permissionObj) => {
    const { t } = this.props;
    const { supportInfo } = this.state;

    this.setState({
      supportInfo: {
        ...supportInfo,
        permissions: {
          ...this.permissions,
        },
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

  onChangePermission = () => {
    const { supportInfo } = this.state;

    this.setState(
      {
        supportInfo: {
          ...supportInfo,
          permissions: {
            ...this.permissions,
          },
        },
      },
      () => {
        dialog.clearMessage();
        this.setConfigDebounced();
      },
    );
  };

  checkPermissions = () => {
    navigator.permissions
      .query({ name: 'microphone' })
      .then((permissionObj) => {
        this.permissions.microphone = permissionObj.state;
        this.showPermissionMessage(permissionObj);

        permissionObj.onchange = () => {
          this.permissions.microphone = permissionObj.state;
          this.onChangePermission(permissionObj);
        };
      })
      .catch(() => {
        // console.log(error);
      });

    navigator.permissions
      .query({ name: 'camera' })
      .then((permissionObj) => {
        this.permissions.camera = permissionObj.state;
        this.showPermissionMessage(permissionObj);
        permissionObj.onchange = () => {
          this.permissions.camera = permissionObj.state;
          this.onChangePermission(permissionObj);
        };
      })
      .catch(() => {
        // console.log(error);
      });
  };

  setConfig = () => {
    const { t } = this.props;
    const { supportInfo } = this.state;

    const nextSupportInfo = { ...supportInfo };
    nextSupportInfo.status = 'READY';

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      nextSupportInfo.supportUserMedia = false;
      nextSupportInfo.deviceInfo = {
        supported: false,
        errorName: t('미디어 API 오류'),
        errorMessage: t('디바이스 목록을 가져올 수 없습니다.'),
        devices: [],
      };
    } else {
      navigator.mediaDevices
        .enumerateDevices()
        .then((list) => {
          const { supportInfo: currentSupportedInfo } = this.state;

          const nextCurrentSupportedInfo = {
            ...currentSupportedInfo,
          };

          nextCurrentSupportedInfo.supportUserMedia = false;
          nextCurrentSupportedInfo.deviceInfo = {
            supported: true,
            errorName: '',
            errorMessage: '',
            devices: list.slice(0),
          };

          this.setState({
            supportInfo: nextCurrentSupportedInfo,
          });
        })
        .catch((e) => {
          const { supportInfo: currentSupportedInfo } = this.state;

          const nextCurrentSupportedInfo = {
            ...currentSupportedInfo,
          };

          nextCurrentSupportedInfo.supportUserMedia = false;
          nextCurrentSupportedInfo.deviceInfo = {
            supported: false,
            errorName: e.name,
            errorMessage: e.message,
            devices: [],
          };

          this.setState({
            supportInfo: nextCurrentSupportedInfo,
          });
        });
    }

    this.setState({
      supportInfo: nextSupportInfo,
    });

    if (!nextSupportInfo.deviceInfo.supported) {
      return;
    }

    console.log(supportInfo);

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.myStream = stream;
        this.myConfigVideo.srcObject = stream;

        const { supportInfo: currentSupportedInfo } = this.state;

        const nextCurrentSupportedInfo = {
          ...currentSupportedInfo,
        };

        nextCurrentSupportedInfo.supportUserMedia = true;
        nextCurrentSupportedInfo.enabledAudio = true;
        nextCurrentSupportedInfo.enabledVideo = true;

        this.setState({
          supportInfo: nextCurrentSupportedInfo,
        });
      })
      .catch((e) => {
        // 일부 허용된 경우, 허용된 것만 보여주도록
        if (supportInfo.permissions.microphone === 'granted' || supportInfo.permissions.camera === 'granted') {
          navigator.mediaDevices
            .getUserMedia({
              ...constraints,
              video: supportInfo.permissions.camera === 'granted',
              audio: supportInfo.permissions.microphone === 'granted',
            })
            .then((stream) => {
              this.myStream = stream;
              this.myConfigVideo.srcObject = stream;

              const { supportInfo: currentSupportedInfo } = this.state;

              const nextCurrentSupportedInfo = {
                ...currentSupportedInfo,
              };

              nextCurrentSupportedInfo.supportUserMedia = true;
              nextCurrentSupportedInfo.enabledAudio = supportInfo.permissions.microphone === 'granted';
              nextCurrentSupportedInfo.enabledVideo = supportInfo.permissions.camera === 'granted';

              this.setState({
                supportInfo: nextCurrentSupportedInfo,
              });
            })
            .catch(() => {
              //
            });

          // 일부 허용된 것만 보여주고, 다시 권한 요청이 발생하도록 재요청
          navigator.mediaDevices.getUserMedia(constraints).catch(() => {
            //
          });
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

          const { supportInfo: currentSupportedInfo } = this.state;

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

          this.setState({
            supportInfo: nextCurrentSupportedInfo,
          });
        }
      });
  };

  setVideoInfo = () => {
    if (this.streamingContent && this.streamingContent.current) {
      const { conference } = this.state;

      const contentWidth = this.streamingContent.current.offsetWidth;
      const contentHeight = this.streamingContent.current.offsetHeight;

      let width;
      let height;
      let videoWidth;
      let videoHeight;

      let connectedUserCount = conference.users.filter((userInfo) => userInfo.participant?.connected).length;
      if (connectedUserCount < 3) {
        connectedUserCount = 4;
      }

      const sqrtNo = Math.ceil(Math.sqrt(connectedUserCount));

      let rows = 0;
      let cols = 0;

      if (contentWidth > contentHeight) {
        rows = sqrtNo;
        cols = Math.ceil(connectedUserCount / rows);
        width = contentWidth / rows;
        height = contentHeight / cols;
      } else {
        cols = sqrtNo;
        rows = Math.ceil(connectedUserCount / cols);

        width = contentWidth / rows;
        height = contentHeight / cols;

        if (height > width * 2) {
          cols = Math.ceil((connectedUserCount / rows) * 2);
          rows = Math.ceil(connectedUserCount / cols);
          width = contentWidth / rows;
          height = contentHeight / cols;
        }
      }

      if (width * 3 > height * 4) {
        videoHeight = height - 32;
        videoWidth = (videoHeight * 4) / 3;
      } else {
        videoWidth = width - 32;
        videoHeight = (videoWidth * 3) / 4;
      }

      this.setState({
        videoInfo: {
          width,
          height,
          videoWidth,
          videoHeight,
          init: true,
        },
      });
    }
  };

  getConference = (code) => {
    const { t } = this.props;
    request.get(
      `/api/conferences/${code}`,
      null,
      (conference) => {
        this.setState(
          {
            conference,
          },
          () => {
            // this.setUpUserMedia(false); // TODO
            this.getUsers(code);
          },
        );
      },
      (error, response) => {
        if (response && response.status === 403) {
          // TODO 권한이 없는 경우, 요청 및 승인 처리
        }

        this.setState({
          conference: {},
        });

        return true;
      },
      t('미팅 정보를 가져오고 있습니다.'),
    );
  };

  getMergeUsersWithParticipants = (participants) => {
    const { conference } = this.state;
    const nextConference = { ...conference };
    const nextUsers = nextConference.users;

    participants.forEach((participant) => {
      const user = nextUsers.find((d) => d.userId === Number(participant.id));

      if (user) {
        user.participant = participant;
      }
    });

    return nextConference;
  };

  getUsers = (code) => {
    const { t } = this.props;
    request.get(
      `/api/conferences/${code}/users`,
      null,
      (participants) => {
        const nextConference = this.getMergeUsersWithParticipants(participants);
        this.setState({
          conference: nextConference,
        });
      },
      null,
      t('미팅 참석자 정보를 가져오고 있습니다.'),
    );
  };

  setUpUserMedia = (retrying) => {
    const { supportInfo } = this.state;

    if (navigator.mediaDevices.getUserMedia) {
      this.setState({
        supportInfo: {
          ...supportInfo,
          retrying,
        },
      });

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.myStream = stream;
          this.myVideo.srcObject = stream;
          this.setState({
            supportInfo: {
              supportUserMedia: true,
              retrying: false,
            },
          });
        })
        .catch((e) => {
          console.log(e);
          setTimeout(() => {
            this.setState({
              supportInfo: {
                supportUserMedia: false,
                retrying: false,
              },
            });
          }, 500);
        });
    } else {
      setTimeout(() => {
        this.setState({
          supportInfo: {
            supportUserMedia: false,
            retrying: false,
          },
        });
      }, 500);
    }
  };

  sendToAll = (type, data) => {
    const { code } = this.state;
    if (this.socket && this.socket.state && this.socket.state.connected) {
      this.socket.sendMessage(`/pub/api/message/conferences/${code}/send`, JSON.stringify({ type, data }));
      return true;
    }

    return false;
  };

  sendToUser = (type, userId, data) => {
    const { code } = this.state;
    if (this.socket && this.socket.state && this.socket.state.connected) {
      this.socket.sendMessage(`/pub/api/message/conferences/${code}/${userId}/send`, JSON.stringify({ type, data }));
      return true;
    }

    return false;
  };

  setUpPeerConnection = (userId, isSender) => {
    const { conference } = this.state;

    if (!userId) return;

    const nextConference = { ...conference };
    const nextUsers = nextConference.users.slice(0);
    const userInfo = nextUsers.find((d) => d.userId === userId);

    if (!userInfo) {
      return;
    }

    if (userInfo.peerConnection) {
      // TODO 초기화 코드 처리 필요
    }

    userInfo.peerConnection = new RTCPeerConnection(peerConnectionConfig);
    if (logging) {
      console.log('SET UP Peer Connection');
    }

    userInfo.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        if (logging) {
          console.log('SEND ICE', userInfo.userId);
        }
        this.sendToUser('ICE', userId, event.candidate);
      }
    };

    userInfo.peerConnection.ontrack = (event) => {
      if (logging) {
        console.log('ON TRACT');
      }
      const [first] = event.streams;
      const video = document.querySelector(`#video-${userInfo.userId}`);
      if (video) {
        video.srcObject = first;
        userInfo.tracking = true;

        this.setState({
          conference: nextConference,
        });
      }
    };

    userInfo.peerConnection.oniceconnectionstatechange = (event) => {
      if (userInfo.peerConnection) {
        const state = userInfo.peerConnection.iceConnectionState;
        if (logging) {
          console.log(`CONNECTED WITH ${userInfo.userId} ${state}`);
        }
        if (state === 'failed' || state === 'closed' || state === 'disconnected') {
          if (logging) {
            userInfo.tracking = false;
            console.log(`DISCONNECTED WITH ${userInfo.userId}`, event);
            this.setState({
              conference: nextConference,
            });
          }
        }
      }
    };

    if (this.myStream) {
      if (userInfo.peerConnection && userInfo.peerConnection.addStream) {
        userInfo.peerConnection.addStream(this.myStream);
      }
    }

    if (isSender) {
      userInfo.peerConnection.createOffer().then(
        (description) => {
          userInfo.peerConnection.setLocalDescription(description).then(() => {
            if (logging) {
              console.log(`SEND OFFER TO ${userInfo.userId}`);
            }
            this.sendToUser('SDP', userId, userInfo.peerConnection.localDescription);
          });
        },
        (e) => {
          console.log(e);
        },
      );
    }

    this.setState({
      conference: nextConference,
    });
  };

  startScreenShare = () => {
    const { controls } = this.state;
    const { user } = this.props;

    const displayMediaOptions = {
      video: {
        cursor: 'always',
      },
      audio: false,
    };

    navigator.mediaDevices
      .getDisplayMedia(displayMediaOptions)
      .then((stream) => {
        console.log(stream);
        this.myScreenStream = stream;

        this.setState(
          {
            screenShare: {
              sharing: false,
              userId: user.id,
            },
            controls: {
              ...controls,
              sharing: true,
            },
          },
          () => {
            setTimeout(() => {
              this.myScreenStreamVideo.current.srcObject = this.myScreenStream;
              this.sendToAll('START_SCREEN_SHARING');
              const { conference } = this.state;

              const otherUsers = conference.users.filter((d) => d.userId !== user.id && d.participant && d.participant.connected);
              console.log(otherUsers);
              otherUsers.forEach((userInfo) => {
                this.setUpScreenSharing(userInfo.userId, true);
              });
            }, 1000);
          },
        );
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  };

  stopScreenShare = () => {
    this.sendToAll('STOP_SCREEN_SHARING');
    this.stopStreamAndVideo(this.myScreenStreamVideo.current);
    this.myScreenStream = null;
    this.setControls('sharing', false);
  };

  clearOtherUserStreamAndVideo = (userId) => {
    const { conference } = this.state;

    if (!userId) return;

    const nextConference = { ...conference };
    const nextUsers = nextConference.users.slice(0);
    const userInfo = nextUsers.find((d) => d.userId === userId);

    if (!userInfo) {
      return;
    }

    console.log(userInfo.peerConnection);

    // TODO 나간 사용자가 화면 공유 중인 경우
    // this.myScreenStream = null;
    // this.stopStreamAndVideo(this.myScreenStreamVideo.current);

    const video = document.querySelector(`#video-${userInfo.userId}`);
    console.log(video);
    if (video) {
      this.stopStreamAndVideo(video);
    }

    this.setState({
      conference: nextConference,
    });
  };

  clearUpScreenSharing = (userId) => {
    const { conference } = this.state;
    const nextConference = { ...conference };
    const nextUsers = nextConference.users.slice(0);
    const userInfo = nextUsers.find((d) => d.userId === userId);

    if (!userInfo) {
      return;
    }

    if (userInfo.screenSharePeerConnection) {
      userInfo.screenSharePeerConnection = null;
      this.setState({
        conference: nextConference,
      });
    }

    this.stopStreamAndVideo(this.myScreenStreamVideo.current);
    this.myScreenStream = null;
  };

  stopStreamAndVideo = (video) => {
    console.log(video);
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  setUpScreenSharing = (userId, isSender) => {
    console.log('setUpScreenSharing', userId, isSender);
    const { conference } = this.state;

    if (!userId) return;

    const nextConference = { ...conference };
    const nextUsers = nextConference.users.slice(0);
    const userInfo = nextUsers.find((d) => d.userId === userId);

    if (!userInfo) {
      return;
    }

    if (userInfo.screenSharePeerConnection) {
      // TODO 초기화 코드 처리 필요
    }

    userInfo.screenSharePeerConnection = new RTCPeerConnection(peerConnectionConfig);
    if (logging) {
      console.log('SET UP Screen Share Peer Connection');
    }

    userInfo.screenSharePeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        if (logging) {
          console.log('SEND Screen Share ICE', userInfo.userId);
        }
        this.sendToUser('SCREEN_SHARE_ICE', userId, event.candidate);
      }
    };

    userInfo.screenSharePeerConnection.ontrack = (event) => {
      if (logging) {
        console.log('ON SCREEN SHARE TRACT');
      }
      const [first] = event.streams;
      if (this.myScreenStreamVideo.current) {
        this.myScreenStream = first;
        this.myScreenStreamVideo.current.srcObject = first;
        // userInfo.tracking = true;

        this.setState({
          conference: nextConference,
        });
      }
    };

    userInfo.screenSharePeerConnection.oniceconnectionstatechange = (event) => {
      const state = userInfo.screenSharePeerConnection.iceConnectionState;
      if (logging) {
        console.log(`CONNECTED SCREEN SHARE WITH ${userInfo.userId} ${state}`);
      }
      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        if (logging) {
          // userInfo.tracking = false;
          console.log(`DISCONNECTED SCREEN SHARE WITH ${userInfo.userId}`, event);
          this.setState({
            conference: nextConference,
          });
        }
      }
    };

    if (this.myScreenStream) {
      if (userInfo.screenSharePeerConnection && userInfo.screenSharePeerConnection.addStream) {
        userInfo.screenSharePeerConnection.addStream(this.myScreenStream);
      }
    }

    if (isSender) {
      userInfo.screenSharePeerConnection.createOffer().then(
        (description) => {
          userInfo.screenSharePeerConnection.setLocalDescription(description).then(() => {
            if (logging) {
              console.log(`SEND SCREEN SHARE OFFER TO ${userInfo.userId}`);
            }
            this.sendToUser('SCREEN_SHARE_SDP', userId, userInfo.screenSharePeerConnection.localDescription);
          });
        },
        (e) => {
          console.log(e);
        },
      );
    }
  };

  onMessage = (info) => {
    const {
      senderInfo,
      data: { type, data },
    } = info;

    const { user } = this.props;
    const {
      conference,
      conference: { users },
    } = this.state;

    console.log(info);
    // console.log(type, data, senderInfo);

    const isMe = Number(senderInfo.id) === Number(user.id);

    switch (type) {
      case 'AUDIO':
      case 'VIDEO': {
        const nextConference = { ...conference };
        const nextUsers = nextConference.users;
        const targetUser = nextUsers.find((d) => Number(d.userId) === Number(senderInfo.id));
        if (targetUser) {
          targetUser.participant = { ...targetUser.participant, ...data };
          this.setState({
            conference: nextConference,
          });
        }
        break;
      }

      case 'START_SCREEN_SHARING': {
        if (!isMe) {
          console.log(type, data);
          this.setState({
            screenShare: {
              sharing: true,
              userId: senderInfo.id,
            },
          });
        }

        break;
      }

      case 'STOP_SCREEN_SHARING': {
        this.setState({
          screenShare: {
            sharing: false,
            userId: null,
          },
        });
        if (!isMe) {
          this.clearUpScreenSharing(senderInfo.id);
        }

        break;
      }

      case 'LEAVE': {
        if (!isMe) {
          this.clearOtherUserStreamAndVideo(senderInfo.id);
        }
        const nextConference = this.getMergeUsersWithParticipants([data.participant]);
        this.setState(
          {
            conference: nextConference,
          },
          () => {
            this.setVideoInfo();
          },
        );
        break;
      }

      case 'JOIN': {
        const nextConference = this.getMergeUsersWithParticipants([data.participant]);

        this.setState(
          {
            conference: nextConference,
          },
          () => {
            this.setVideoInfo();
            if (!isMe) {
              // 다른 사람이 조인한 경우,
              setTimeout(() => {
                // const targetUser = users.find((d) => Number(d.userId) === Number(senderInfo.id));
                this.setUpPeerConnection(senderInfo.id, true);
              }, 3000);
            }
          },
        );

        break;
      }

      case 'SCREEN_SHARE_ICE': {
        if (!isMe) {
          const targetUser = users.find((d) => Number(d.userId) === Number(senderInfo.id));
          if (!targetUser.screenSharePeerConnection) {
            this.setUpScreenSharing(senderInfo.id, false);
          }
          targetUser.screenSharePeerConnection.addIceCandidate(new RTCIceCandidate(data)).catch((e) => {
            console.log(e);
          });
        }

        break;
      }

      case 'SCREEN_SHARE_SDP': {
        if (!isMe) {
          const targetUser = users.find((d) => Number(d.userId) === Number(senderInfo.id));
          if (!targetUser.screenSharePeerConnection) {
            this.setUpScreenSharing(senderInfo.id, false);
          }
          if (logging) {
            console.log(`RECEIVE SCREEN SHARE SDP FROM ${senderInfo.id}`, data.type);
          }
          targetUser.screenSharePeerConnection.setRemoteDescription(new RTCSessionDescription(data)).then(() => {
            if (data.type === 'offer') {
              targetUser.screenSharePeerConnection
                .createAnswer()
                .then((description) => {
                  targetUser.screenSharePeerConnection.setLocalDescription(description).then(() => {
                    if (logging) {
                      console.log(`SEND SCREEN SHARE  ANSWER TO ${senderInfo.id}`);
                    }
                    this.sendToUser('SCREEN_SHARE_SDP', senderInfo.id, targetUser.screenSharePeerConnection.localDescription);
                  });
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          });
        }

        break;
      }

      case 'ICE': {
        if (!isMe) {
          const targetUser = users.find((d) => Number(d.userId) === Number(senderInfo.id));
          if (!targetUser.peerConnection) {
            this.setUpPeerConnection(senderInfo.id, false);
          }
          targetUser.peerConnection.addIceCandidate(new RTCIceCandidate(data)).catch((e) => {
            console.log(e);
          });
        }

        break;
      }
      case 'SDP': {
        if (!isMe) {
          const targetUser = users.find((d) => Number(d.userId) === Number(senderInfo.id));
          if (!targetUser.peerConnection) {
            this.setUpPeerConnection(senderInfo.id, false);
          }
          if (logging) {
            console.log(`RECEIVE SDP FROM ${senderInfo.id}`, data.type);
          }
          targetUser.peerConnection.setRemoteDescription(new RTCSessionDescription(data)).then(() => {
            if (data.type === 'offer') {
              targetUser.peerConnection
                .createAnswer()
                .then((description) => {
                  targetUser.peerConnection.setLocalDescription(description).then(() => {
                    if (logging) {
                      console.log(`SEND ANSWER TO ${senderInfo.id}`);
                    }
                    this.sendToUser('SDP', senderInfo.id, targetUser.peerConnection.localDescription);
                  });
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          });
        }

        break;
      }

      default: {
        break;
      }
    }
  };

  setAlign = (align) => {
    this.setState({
      align,
    });
  };

  setControls = (field, value) => {
    const { controls } = this.state;

    this.setState(
      {
        controls: { ...controls, [field]: value },
      },
      () => {
        if (field === 'audio' || field === 'video') {
          const { controls: nextControls } = this.state;
          const audioTrack = this.myStream.getTracks().find((d) => d.kind === field);
          if (audioTrack) {
            audioTrack.enabled = nextControls[field];
          }
          this.sendToAll(field.toUpperCase(), { [field]: nextControls[field] });
        }
      },
    );
  };

  render() {
    const { history, t, user } = this.props;
    const { conference, align, supportInfo, videoInfo, controls, screenShare } = this.state;

    const existConference = conference && conference.id;

    const isSharing = screenShare.sharing || controls.sharing;

    console.log(supportInfo);

    return (
      <Page className="conference-wrapper">
        {existConference && supportInfo.status !== 'COMPLETE' && (
          <div className="user-media-config">
            <div>
              <div>
                <VideoElement
                  useVideoInfo={!isSharing}
                  videoInfo={videoInfo}
                  onRef={(d) => {
                    this.myConfigVideo = d;
                  }}
                  controls={controls}
                  supportInfo={supportInfo}
                  alias={user.alias}
                  setUpUserMedia={this.setConfig}
                  muted
                />
              </div>
              <div className="user-media-config-buttons">
                <Button size="lg" rounded color="white" outline onClick={() => {}} className={supportInfo.enabledAudio ? '' : ''}>
                  {supportInfo.enabledVideo && <i className="fas fa-video" />}
                  {!supportInfo.enabledVideo && <i className="fas fa-video-slash" />}
                </Button>
                <Button size="lg" rounded color="white" outline onClick={() => {}} className={supportInfo.enabledAudio ? '' : ''}>
                  {supportInfo.enabledAudio && <i className="fas fa-microphone" />}
                  {!supportInfo.enabledAudio && <i className="fas fa-microphone-slash" />}
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
        )}
        {existConference && supportInfo.status === 'COMPLETE' && (
          <>
            <SocketClient
              topics={[`/sub/conferences/${conference.code}`, `/sub/conferences/${conference.code}/${user.id}`]}
              onMessage={this.onMessage}
              onConnect={() => {
                if (user.id) {
                  this.sendToAll('JOIN', controls);
                }
              }}
              onDisconnect={() => {}}
              setRef={(client) => {
                this.socket = client;
              }}
            />
            <PageTitle className="d-none">{conference?.name}</PageTitle>
            <PageContent className="conference-content">
              <div className="streaming-content">
                <div>
                  <div className={`video-content ${isSharing ? 'sharing' : ''}`} ref={this.streamingContent}>
                    {isSharing && (
                      <div className="screen-sharing-content">
                        <div>
                          <video ref={this.myScreenStreamVideo} autoPlay playsInline />
                        </div>
                      </div>
                    )}
                    <div className="video-list-content">
                      <div>
                        <div className="videos">
                          <VideoElement
                            useVideoInfo={!isSharing}
                            videoInfo={videoInfo}
                            onRef={(d) => {
                              this.myVideo = d;
                            }}
                            controls={controls}
                            supportInfo={supportInfo}
                            alias={user.alias}
                            setUpUserMedia={this.setUpUserMedia}
                            muted
                          />
                          {conference.users
                            .filter((userInfo) => Number(userInfo.userId) !== Number(user.id))
                            .filter((userInfo) => userInfo.participant?.connected)
                            .map((userInfo) => {
                              return (
                                <VideoElement
                                  useVideoInfo={!isSharing}
                                  key={userInfo.id}
                                  id={`video-${userInfo.userId}`}
                                  videoInfo={videoInfo}
                                  tracking={userInfo.tracking}
                                  controls={controls}
                                  alias={userInfo.alias}
                                  imageType={userInfo.imageType}
                                  imageData={userInfo.imageData}
                                />
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="controls">
                    <Button
                      className="first"
                      size="md"
                      rounded
                      color="white"
                      outline
                      onClick={() => {
                        this.setControls('audio', !controls.audio);
                      }}
                    >
                      {controls.audio && <i className="fas fa-microphone" />}
                      {!controls.audio && <i className="fas fa-microphone-slash" />}
                    </Button>
                    <Button
                      size="md"
                      rounded
                      color="white"
                      outline
                      onClick={() => {
                        this.setControls('video', !controls.video);
                      }}
                    >
                      {controls.video && <i className="fas fa-video" />}
                      {!controls.video && <i className="fas fa-video-slash" />}
                    </Button>
                    <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                    {!screenShare.sharing && !controls.sharing && (
                      <Button size="md" rounded data-tip={t('내 화면 공유')} color="white" outline onClick={this.startScreenShare}>
                        <i className="fas fa-desktop" />
                      </Button>
                    )}
                    {!screenShare.sharing && controls.sharing && (
                      <Button size="md" rounded data-tip={t('공유 중지')} color="danger" onClick={this.stopScreenShare}>
                        <i className="fas fa-desktop" />
                      </Button>
                    )}
                    {screenShare.sharing && (
                      <Button size="md" data-tip={t('공유 중지 요청')} color="danger" onClick={() => {}}>
                        공유 중지 요청
                      </Button>
                    )}
                    <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                    <Button size="md" rounded color="danger" outline onClick={() => {}}>
                      <i className="fas fa-times" />
                    </Button>
                    <div className="participants-button">
                      <Button
                        size="md"
                        rounded
                        color="white"
                        outline
                        onClick={() => {
                          this.setControls('participants', !controls.participants);
                        }}
                      >
                        {controls.participants && <i className="fas fa-toggle-on" />}
                        {!controls.participants && <i className="fas fa-toggle-off" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {controls.participants && (
                <div className="participants-list">
                  <ParticipantsList conference={conference} align={align} setAlign={this.setAlign} sharingUserId={screenShare.userId} />
                </div>
              )}
            </PageContent>
          </>
        )}
        {conference && !existConference && (
          <>
            <PageTitle>미팅 참석</PageTitle>
            <PageContent>
              <div className="h-100 d-flex justify-content-center">
                <div className="align-self-center ">
                  <div>{t('미팅 정보를 찾을 수 없습니다.')}</div>
                  <div className="text-center mt-3">
                    <Button
                      size="sm"
                      color="white"
                      outline
                      onClick={() => {
                        history.push('/meetings/new');
                      }}
                    >
                      <i className="fas fa-plus" /> 새 미팅
                    </Button>
                  </div>
                </div>
              </div>
            </PageContent>
          </>
        )}
      </Page>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(Conference)));

Conference.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      code: PropTypes.string,
    }),
  }),
};
