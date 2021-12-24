import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import ReactTimeAgo from 'react-time-ago';
import dateUtil from '@/utils/dateUtil';
import { Block, BlockTitle, UserImage } from '@/components';
import RadioButton from '@/components/RadioButton/RadioButton';
import { UserPropTypes } from '@/proptypes';
import './ParticipantsList.scss';

const USER_ALIGNS = {
  CONNECT: 'CONNECT',
  NAME: 'NAME',
};

const USER_ALIGNS_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
};

class ParticipantsList extends React.PureComponent {
  render() {
    const {
      className,
      conference,
      t,
      align: { type, order },
      setAlign,
      user,
      sharingUserId,
    } = this.props;

    return (
      <div className={`participants-list-wrapper ${className}`}>
        <Block className="p-3 user-list-content">
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
                      setAlign({
                        type: val,
                        order: order === USER_ALIGNS_ORDER.ASC ? USER_ALIGNS_ORDER.DESC : USER_ALIGNS_ORDER.ASC,
                      });
                    } else {
                      setAlign({
                        type: val,
                        order,
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
                              <div className="flex-grow-1">
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
                                    <span className="attendance-status">{t('나감')}</span>
                                  </span>
                                )}
                              </div>
                            )}
                            {d.participant && (
                              <div>
                                {sharingUserId === d.userId && (
                                  <span className="screen-sharing">
                                    <i className="fas fa-desktop" />
                                  </span>
                                )}
                                <span className="audio-status">
                                  {d.participant.audio && <i className="fas fa-microphone" />}
                                  {!d.participant.audio && <i className="fas fa-microphone-slash" />}
                                </span>
                                <span className="video-status">
                                  {d.participant.video && <i className="fas fa-video" />}
                                  {!d.participant.video && <i className="fas fa-video-slash" />}
                                </span>
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
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(ParticipantsList));

ParticipantsList.defaultProps = {
  className: '',
};

ParticipantsList.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  conference: PropTypes.objectOf(PropTypes.any),
  align: PropTypes.shape({
    type: PropTypes.string,
    order: PropTypes.string,
  }),
  setAlign: PropTypes.func,
  user: UserPropTypes,
  sharingUserId: PropTypes.number,
};
