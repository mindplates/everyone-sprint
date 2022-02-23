import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, DateRangeText, Label, Table, Text, UserImage } from '@/components';
import { SprintPropTypes, SprintSummaryPropTypes, UserPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import '../SprintCommon.scss';
import './SprintBoardSummary.scss';

const labelMinWidth = '140px';

const SprintBoardSummary = ({ t, user, sprint, sprintSummary }) => {
  const now = new Date();

  const sprintSpan = dateUtil.getSpan(now.getTime(), sprint?.endDate);

  const meetingSpan = sprintSummary?.meetings?.reduce((prev, current, currentIndex) => {
    let planSum = 0;
    let realSum = 0;
    let realCount = 0;
    if (currentIndex <= 1) {
      planSum += prev.endDate ? dateUtil.getTime(prev.endDate) - dateUtil.getTime(prev.startDate) : 0;
      realSum += prev.realEndDate ? dateUtil.getTime(prev.realEndDate) - dateUtil.getTime(prev.realStartDate) : 0;
      realCount += prev.durationSeconds ? 1 : 0;
    } else {
      const [plan, real, count] = prev;
      planSum = plan;
      realSum = real;
      realCount = count;
    }

    planSum += current.endDate ? dateUtil.getTime(current.endDate) - dateUtil.getTime(current.startDate) : 0;
    realSum += current.realEndDate ? dateUtil.getTime(current.realEndDate) - dateUtil.getTime(current.realEndDate) : 0;
    realCount += current.durationSeconds ? 1 : 0;

    return [planSum, realSum, realCount];
  }) || [0, 0, 0];

  return (
    <div className="sprint-board-summary-wrapper">
      <Block className="">
        <BlockRow>
          <Label minWidth={labelMinWidth}>{t('남은 기간')}</Label>
          <Text>
            <span className="sprint-span ml-0">
              <span>{`${sprintSpan.days}${t('일')}`}</span>
              <span className="ml-2">{`${sprintSpan.hours}${t('시간')}`}</span>
              <span className="ml-2">{t('후 종료')}</span>
            </span>
          </Text>
          <DateRangeText className="ml-2" country={user.country} startDate={sprint.startDate} endDate={sprint.endDate} />
        </BlockRow>
        <BlockRow>
          <Label minWidth={labelMinWidth} verticalAlign="baseline">
            {t('미팅')}
          </Label>
          <Text verticalAlign="baseline">
            <div className="meeting-summary">
              <span>계획</span>
              <span>
                {sprintSummary?.meetings?.length}
                {t('회')}
              </span>
              <span>
                {meetingSpan[0] ? meetingSpan[0] / (1000 * 60) : 0}
                {t('분')}
              </span>
            </div>
            <div className="meeting-summary">
              <span>실제</span>
              <span>
                {meetingSpan[2]}
                {t('회')}
              </span>
              <span>
                {meetingSpan[1]}
                {t('분')}
              </span>
            </div>
          </Text>
        </BlockRow>
      </Block>
      <Block>
        <BlockTitle>{t('사용자별 요약 정보')}</BlockTitle>
        <BlockRow>
          <div className="user-list">
            <Table className="user-table" responsive bordered>
              <thead>
                <tr>
                  <th>사용자</th>
                  <th className="number">참여</th>
                  <th className="number">참여 시간</th>
                  <th className="number">말한 시간</th>
                  <th className="number">지각 횟수</th>
                  <th className="number">스크럼 정보 작성</th>
                </tr>
              </thead>
              <tbody>
                {sprint.users.map((u) => {
                  return (
                    <tr key={u.id}>
                      <td className="user-info">
                        <UserImage
                          border={false}
                          rounded
                          size="30px"
                          iconFontSize="15px"
                          imageType={u.imageType}
                          imageData={u.imageData}
                          className="user-image"
                        />
                        <span>{u.alias}</span>
                      </td>
                      <td className="number">
                        <span className="up">0</span>
                        {t('회')}
                      </td>
                      <td className="number">
                        <span className="down">0</span>
                        {t('분')}
                      </td>
                      <td className="number">
                        <span className="up">0</span>
                        {t('분')}
                      </td>
                      <td className="number">
                        <span className="up">0</span>
                        {t('회')}
                      </td>
                      <td className="number">
                        <span className="up">0</span>
                        {t('회')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </BlockRow>
      </Block>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(SprintBoardSummary)));

SprintBoardSummary.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      tab: PropTypes.string,
      id: PropTypes.string,
      date: PropTypes.string,
    }),
  }),
  sprint: SprintPropTypes,
  sprintSummary: SprintSummaryPropTypes,
};
