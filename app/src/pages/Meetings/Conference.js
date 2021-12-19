import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { debounce } from 'lodash';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import { Block, BlockTitle, Button, Page, PageContent, PageTitle, SocketClient, UserImage } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import RadioButton from '@/components/RadioButton/RadioButton';
import dateUtil from '@/utils/dateUtil';
import images from '@/images';
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

const USER_ALIGNS = {
  CONNECT: 'CONNECT',
  NAME: 'NAME',
};

const USER_ALIGNS_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
};

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
        type: USER_ALIGNS.CONNECT,
        order: USER_ALIGNS_ORDER.ASC,
      },
      supportInfo: {
        supportUserMedia: null,
        retrying: false,
      },
      videoInfo: {
        init: false,
        width: 320,
        height: 240,
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

      const connectedUserCount = conference.users.filter((userInfo) => userInfo.participant?.connected).length;

      const sqrtNo = Math.ceil(Math.sqrt(connectedUserCount));

      let rows = 0;
      let cols = 0;

      if (contentWidth > contentHeight) {
        rows = sqrtNo;
        cols = Math.ceil(connectedUserCount / rows);
        width = (contentWidth - 16 * rows) / rows;
        height = (contentHeight - 16 * (cols - 1)) / cols;
      } else {
        cols = sqrtNo;
        rows = Math.ceil(connectedUserCount / cols);

        width = (contentWidth - 16 * rows) / rows;
        height = (contentHeight - 16 * (cols - 1)) / cols;

        if (height > width * 2) {
          cols = Math.ceil((connectedUserCount / rows) * 2);
          rows = Math.ceil(connectedUserCount / cols);
          width = (contentWidth - 16 * rows) / rows;
          height = (contentHeight - 16 * (cols - 1)) / cols;
        }
      }

      this.setState({
        videoInfo: {
          width,
          height,
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
          this.myVideo.current.srcObject = stream;
          this.setState({
            supportInfo: {
              supportUserMedia: true,
              retrying: false,
            },
          });
        })
        .catch(() => {
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

  send = (type, data) => {
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
      conference: { users },
    } = this.state;

    // console.log(info);
    // console.log(type, data, senderInfo);

    const isMe = Number(senderInfo.id) === Number(user.id);

    switch (type) {
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

  render() {
    const { history, t, user } = this.props;
    const {
      conference,
      align: { type, order },
      supportInfo,
      videoInfo,
    } = this.state;

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
                  this.send('JOIN', user);
                }
              }}
              onDisconnect={() => {}}
              setRef={(client) => {
                this.socket = client;
              }}
            />
            <PageTitle>{conference?.name}</PageTitle>
            <div className="conference-content">
              <div className="streaming-content" ref={this.streamingContent}>
                <div>
                  <div className="videos">
                    <div
                      className="video-content"
                      style={{
                        width: `${videoInfo.width}px`,
                        height: `${videoInfo.height}px`,
                      }}
                    >
                      <div className="name">
                        <span>{user.alias}</span>
                      </div>
                      {supportInfo.supportUserMedia !== null && !supportInfo.supportUserMedia && (
                        <div className="not-supported-user-media">
                          <div>
                            <div className="message">
                              미디어를 사용할 수 없습니다
                              {supportInfo.retrying && (
                                <div className="loading">
                                  <img src={images.spinner} alt="loading" />
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              color="white"
                              outline
                              onClick={() => {
                                this.setUpUserMedia(true);
                              }}
                            >
                              <i className="fas fa-retweet" /> 다시 시도
                            </Button>
                          </div>
                        </div>
                      )}
                      <video ref={this.myVideo} autoPlay playsInline muted>
                        <div className="name">
                          <span>{user.alias}</span>
                        </div>
                      </video>
                    </div>
                    {conference.users
                      .filter((userInfo) => Number(userInfo.userId) !== Number(user.id))
                      .filter((userInfo) => userInfo.participant?.connected)
                      .map((userInfo) => {
                        return (
                          <div
                            key={userInfo.id}
                            style={{
                              width: `${videoInfo.width}px`,
                              height: `${videoInfo.height}px`,
                            }}
                            className={`video-content ${userInfo.tracking ? 'tracking' : ''}`}
                          >
                            <video id={`video-${userInfo.userId}`} playsInline autoPlay />
                            <div className="name">
                              <span>{userInfo.alias}</span>
                            </div>
                            <div className="no-tracking-info">
                              <div>
                                <UserImage border rounded size="60px" iconFontSize="24px" imageType={userInfo.imageType} imageData={userInfo.imageData} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className="users">
                <Block className="p-2 user-list-content">
                  <BlockTitle size="sm" className="title pt-0">
                    <div className="title-content">
                      <div>{t('참석자')}</div>
                      <div className="user-align-content">
                        <RadioButton
                          className="user-align"
                          size="xs"
                          items={[
                            { key: USER_ALIGNS.CONNECT, value: <i className="fas fa-wifi" /> },
                            {
                              key: USER_ALIGNS.NAME,
                              value: <i className={` ${order === USER_ALIGNS_ORDER.ASC ? 'fas fa-sort-alpha-down' : 'fas fa-sort-alpha-up'} `} />,
                            },
                          ]}
                          value={type}
                          onClick={(val) => {
                            if (type === USER_ALIGNS.NAME && val === USER_ALIGNS.NAME) {
                              this.setState({
                                align: {
                                  type: val,
                                  order: order === USER_ALIGNS_ORDER.ASC ? USER_ALIGNS_ORDER.DESC : USER_ALIGNS_ORDER.ASC,
                                },
                              });
                            } else {
                              this.setState({
                                align: {
                                  type: val,
                                  order,
                                },
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </BlockTitle>
                  <div className="user-list">
                    <div className="g-scrollbar">
                      <ul>
                        {conference?.users
                          .sort((a, b) => {
                            if (type === USER_ALIGNS.NAME && order === USER_ALIGNS_ORDER.ASC) {
                              return a.alias.localeCompare(b.alias);
                            }

                            if (type === USER_ALIGNS.NAME && order === USER_ALIGNS_ORDER.DESC) {
                              return b.alias.localeCompare(a.alias);
                            }

                            const aString = `${a.participant?.connected ? 'A' : 'B'}${a.userId}`;
                            const bString = `${b.participant?.connected ? 'A' : 'B'}${b.userId}`;

                            return aString.localeCompare(bString);
                          })
                          .map((d) => {
                            return (
                              <li key={d.id} className={`${d.participant?.connected ? 'connected' : ''} ${d.participant ? 'visited' : ''}`}>
                                <div className="connect-status">
                                  <div />
                                </div>
                                <div className="user-icon">
                                  <UserImage border rounded size="30px" iconFontSize="14px" imageType={d.imageType} imageData={d.imageData} />
                                </div>
                                <div className="user-info">
                                  <div className="user-name">{d.alias}</div>
                                  <div className="user-connect-info">
                                    {d.participant && (
                                      <div>
                                        {d.participant.connected && d.participant.joinTime && (
                                          <span>
                                            <span>
                                              <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getDate(d.participant.joinTime)} />
                                            </span>
                                            <span className="attendance-statue">{t('참석')}</span>
                                          </span>
                                        )}
                                        {!d.participant.connected && d.participant.leaveTime && (
                                          <span>
                                            <span>
                                              <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getDate(d.participant.leaveTime)} />
                                            </span>
                                            <span className="attendance-statue">{t('나감')}</span>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {!d.participant && <div>{t('참석안함')}</div>}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  </div>
                </Block>
              </div>
            </div>
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
