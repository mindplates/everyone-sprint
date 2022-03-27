import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BlockTitle, BottomButtons, Page, PageContent, SprintTimeLine, Tabs, UserList, withLogin } from '@/components';
import { ACTIVATES, ALLOW_SEARCHES, JOIN_POLICIES } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes } from '@/proptypes';
import './Space.scss';

const Space = ({
  t,
  history,
  match: {
    params: { id },
  },
}) => {
  const tabs = [
    {
      key: 'space',
      value: t('프로젝트'),
    },
    {
      key: 'timeline',
      value: t('스프린트 타임라인'),
    },
  ];

  const [space, setSpace] = useState(null);
  const [tab, setTab] = useState('space');

  useEffect(() => {
    request.get(`/api/spaces/${id}`, null, setSpace, null, t('프로젝트 정보를 가져오고 있습니다.'));
  }, [id]);

  const allowSearch = ALLOW_SEARCHES.find((d) => d.key === space?.allowSearch) || {};
  const allowAutoJoin = JOIN_POLICIES.find((d) => d.key === space?.allowAutoJoin) || {};
  const activated = ACTIVATES.find((d) => d.key === space?.activated) || {};

  return (
    <Page
      className="space-wrapper"
      title={false}
      breadcrumbs={[
        {
          link: '/',
          name: t('TOP'),
        },
        {
          link: '/spaces',
          name: t('프로젝트 목록'),
        },
        {
          link: `/spaces/${space?.id}`,
          name: space?.name,
          current: true,
        },
      ]}
    >
      {space && (
        <PageContent className={`space-content ${tab}`} padding="0">
          <Tabs className="tabs" tab={tab} tabs={tabs} onChange={setTab} border={false} cornered size="sm" />
          <div className="space-info">
            <div className="general-info">
              <BlockTitle className="content-title mb-3">{t('프로젝트')}</BlockTitle>
              <div className="space-card">
                <div className={`${space.activated ? '' : 'deactivate'} space-name`}>{space.name}</div>
                <div className="space-info-tag">
                  <span className={allowSearch.key ? 'allowed' : ''}>{allowSearch.value}</span>
                  <span className={allowAutoJoin.key ? 'allowed' : ''}>{allowAutoJoin.value}</span>
                  {!space.activated && <span className={activated.key ? '' : 'deactivated'}>{activated.value}</span>}
                </div>
              </div>
              <BlockTitle className="mb-3">
                {t('프로젝트 멤버')} ({space.users.length}
                {t('명')})
              </BlockTitle>
              <div className="space-user-list">
                <div className="g-scroller">
                  <UserList
                    icon={false}
                    type="list"
                    users={space.users}
                    editable={{
                      role: false,
                      member: false,
                    }}
                    showAdmin
                  />
                </div>
              </div>
            </div>
            <div className="sprint-timeline">
              <BlockTitle className="content-title mb-3">{t('스프린트 타임라인')}</BlockTitle>
              <div className="sprint-timeline-content">
                <SprintTimeLine space={space} />
              </div>
            </div>
          </div>
          <BottomButtons
            onList={() => {
              history.push('/spaces');
            }}
            onEdit={
              space?.isAdmin
                ? () => {
                    history.push(`/spaces/${id}/edit`);
                  }
                : null
            }
            onEditText="변경"
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

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(withLogin(Space))));

Space.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
