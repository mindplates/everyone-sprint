import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Alert } from 'reactstrap';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  DailyScrumMeeting,
  DailySmallTalkMeeting,
  DateRangeText,
  Label,
  Page,
  PageContent,
  PageTitle,
  Text,
  UserList,
  withLogin,
} from '@/components';
import dialog from '@/utils/dialog';
import { JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { UserPropTypes } from '@/proptypes';
import sprintUtil from './sprintUtil';
import dateUtil from '@/utils/dateUtil';
import commonUtil from '@/utils/commonUtil';

const labelMinWidth = '140px';

const Sprint = ({
  t,
  user,
  match: {
    params: { id },
  },
}) => {
  const [sprint, setSprint] = useState(null);

  useEffect(() => {
    request.get(
      `/api/{spaceCode}/sprints/${id}`,
      null,
      (data) => {
        setSprint(sprintUtil.getSprint(data));
      },
      null,
      t('스프린트 정보를 가져오고 있습니다.'),
    );
  }, [id]);

  const onOpen = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('스프린트 다시 열기'), t('스프린트를 오픈하시겠습니까?'), () => {
      request.put(
        `/api/{spaceCode}/sprints/${id}/open`,
        null,
        () => {
          commonUtil.move('/sprints');
        },
        null,
        t('스프린트를 다시 활성화하고 있습니다.'),
      );
    });
  };

  const onClose = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('스프린트 종료'), t('스프린트를 종료하시겠습니까?'), () => {
      request.put(
        `/api/{spaceCode}/sprints/${id}/close`,
        null,
        () => {
          commonUtil.move('/sprints');
        },
        null,
        t('스프린트를 종료하고 있습니다.'),
      );
    });
  };

  const getOpenCloseHandler = () => {
    if (sprint?.isAdmin) {
      return sprint.closed ? onOpen : onClose;
    }

    return null;
  };

  const sprintSpan = dateUtil.getSpan(sprint?.startDate, sprint?.endDate);

  return (
    <Page className="sprint-common">
      <PageTitle
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/sprints'),
            name: t('스프린트 목록'),
          },
          {
            link: commonUtil.getSpaceUrl(`/sprints/${sprint?.id}`),
            name: sprint?.name,
            current: true,
          },
        ]}
      >
        {t('스프린트 정보')}
      </PageTitle>
      {sprint && (
        <PageContent info>
          {sprint.closed && (
            <Block>
              <Alert color="warning mb-0">
                <div className="message">{t('종료된 스프린트입니다. 종료된 스프린트 및 관련 데이터는 검색되지 않습니다.')}</div>
              </Alert>
            </Block>
          )}
          <Block className="pt-0">
            <BlockTitle>{t('스프린트 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('프로젝트')}</Label>
              <Text>{sprint.projectName}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('이름')}</Label>
              <Text>{sprint.name}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('기간')}</Label>
              <DateRangeText country={user.country} startDate={sprint.startDate} endDate={sprint.endDate} />
              <span className="align-self-center">
                <span>{`${sprintSpan.days}${t('일')}`}</span>
                <span className="ml-2">{`${sprintSpan.hours}${t('시간')}`}</span>
              </span>
            </BlockRow>
          </Block>
          <Block className="pb-0">
            <BlockTitle>{t('데일리 스크럼 미팅')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('데일리 스크럼 미팅')}</Label>
              <Text>{sprint.doDailyScrumMeeting ? 'Y' : 'N'}</Text>
            </BlockRow>
          </Block>
          {sprint.doDailyScrumMeeting && (
            <Block className="sprint-daily-meetings">
              {sprint.scrumMeetingPlans.map((scrumMeetingPlan, inx) => {
                return <DailyScrumMeeting key={inx} no={inx + 1} scrumMeetingPlan={scrumMeetingPlan} user={user} />;
              })}
            </Block>
          )}
          <Block className="pb-0">
            <BlockTitle>{t('데일리 스몰톡 미팅')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('데일리 스몰톡 미팅')}</Label>
              <Text>{sprint.doDailySmallTalkMeeting ? 'Y' : 'N'}</Text>
            </BlockRow>
          </Block>
          {sprint.doDailySmallTalkMeeting && (
            <Block className="sprint-daily-meetings">
              {sprint.smallTalkMeetingPlans.map((smallTalkMeetingPlan, inx) => {
                return <DailySmallTalkMeeting key={inx} no={inx + 1} smallTalkMeetingPlan={smallTalkMeetingPlan} user={user} />;
              })}
            </Block>
          )}
          <Block>
            <BlockTitle>{t('지라 연동')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('지라 연동')}</Label>
              <Text>{sprint.isJiraSprint ? 'Y' : 'N'}</Text>
            </BlockRow>
            {sprint.isJiraSprint && (
              <>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('지라 스트린트 URL')}</Label>
                  <Text>{sprint.jiraSprintUrl}</Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('지라 인증 키')}</Label>
                  <Text>{sprint.jiraAuthKey}</Text>
                </BlockRow>
              </>
            )}
          </Block>
          <Block>
            <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
              <Text>{(JOIN_POLICIES.find((d) => d.key === sprint.allowAutoJoin) || {}).value}</Text>
            </BlockRow>
          </Block>
          <Block className="g-last-block">
            <BlockTitle>{t('멤버')}</BlockTitle>
            <UserList
              showAdmin
              users={sprint.users}
              editable={{
                role: false,
                member: false,
                add: false,
              }}
            />
          </Block>
          <BottomButtons
            onList={() => {
              commonUtil.move('/sprints');
            }}
            onEdit={
              sprint?.isAdmin
                ? () => {
                    commonUtil.move(`/sprints/${id}/edit`);
                  }
                : null
            }
            onEditText="변경"
            onInfo={() => {
              commonUtil.move(`/sprints/${sprint.id}/summary`);
            }}
            onInfoText="통계"
            onClose={getOpenCloseHandler()}
            onCloseText={sprint.closed ? '스프린트 열기' : '스프린트 닫기'}
          />
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

export default compose(withLogin, connect(mapStateToProps, undefined), withRouter, withTranslation())(Sprint);

Sprint.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
