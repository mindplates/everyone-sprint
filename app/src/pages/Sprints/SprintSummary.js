import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Table } from 'reactstrap';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, DateRangeText, Label, Page, PageContent, PageTitle, Text, UserImage, withLogin } from '@/components';
import request from '@/utils/request';
import { UserPropTypes } from '@/proptypes';
import sprintUtil from '@/pages/Sprints/sprintUtil';
import dateUtil from '@/utils/dateUtil';

import './SprintCommon.scss';
import './SprintSummary.scss';

const labelMinWidth = '140px';

const SprintSummary = ({
  t,
  user,
  match: {
    params: { id: idString },
  },
}) => {
  const id = Number(idString);

  const [sprint, setSprint] = useState(null);
  const [sprintSummary, setSprintSummary] = useState(null);

  const getSprint = (sprintId) => {
    request.get(
      `/api/sprints/${sprintId}`,
      null,
      (data) => {
        setSprint(sprintUtil.getSprint(data));
      },
      null,
      t('스프린트 정보를 가져오고 있습니다.'),
    );
  };

  const getSprintSummary = () => {
    request.get(
      `/api/sprints/${id}/summary`,
      null,
      (data) => {
        setSprintSummary(data);
      },
      null,
      t('스프린트에 관련된 모든 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getSprint(id);
  }, [id]);

  useEffect(() => {
    getSprintSummary();
  }, [id]);

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
    <Page className="sprint-summary-wrapper sprint-common">
      <PageTitle
        breadcrumbs={[
          {
            link: '/',
            name: t('TOP'),
          },
          {
            link: '/sprints',
            name: t('스프린트 목록'),
          },
          {
            link: `/sprints/${sprint?.id}`,
            name: sprint?.name,
          },
          {
            link: `/sprints/${sprint?.id}/summary`,
            name: t('요약'),
            current: true,
          },
        ]}
      >
        <div className="title">
          <span>{sprint?.name}</span>
          <span className="spring-title-tag">SUMMARY</span>
        </div>
      </PageTitle>
      {sprint && (
        <PageContent className="page-content" info>
          <div className="board-content">
            <div>
              <Block className="pt-0 pb-0">
                <BlockTitle>{t('미팅 요약 정보')}</BlockTitle>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('기간')}</Label>
                  <DateRangeText country={user.country} startDate={sprint.startDate} endDate={sprint.endDate} />
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('남은 기간')}</Label>
                  <Text>
                    <span className="ml-0">
                      <span>{`${sprintSpan.days}${t('일')}`}</span>
                      <span className="ml-2">{`${sprintSpan.hours}${t('시간')}`}</span>
                      <span className="ml-2">{t('후 종료')}</span>
                    </span>
                  </Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('미팅')}</Label>
                  <Text>
                    <div className="meeting-summary">
                      <span className="tag">
                        <span>{t('계획')}</span>
                      </span>
                      <span>
                        {sprintSummary?.meetings?.length}
                        {t('회')}
                      </span>
                      <span className="slash">/</span>
                      <span>
                        {meetingSpan[0] ? meetingSpan[0] / (1000 * 60) : 0}
                        {t('분')}
                      </span>
                    </div>
                    <div className="meeting-summary">
                      <span className="tag">
                        <span>{t('실제')}</span>
                      </span>
                      <span>
                        {meetingSpan[2]}
                        {t('회')}
                      </span>
                      <span className="slash">/</span>
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
                    <Table className="user-table g-scrollbar" responsive bordered>
                      <thead>
                        <tr>
                          <th rowSpan={2}>{t('사용자')}</th>
                          <th colSpan={5} className="text-center">
                            {t('스크럼 미팅')}
                          </th>
                          <th colSpan={3} className="text-center">
                            {t('스몰톡 미팅')}
                          </th>
                        </tr>
                        <tr>
                          <th className="text-center">{t('참여 횟수')}</th>
                          <th className="text-center">{t('참여 시간')}</th>
                          <th className="text-center">{t('말한 시간')}</th>
                          <th className="text-center">{t('지각 횟수')}</th>
                          <th className="text-center">{t('스크럼 작성')}</th>
                          <th className="text-center">{t('참여 횟수')}</th>
                          <th className="text-center">{t('참여 시간')}</th>
                          <th className="text-center">{t('말한 시간')}</th>
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
                              <td className="number">
                                <span className="up">0</span>
                                {t('회')}
                              </td>
                              <td className="number">
                                <span className="up">0</span>
                                {t('분')}
                              </td>
                              <td className="number">
                                <span className="up">0</span>
                                {t('분')}
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
          </div>
        </PageContent>
      )}
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withLogin, connect(mapStateToProps, undefined), withRouter, withTranslation())(SprintSummary);

SprintSummary.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      tab: PropTypes.string,
      id: PropTypes.string,
      date: PropTypes.string,
    }),
  }),
};
