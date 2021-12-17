import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import { Block, BlockTitle, Button, Page, PageContent, PageTitle, SocketClient, UserImage } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import './Conference.scss';
import RadioButton from '@/components/RadioButton/RadioButton';
import dateUtil from '@/utils/dateUtil';

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
  iceServers: [{ url: 'stun:stun.services.mozilla.com' }, { url: 'stun:stun.l.google.com:19302' }],
};

class Conference extends React.Component {
  myStream;

  socket = createRef();

  myVideo = createRef();

  constructor(props) {
    super(props);
    this.state = {
      conference: null,
      users: [],
      code: null,
      align: {
        type: USER_ALIGNS.CONNECT,
        order: USER_ALIGNS_ORDER.ASC,
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

    if (code) {
      this.getConference(code);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { code } = this.state;

    if (code && code !== prevState.code) {
      this.getConference(code);
    }
  }

  setUsers = (users) => {
    this.setState({
      users,
    });
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
            this.setUp();
            this.getUsers(code);
          },
        );
      },
      () => {
        this.setState({
          conference: {},
          users: [],
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

        this.setUsers(participants);
      },
      null,
      t('미팅 참석자 정보를 가져오고 있습니다.'),
    );
  };

  setUp = () => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.myStream = stream;
          this.myVideo.current.srcObject = stream;
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      // TODO 지원 안함 처리
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

  setUpPeer = (userInfo, isSender) => {
    const { users } = this.state;
    if (!userInfo.id) return;
    const nextUsers = users.slice(0);

    userInfo.pc = new RTCPeerConnection(peerConnectionConfig);
    console.log('NEW');
    userInfo.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('send ICE');
        this.send('ICE', event.candidate);
      }
    };

    userInfo.pc.ontrack = (event) => {
      // document.getElementById(`video-${userInfo.id}`).src = window.URL.createObjectURL(event.stream);
      console.log('ontrack');
      // console.log(document.getElementById(`video-${userInfo.id}`));

      // console.log(event);
      const [first] = event.streams;
      document.getElementById(`video-${userInfo.id}`).srcObject = first;
    };

    userInfo.pc.oniceconnectionstatechange = (event) => {
      const state = userInfo.pc.iceConnectionState;
      console.log(`connection with peer ${userInfo.id} ${state}`);
      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        console.log('disconnected', event);
      }
    };

    userInfo.pc.addStream(this.myStream);

    if (isSender) {
      userInfo.pc.createOffer().then(
        (description) => {
          userInfo.pc.setLocalDescription(description).then(() => {
            // console.log(description);
            // console.log(userInfo.pc, userInfo.pc.localDescription);
            console.log('send offer', userInfo.pc.localDescription);
            this.send('SDP', userInfo.pc.localDescription);
          });
        },
        (e) => {
          console.log(e);
        },
      );

      if (!nextUsers.find((d) => Number(d.id) === Number(userInfo.id))) {
        nextUsers.push(userInfo);
        this.setUsers(nextUsers);
      }
    }
  };

  onMessage = (info) => {
    const {
      senderInfo,
      data: { type, data },
    } = info;

    const { user } = this.props;
    const { users } = this.state;

    // console.log(info);
    // console.log(type, data, senderInfo);

    const isMe = Number(senderInfo.id) === Number(user.id);

    switch (type) {
      case 'LEAVE': {
        const nextConference = this.getMergeUsersWithParticipants([data.participant]);
        this.setState({
          conference: nextConference,
        });
        break;
      }

      case 'JOIN': {
        const nextConference = this.getMergeUsersWithParticipants([data.participant]);
        this.setState({
          conference: nextConference,
        });
        if (!isMe) {
          setTimeout(() => {
            const targetUser = users.find((d) => Number(d.id) === Number(senderInfo.id));
            this.setUpPeer(targetUser, true);
          }, 3000);
        }

        break;
      }

      case 'ICE': {
        if (!isMe) {
          const targetUser = users.find((d) => Number(d.id) === Number(senderInfo.id));
          if (!targetUser.pc) {
            console.log('ICE INIT');
            this.setUpPeer(targetUser, false);
          }
          // console.log('RE ICE', data);
          targetUser.pc.addIceCandidate(new RTCIceCandidate(data)).catch((e) => {
            console.log(e);
          });
        }

        break;
      }
      case 'SDP': {
        if (!isMe) {
          const targetUser = users.find((d) => Number(d.id) === Number(senderInfo.id));
          console.log(users, targetUser.pc, senderInfo.id);
          if (!targetUser.pc) {
            console.log('INIT');
            this.setUpPeer(targetUser, false);
          }
          console.log('RE SDP', data.type);
          console.log(data);
          targetUser.pc.setRemoteDescription(new RTCSessionDescription(data)).then(() => {
            if (data.type === 'offer') {
              targetUser.pc
                .createAnswer()
                .then((description) => {
                  targetUser.pc.setLocalDescription(description).then(() => {
                    // console.log(description);
                    // console.log(targetUser.pc, targetUser.pc.localDescription);
                    console.log('send answer', targetUser.pc.localDescription);
                    this.send('SDP', targetUser.pc.localDescription);
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

  joinMeeting = () => {
    const { user } = this.props;

    if (user.id) {
      this.send('JOIN', user);
    }
  };

  render() {
    const { history, t, user } = this.props;
    const {
      conference,
      align: { type, order },
    } = this.state;

    const existConference = conference && conference.id;

    return (
      <Page className="conference-wrapper">
        {existConference && (
          <>
            <SocketClient
              topics={[`/sub/conferences/${conference.code}`]}
              onMessage={this.onMessage}
              onConnect={() => {
                this.joinMeeting();
              }}
              onDisconnect={() => {}}
              setRef={(client) => {
                this.socket = client;
              }}
            />
            <PageTitle>{conference?.name}</PageTitle>
            <div className="conference-content">
              <div className="streaming-content">
                <div>
                  <div className="video-content">
                    <div className="name">
                      <span>{user.alias}</span>
                    </div>
                    <video ref={this.myVideo} autoPlay muted />
                  </div>
                  {conference.users
                    .filter((userInfo) => Number(userInfo.userId) !== Number(user.id))
                    .filter((userInfo) => userInfo.participant?.connected)
                    .map((userInfo) => {
                      return (
                        <div key={userInfo.id} className="video-content">
                          <div className="name">
                            <span>{userInfo.alias}</span>
                          </div>
                          <video id={`video-${userInfo.userId}`} autoPlay muted />
                        </div>
                      );
                    })}
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
