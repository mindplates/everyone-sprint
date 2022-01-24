import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import _, { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Button, ConferenceVideoItem, Liner, Page, PageContent, PageTitle, ParticipantsList, SocketClient } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import ConferenceDeviceConfig from '@/pages/Meetings/Conference/ConferenceDeviceConfig';
import EmptyConference from './EmptyConference';
import mediaUtil from '@/utils/mediaUtil';
import './Conference.scss';

const peerConnectionConfig = {
  iceServers: [{ urls: 'stun:stun.services.mozilla.com' }, { urls: 'stun:stun.l.google.com:19302' }],
};

class Conference extends React.Component {
  myStream = null;

  myCanvasStream = null;

  myScreenStream = null;

  myScreenStreamVideo = createRef();

  socket = createRef();

  myVideo = createRef();

  streamingContent = createRef();

  setVideoInfoDebounced;

  userStreams = {};

  constructor(props) {
    super(props);

    this.setVideoInfoDebounced = debounce(this.setVideoInfo, 100);

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
        participants: false,
        sharing: false,
      },
      screenShare: {
        sharing: false,
      },
      isSetting: true,
      supportInfo: {
        permissions: {
          microphone: null,
          camera: null,
        },
        deviceInfo: {
          supported: true,
          errorMessage: '',
          devices: [],
        },
        enabledAudio: null,
        enabledVideo: null,
        mediaConfig: {
          speaker: {
            deviceId: null,
          },
          audio: {
            deviceId: null,
            capabilities: [],
          },
          video: {
            deviceId: null,
            settings: {
              width: null,
              height: null,
            },
            capabilities: [],
          },
          sendResolution: 720,
          receiveResolution: 720,
        },
      },
      pixInfo: {
        enabled: false,
        type: 'effect',
        key: 'none',
        value: null,
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
    const { code } = this.state;
    window.addEventListener('resize', this.setVideoInfoDebounced);
    this.setVideoInfoDebounced();

    if (code) {
      this.getConference(code);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { code, videoInfo } = this.state;

    if (!videoInfo.init) {
      this.setVideoInfo();
    }

    if (code && code !== prevState.code) {
      this.getConference(code);
    }
  }

  componentWillUnmount() {
    if (this.myStream) {
      this.myStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.myStream = null;
    }

    this.stopStreamAndVideo(this.myVideo.current);

    if (this.myScreenStream) {
      this.myScreenStream.getTracks().forEach((track) => {
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

  setVideoInfo1 = () => {
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

  setVideoInfo = () => {
    if (this.streamingContent && this.streamingContent.current) {
      const { conference, videoInfo } = this.state;

      const contentWidth = this.streamingContent.current.offsetWidth;
      const contentHeight = this.streamingContent.current.offsetHeight;

      const rate = contentWidth / contentHeight;
      const connectedUserCount = conference.users.filter((userInfo) => userInfo.participant?.connected).length;
      /*
      if (connectedUserCount < 3) {
        connectedUserCount = 3;
      }
       */

      let rows;
      let cols;

      if (rate >= 1) {
        const rate1 = contentWidth / contentHeight;
        rows = Math.ceil(connectedUserCount / (rate1 + 1));
        if (rows < 1) {
          rows = 1;
        }
        cols = Math.ceil(connectedUserCount / rows);
      } else {
        const rate1 = contentHeight / contentWidth;
        cols = Math.floor(connectedUserCount / (rate1 + 1));
        if (cols < 1) {
          cols = 1;
        }
        rows = Math.ceil(connectedUserCount / cols);
      }

      if (!videoInfo.init || videoInfo.rows !== rows || videoInfo.cols !== cols) {
        this.setState({
          videoInfo: {
            rows,
            cols,
            init: true,
          },
        });
      }
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

  setSupportInfo = (nextSupportInfo, callback) => {
    const { supportInfo } = this.state;

    this.setState(
      {
        supportInfo: _.merge(supportInfo, nextSupportInfo),
      },
      () => {
        if (callback) {
          callback();
        }
      },
    );
  };

  setDeviceInfoSupported = (value) => {
    const { supportInfo } = this.state;

    if (supportInfo.deviceInfo.supported !== value) {
      this.setSupportInfo({
        deviceInfo: {
          supported: value,
        },
      });
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

    userInfo.peerConnection = new RTCPeerConnection(peerConnectionConfig);
    userInfo.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendToUser('ICE', userId, event.candidate);
      }
    };

    userInfo.peerConnection.ontrack = (event) => {
      const [first] = event.streams;
      if (this.userStreams[userInfo.userId]) {
        this.userStreams[userInfo.userId] = null;
      }

      this.userStreams[userInfo.userId] = first;
      userInfo.tracking = true;
      this.setState({
        conference: nextConference,
      });
    };

    userInfo.peerConnection.oniceconnectionstatechange = () => {
      if (userInfo.peerConnection) {
        const state = userInfo.peerConnection.iceConnectionState;

        if (state === 'failed' || state === 'closed' || state === 'disconnected') {
          userInfo.tracking = false;
          this.setState({
            conference: nextConference,
          });
        }
      }
    };

    if (this.myStream) {
      if (userInfo.peerConnection && userInfo.peerConnection.addStream) {
        const { pixInfo } = this.state;

        console.log(pixInfo.enabled, this.myCanvasStream);

        if (pixInfo.enabled && this.myCanvasStream) {
          userInfo.peerConnection.addStream(this.myCanvasStream);
        } else {
          userInfo.peerConnection.addStream(this.myStream);
        }
      }
    }

    if (isSender) {
      userInfo.peerConnection.createOffer().then(
        (description) => {
          userInfo.peerConnection.setLocalDescription(description).then(() => {
            this.sendToUser('SDP', userId, userInfo.peerConnection.localDescription);
          });
        },
        (e) => {
          console.error(e);
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

    if (userInfo.peerConnection) {
      userInfo.peerConnection.close();
      userInfo.peerConnection = null;
    }

    // TODO 나간 사용자가 화면 공유 중인 경우
    // this.myScreenStream = null;
    // this.stopStreamAndVideo(this.myScreenStreamVideo.current);

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
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  setUpScreenSharing = (userId, isSender) => {
    const { conference } = this.state;

    if (!userId) return;

    const nextConference = { ...conference };
    const nextUsers = nextConference.users.slice(0);
    const userInfo = nextUsers.find((d) => d.userId === userId);

    if (!userInfo) {
      return;
    }

    if (userInfo.screenSharePeerConnection) {
      userInfo.screenSharePeerConnection.close();
      userInfo.screenSharePeerConnection = null;
    }

    userInfo.screenSharePeerConnection = new RTCPeerConnection(peerConnectionConfig);
    userInfo.screenSharePeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendToUser('SCREEN_SHARE_ICE', userId, event.candidate);
      }
    };

    userInfo.screenSharePeerConnection.ontrack = (event) => {
      const [first] = event.streams;
      if (this.myScreenStreamVideo.current) {
        this.myScreenStream = first;
        this.myScreenStreamVideo.current.srcObject = first;
        userInfo.tracking = true;

        this.setState({
          conference: nextConference,
        });
      }
    };

    userInfo.screenSharePeerConnection.oniceconnectionstatechange = () => {
      const state = userInfo.screenSharePeerConnection.iceConnectionState;

      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        userInfo.tracking = false;
        this.setState({
          conference: nextConference,
        });
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
            this.sendToUser('SCREEN_SHARE_SDP', userId, userInfo.screenSharePeerConnection.localDescription);
          });
        },
        (e) => {
          console.error(e);
        },
      );
    }
  };

  onMessage = (info) => {
    const {
      senderInfo,
      data: { type, data },
    } = info;

    const {
      conference,
      conference: { users },
      isSetting,
    } = this.state;

    const { user } = this.props;

    // console.log(type, data, senderInfo);

    const isMe = Number(senderInfo.id) === Number(user.id);

    switch (type) {
      case 'LEAVE': {
        const nextConference = this.getMergeUsersWithParticipants([data.participant]);
        if (this.userStreams[senderInfo.id]) {
          this.userStreams[senderInfo.id] = null;
        }
        this.setState(
          {
            conference: nextConference,
          },
          () => {
            this.setVideoInfo();
            if (!isMe) {
              this.clearOtherUserStreamAndVideo(senderInfo.id);
            }
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
            if (!isSetting) {
              this.setVideoInfo();
            }
          },
        );

        break;
      }

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

      case 'SCREEN_SHARE_ICE': {
        if (!isMe) {
          const targetUser = users.find((d) => Number(d.userId) === Number(senderInfo.id));
          if (!targetUser.screenSharePeerConnection) {
            this.setUpScreenSharing(senderInfo.id, false);
          }
          targetUser.screenSharePeerConnection.addIceCandidate(new RTCIceCandidate(data)).catch((e) => {
            console.error(e);
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
          targetUser.screenSharePeerConnection.setRemoteDescription(new RTCSessionDescription(data)).then(() => {
            if (data.type === 'offer') {
              targetUser.screenSharePeerConnection
                .createAnswer()
                .then((description) => {
                  targetUser.screenSharePeerConnection.setLocalDescription(description).then(() => {
                    this.sendToUser('SCREEN_SHARE_SDP', senderInfo.id, targetUser.screenSharePeerConnection.localDescription);
                  });
                })
                .catch((e) => {
                  console.error(e);
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
            console.error(e);
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

          targetUser.peerConnection.setRemoteDescription(new RTCSessionDescription(data)).then(() => {
            if (data.type === 'offer') {
              targetUser.peerConnection
                .createAnswer()
                .then((description) => {
                  targetUser.peerConnection.setLocalDescription(description).then(() => {
                    this.sendToUser('SDP', senderInfo.id, targetUser.peerConnection.localDescription);
                  });
                })
                .catch((e) => {
                  console.error(e);
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
    const { controls, isSetting } = this.state;

    this.setState(
      {
        controls: { ...controls, [field]: value },
      },
      () => {
        if (!isSetting) {
          if (field === 'audio' || field === 'video') {
            const { controls: nextControls } = this.state;
            const audioTrack = this.myStream.getTracks().find((d) => d.kind === field);
            if (audioTrack) {
              audioTrack.enabled = nextControls[field];
            }
            this.sendToAll(field.toUpperCase(), { [field]: nextControls[field] });
          }
        }
      },
    );
  };

  setMyMedia = () => {
    if (!mediaUtil.getIsSupportMedia()) {
      return;
    }

    const { supportInfo } = this.state;

    if (!this.myStream) {
      const constraints = mediaUtil.getCurrentConstraints(supportInfo) || {
        video: true,
        audio: true,
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.myStream = stream;
          this.setDeviceInfoSupported(true);
        })
        .catch(() => {
          this.setDeviceInfoSupported(false);
        });
    }
  };

  onJoin = () => {
    const { user } = this.props;
    const { controls } = this.state;
    if (user?.id) {
      this.setState(
        {
          isSetting: false,
        },
        () => {
          this.setMyMedia();
          this.sendToAll('JOIN', controls);
          setTimeout(() => {
            const { conference } = this.state;

            const connectedUsers = conference.users
              .filter((userInfo) => Number(userInfo.userId) !== Number(user.id))
              .filter((userInfo) => userInfo.participant?.connected);

            connectedUsers.forEach((userInfo) => {
              this.setUpPeerConnection(userInfo.userId, true);
            });
          }, 1000);
        },
      );
    }
  };

  setPixInfo = (pixInfo) => {
    this.setState({
      pixInfo,
    });
  };

  setCanvasStream = (stream) => {
    const { conference } = this.state;
    const { user } = this.props;

    this.myCanvasStream = stream;

    const audioTrack = this.myStream.getTracks().filter((track) => {
      return track.kind === 'audio';
    })[0];

    this.myCanvasStream.addTrack(audioTrack);

    const connectedUsers = conference.users
      .filter((userInfo) => Number(userInfo.userId) !== Number(user.id))
      .filter((userInfo) => userInfo.participant?.connected);

    connectedUsers.forEach((userInfo) => {
      if (this.myCanvasStream) {
        if (userInfo.peerConnection && userInfo.peerConnection.addStream) {
          userInfo.peerConnection.addStream(this.myCanvasStream);
        }
      }

      // this.setUpPeerConnection(userInfo.userId, true);
    });
  };

  render() {
    const { history, t, user } = this.props;
    const { conference, align, supportInfo, videoInfo, controls, screenShare, isSetting, pixInfo } = this.state;
    const existConference = conference?.id;
    const isSharing = screenShare.sharing || controls.sharing;

    return (
      <>
        {conference && !existConference && <EmptyConference />}
        {existConference && (
          <Page className="conference-wrapper">
            {existConference && (
              <>
                <SocketClient
                  topics={[`/sub/conferences/${conference.code}`, `/sub/conferences/${conference.code}/${user.id}`]}
                  onMessage={this.onMessage}
                  onConnect={() => {}}
                  onDisconnect={() => {}}
                  setRef={(client) => {
                    this.socket = client;
                  }}
                />
                {isSetting && (
                  <ConferenceDeviceConfig
                    user={user}
                    conference={conference}
                    stream={this.myStream}
                    setStream={(stream) => {
                      this.myStream = stream;
                    }}
                    controls={controls}
                    setControls={this.setControls}
                    supportInfo={supportInfo}
                    setSupportInfo={this.setSupportInfo}
                    onJoinClick={this.onJoin}
                    setPixInfo={this.setPixInfo}
                  />
                )}
                {!isSetting && (
                  <>
                    <PageTitle className="d-none">{conference?.name}</PageTitle>
                    <PageContent className="conference-content">
                      <div className="streaming-content">
                        <div>
                          <div className={`video-content ${isSharing ? 'sharing' : ''}`}>
                            {isSharing && (
                              <div className="screen-sharing-content">
                                <div>
                                  <video ref={this.myScreenStreamVideo} autoPlay playsInline />
                                </div>
                              </div>
                            )}
                            <div className="video-list-content" ref={this.streamingContent}>
                              <div
                                style={{
                                  height: `${100 / videoInfo.rows}%`,
                                  width: `${100 / videoInfo.cols}%`,
                                }}
                              >
                                <ConferenceVideoItem
                                  pixInfo={pixInfo}
                                  useVideoInfo={!isSharing}
                                  controls={controls}
                                  supportInfo={supportInfo}
                                  alias={user.alias}
                                  muted
                                  stream={this.myStream}
                                  setCanvasStream={this.setCanvasStream}
                                />
                              </div>
                              {conference.users
                                .filter((userInfo) => Number(userInfo.userId) !== Number(user.id))
                                .filter((userInfo) => userInfo.participant?.connected)
                                .map((userInfo) => {
                                  return (
                                    <div
                                      key={userInfo.id}
                                      style={{
                                        height: `${100 / videoInfo.rows}%`,
                                        width: `${100 / videoInfo.cols}%`,
                                      }}
                                    >
                                      <ConferenceVideoItem
                                        useVideoInfo={!isSharing}
                                        id={`video-${userInfo.userId}`}
                                        stream={this.userStreams[userInfo.userId]}
                                        tracking={userInfo.tracking}
                                        alias={userInfo.alias}
                                        imageType={userInfo.imageType}
                                        imageData={userInfo.imageData}
                                        controls={{
                                          audio: userInfo.participant.audio,
                                          video: userInfo.participant.video,
                                        }}
                                      />
                                    </div>
                                  );
                                })}
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
                            <Button
                              size="md"
                              rounded
                              color="danger"
                              outline
                              onClick={() => {
                                history.push('/');
                              }}
                            >
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
              </>
            )}
          </Page>
        )}
      </>
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
