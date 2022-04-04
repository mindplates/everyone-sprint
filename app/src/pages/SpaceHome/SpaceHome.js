import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Page, PageContent, ProductLogo, SpaceCard, withLogin } from '@/components';
import { HistoryPropTypes, SpacePropTypes, UserPropTypes } from '@/proptypes';
import request from '@/utils/request';
import './SpaceHome.scss';

const SpaceHome = ({
  t,
  history,
  space,
  user,
  match: {
    params: { spaceCode },
  },
}) => {
  const [stats, setStats] = useState({
    projectCount: 0,
    sprintCount: 0,
    meetingCount: 0,
    userCount: 0,
  });

  const [info, setInfo] = useState(null);

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
    if (!space?.id && spaceCode) {
      request.get(
        `/api/spaces/codes/${spaceCode}`,
        null,
        (data) => {
          setInfo(data);
          console.log(data);
        },
        (error, response) => {
          if (response && response.status === 404) {
            setInfo(null);
            return true;
          }

          return false;
        },
        t('스페이스 정보를 가져오고 있습니다.'),
      );
      console.log(spaceCode);
    }
  }, [space, spaceCode]);

  console.log(history);

  console.log(user);

  return (
    <Page className="space-home-wrapper">
      <PageContent className="page-content" border={false}>
        <div className="summary-content">
          {!space?.id && info === null && (
            <div className="no-space-message">
              <div>
                <div className="logo">
                  <ProductLogo className="bg-transparent d-inline-block" name={false} width="auto" />
                </div>
                {t('접근할 수 없거나, 존재하지 않는 스페이스입니다.')}
              </div>
            </div>
          )}
          {!space?.id && info && info.allowSearch && (
            <div className="request-available-message">
              <div>
                <div className="logo">
                  <ProductLogo className="bg-transparent d-inline-block" name={false} width="auto" />
                </div>
                <div className="space-card">
                  <SpaceCard space={info} />
                </div>
                <div className="mb-3">
                  {t('접근하신 스페이스에 참여하고 있지 않아 접근이 불가능합니다. 아래 버튼을 클릭하여, 참여 페이지로 이동할 수 있습니다.')}
                </div>
                <div>
                  <Button
                    size="sm"
                    color="white"
                    outline
                    onClick={() => {
                      history.push(`/spaces/${info.id}`);
                    }}
                  >
                    스페이스 참여 페이지로 이동
                  </Button>
                </div>
              </div>
            </div>
          )}
          {!space?.id && user.spaces?.length > 0 && (
            <div className="user-space-content">
              <div className="user-space-list-content">
                <div className="sub-title">
                  <span>{t('사용자의 스페이스를 선택하여 이동할 수 있습니다.')}</span>
                </div>
                <div className="user-space-list">
                  {user.spaces.map((d) => {
                    return (
                      <div>
                        <SpaceCard space={d} description={false} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {space?.id && (
            <div className="current-space-info">
              <div>
                <div className="space-info">
                  <SpaceCard space={space} />
                  <div className="message">{t(`현재 ${space.name} 스페이스에 있습니다.`)}</div>
                </div>
                <div className="stats">
                  <div>
                    <div className="icon">
                      <i className="fas fa-archive" />
                    </div>
                    <div className="count">{stats.projectCount}</div>
                    <div className="label">{t('프로젝트')}</div>
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
                    <div className="count">{stats.sprintCount}</div>
                    <div className="label">{t('스프린트')}</div>
                  </div>
                  <div>
                    <div className="icon">
                      <i className="fas fa-comment-dots" />
                    </div>
                    <div className="count">{stats.meetingCount}</div>
                    <div className="label">{t('미팅')}</div>
                  </div>
                  <div>
                    <div className="icon">
                      <i className="fas fa-child" />
                    </div>
                    <div className="count">{stats.userCount}</div>
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
    user: state.user,
  };
};

export default compose(withLogin, withRouter, withTranslation())(connect(mapStateToProps, undefined)(SpaceHome));

SpaceHome.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
  space: SpacePropTypes,
  user: UserPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      spaceCode: PropTypes.string,
    }),
  }),
};
