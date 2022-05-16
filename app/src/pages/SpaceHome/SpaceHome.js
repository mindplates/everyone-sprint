import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Page, PageContent, SpaceCard, withLogin, withSpace } from '@/components';
import { HistoryPropTypes, SpacePropTypes } from '@/proptypes';
import request from '@/utils/request';
import './SpaceHome.scss';
import commonUtil from '@/utils/commonUtil';

const SpaceHome = ({
  t,
  space,
  match: {
    params: { spaceCode },
  },
  history,
}) => {
  const [stats, setStats] = useState({
    projectCount: 0,
    sprintCount: 0,
    meetingCount: 0,
    userCount: 0,
  });

  const getStats = () => {
    if (space.code) {
      request.get(
        `/api/spaces/${space.code}/stats`,
        null,
        (data) => {
          setStats(data);
        },
        null,
        t('시스템의 요약 정보를 합치는 중입니다.'),
      );
    }
  };

  useEffect(() => {
    getStats();
  }, [space, spaceCode]);

  return (
    <Page className="space-home-wrapper">
      <PageContent className="page-content" border={false}>
        <div className="summary-content">
          {space?.id && (
            <div className="current-space-info">
              <div>
                <div className="space-info">
                  <SpaceCard
                    space={space}
                    onCardClick={() => {
                      history.push(`/spaces/${space.code}`);
                    }}
                    onConfigClick={() => {
                      commonUtil.move(`/spaces/${space.code}/edit`, false);
                    }}
                  />
                  <div className="message">{t(`현재 ${space.name} 스페이스에 있습니다.`)}</div>
                </div>
                <div className="stats">
                  <div>
                    <div className="icon">
                      <i className="fas fa-archive" />
                    </div>
                    <div className="count link">
                      <Link to={`/${space.code}/projects/my`}>{stats.projectCount}</Link>
                    </div>
                    <div className="label">{t('프로젝트')}</div>
                    <div className="icon">
                      <Button
                        size="md"
                        color="point"
                        outline
                        rounded
                        onClick={() => {
                          commonUtil.move('/projects/new');
                        }}
                      >
                        <i className="fas fa-plus" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="icon plane">
                      <span className="horizontal">
                        <span className="vertical">
                          <span className="plane">
                            <i className="fas fa-plane" />
                          </span>
                        </span>
                      </span>
                    </div>
                    <div className="count link">
                      <Link to={`/${space.code}/sprints`}>{stats.sprintCount}</Link>
                    </div>
                    <div className="label">{t('스프린트')}</div>
                    <div className="icon">
                      <Button
                        size="md"
                        color="point"
                        outline
                        rounded
                        onClick={() => {
                          commonUtil.move('/sprints/new');
                        }}
                      >
                        <i className="fas fa-plus" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="icon">
                      <i className="fas fa-comment-dots" />
                    </div>
                    <div className="count link">
                      <Link to={`/${space.code}/meetings`}>{stats.meetingCount}</Link>
                    </div>
                    <div className="label">{t('미팅')}</div>
                    <div className="icon">
                      <Button
                        size="md"
                        color="point"
                        outline
                        rounded
                        onClick={() => {
                          commonUtil.move('/meetings/new');
                        }}
                      >
                        <i className="fas fa-plus" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="icon">
                      <i className="fas fa-child" />
                    </div>
                    <div className="count link">
                      <Link to={`/spaces/${space.code}`}>{stats.userCount}</Link>
                    </div>
                    <div className="label">{t('사용자')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    space: state.space,
  };
};

export default compose(withLogin, withSpace, withRouter, withTranslation())(connect(mapStateToProps, undefined)(SpaceHome));

SpaceHome.propTypes = {
  t: PropTypes.func,
  space: SpacePropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      spaceCode: PropTypes.string,
    }),
  }),
  history: HistoryPropTypes,
};
