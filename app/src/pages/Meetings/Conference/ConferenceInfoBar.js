import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';
import PropTypes from 'prop-types';
import { Button } from '@/components';
import request from '@/utils/request';
import { AnswerPropTypes, ConferencePropTypes, UserPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './ConferenceInfoBar.scss';

class ConferenceInfoBar extends React.Component {
  dailyScrumStart = () => {
    const { t } = this.props;
    const { conference } = this.props;

    request.put(`/api/meets/${conference.code}/scrum?operation=start`, null, null, null, t('데일리 스크럼 시작을 위한 정보를 생성합니다.'));
  };

  dailyScrumStop = () => {
    const { t } = this.props;
    const { conference } = this.props;

    request.put(`/api/meets/${conference.code}/scrum?operation=stop`, null, null, null, t('데일리 스크럼을 종료하고 있습니다.'));
  };

  getCurrentSpeaker = () => {
    const { conference, dailyScrumInfo } = this.props;
    return conference.users.find((d) => d.userId === dailyScrumInfo.currentSpeakerUserId);
  };

  getNextSpeaker = () => {
    const { conference, dailyScrumInfo } = this.props;

    const currentUserIndex = dailyScrumInfo.scrumUserOrders.findIndex((d) => d.userId === dailyScrumInfo.currentSpeakerUserId);
    for (let i = currentUserIndex; i < dailyScrumInfo.scrumUserOrders.length; i += 1) {
      if (
        !dailyScrumInfo.scrumUserOrders[i].isDailyScrumDone &&
        dailyScrumInfo.scrumUserOrders[currentUserIndex].order < dailyScrumInfo.scrumUserOrders[i].order
      ) {
        return conference.users.find((d) => d.userId === dailyScrumInfo.scrumUserOrders[i].userId);
      }
    }

    return null;
  };

  render() {
    const { t, user } = this.props;
    const { conference, controls, statistics, answers, dailyScrumInfo, setControls } = this.props;

    return (
      <div className="conference-info-bar-wrapper">
        <div className="time-info">
          <div>
            <div>
              <span>
                <i className="fas fa-clock" />
              </span>
              <span>
                {conference.startDate && <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getLocalDate(conference.startDate).valueOf()} />}{' '}
                {t('시작')}
              </span>
            </div>
            <div className="my-conference-info">
              <div>
                <span className="icon">
                  <i className="fas fa-compact-disc" />
                </span>
                <span className="count">
                  {statistics.count}
                  {t('회')}
                </span>
                <span className="times">/</span>
                <span className="duration">{dateUtil.getDurationMinutes(statistics.time)}</span>
              </div>
            </div>
          </div>
        </div>
        {conference?.scrumMeetingPlanId && dailyScrumInfo?.started && (
          <div className="scrum-info-status">
            {this.getNextSpeaker() ? (
              <div>
                <div className="tag">NEXT</div>
                <div>{this.getNextSpeaker()?.alias}</div>
              </div>
            ) : (
              <div>{t('NONE')}</div>
            )}
          </div>
        )}
        <div className="scrum-control-layout">
          {conference.scrumMeetingPlanId && (
            <>
              <div className="scrum-control">
                {dailyScrumInfo !== null && !dailyScrumInfo.started && (
                  <div>
                    <Button className="d-none d-sm-inline-block" size="md" color="white" onClick={this.dailyScrumStart}>
                      데일리 스크럼 시작
                    </Button>
                    <Button className="d-inline-block d-sm-none" size="md" color="white" onClick={this.dailyScrumStart}>
                      <i className="fas fa-play" />
                    </Button>
                  </div>
                )}
                {dailyScrumInfo !== null && dailyScrumInfo.started && (
                  <div>
                    <Button className="d-none d-sm-inline-block" size="md" color="white" onClick={this.dailyScrumStop}>
                      데일리 스크럼 종료
                    </Button>
                    <Button className="d-inline-block d-sm-none" size="md" color="white" onClick={this.dailyScrumStart}>
                      <i className="fas fa-stop" />
                    </Button>
                  </div>
                )}
                <div>
                  <Button
                    className="my-daily-button d-none d-sm-inline-block"
                    size="md"
                    color="white"
                    onClick={() => {
                      setControls('scrumInfo', !controls.scrumInfo);
                    }}
                  >
                    MY DAILY
                    {answers.filter((answer) => answer.user.id === user.id).length < 1 && <div className="no-register">{t('미등록')}</div>}
                  </Button>
                  <Button
                    className="my-daily-button d-inline-block d-sm-none"
                    size="md"
                    color="white"
                    onClick={() => {
                      setControls('scrumInfo', !controls.scrumInfo);
                    }}
                  >
                    <i className="fas fa-envelope-open-text" />
                    {answers.filter((answer) => answer.user.id === user.id).length < 1 && <div className="no-register">{t('미등록')}</div>}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(ConferenceInfoBar)));

ConferenceInfoBar.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      code: PropTypes.string,
    }),
  }),
  conference: ConferencePropTypes,
  controls: PropTypes.shape({
    audio: PropTypes.bool,
    video: PropTypes.bool,
    participants: PropTypes.bool,
    sharing: PropTypes.bool,
    chatting: PropTypes.bool,
    scrumInfo: PropTypes.bool,
  }),
  statistics: PropTypes.shape({
    count: PropTypes.number,
    time: PropTypes.number,
  }),
  answers: PropTypes.arrayOf(AnswerPropTypes),
  dailyScrumInfo: PropTypes.shape({
    started: PropTypes.bool,
    scrumUserOrders: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.number,
        order: PropTypes.number,
        isCurrentSpeaker: PropTypes.bool,
        isDailyScrumDone: PropTypes.bool,
      }),
    ),
    currentSpeakerUserId: PropTypes.number,
    currentFocusId: PropTypes.number,
  }),
  setControls: PropTypes.func,
};
