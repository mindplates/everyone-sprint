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

  socket = createRef();

  myVideo = createRef();

  streamingContent = createRef();

  setVideoInfoDebounced;

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
      supportInfo: {
        supportUserMedia: null,
        retrying: false,
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
      this.myStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    if (this.setVideoInfoDebounced) {
      this.setVideoInfoDebounced.cancel();
    }

    window.removeEventListener('resize', this.setVideoInfoDebounced);
  }

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
            this.setUpUserMedia(false);
            this.getUsers(code);
          },
        );
      },
      (error, response) => {
        if (response.status === 403) {
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

      case 'LEAVE': {
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

  toggleMyAudio = () => {
    const { controls } = this.state;

    this.setState(
      {
        controls: { ...controls, audio: !controls.audio },
      },
      () => {
        const { controls: nextControls } = this.state;
        const audioTrack = this.myStream.getTracks().find((d) => d.kind === 'audio');
        if (audioTrack) {
          audioTrack.enabled = nextControls.audio;
        }
        this.sendToAll('AUDIO', { audio: nextControls.audio });
      },
    );
  };

  toggleMyVideo = () => {
    const { controls } = this.state;

    this.setState(
      {
        controls: { ...controls, video: !controls.video },
      },
      () => {
        const { controls: nextControls } = this.state;
        const videoTrack = this.myStream.getTracks().find((d) => d.kind === 'video');
        if (videoTrack) {
          videoTrack.enabled = nextControls.video;
        }
        this.sendToAll('VIDEO', { video: nextControls.video });
      },
    );
  };

  render() {
    const { history, t, user } = this.props;
    const { conference, align, supportInfo, videoInfo, controls } = this.state;

    const existConference = conference && conference.id;

    return (
      <Page className="conference-wrapper">
        {existConference && (
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
                  <div className="video-content" ref={this.streamingContent}>
                    <div>
                      <div className="videos">
                        <VideoElement
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
                  <div className="controls">
                    <Button className="first" size="md" rounded color="white" outline onClick={this.toggleMyAudio}>
                      {controls.audio && <i className="fas fa-microphone" />}
                      {!controls.audio && <i className="fas fa-microphone-slash" />}
                    </Button>
                    <Button size="md" rounded color="white" outline onClick={this.toggleMyVideo}>
                      {controls.video && <i className="fas fa-video" />}
                      {!controls.video && <i className="fas fa-video-slash" />}
                    </Button>
                    <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                    <Button size="md" rounded color="danger" outline onClick={this.toggleMyVideo}>
                      <i className="fas fa-times" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="participants-list">
                <ParticipantsList conference={conference} align={align} setAlign={this.setAlign} />
              </div>
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
