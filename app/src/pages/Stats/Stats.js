import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, Page, PageContent, ProductLogo } from '@/components';
import request from '@/utils/request';
import './Stats.scss';

const Stats = ({ t }) => {
  const [stats, setStats] = useState({
    projectCount: 0,
    sprintCount: 0,
    meetingCount: 0,
    userCount: 0,
  });

  const getStats = () => {
    request.get(
      '/api/common/stats',
      null,
      (info) => {
        setStats(info);
      },
      null,
      t('시스템의 요약 정보를 합치는 중입니다.'),
    );
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <Page className="stats-wrapper">
      <PageContent className="page-content" border={false}>
        <div className="summary-content">
          <div className="logo">
            <ProductLogo className="bg-transparent d-inline-block" name={false} width="auto" />
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
        <div className="relation-sites">
          <div>
            <div>
              <span className="msg">{t('참여해보세요.')}</span>
            </div>
          </div>
          <div>
            <Button
              size="lg"
              color="white"
              outline
              data-tip={t('GITHUB')}
              rounded
              onClick={() => {
                window.open('https://github.com/mindplates/everyone-sprint');
              }}
            >
              <i className="fab fa-github" />
            </Button>
          </div>
          <div>
            <Button
              size="lg"
              color="white"
              data-tip={t('SLACK')}
              outline
              rounded
              onClick={() => {
                window.open('https://app.slack.com/client/T033JSUBQ7K/C0333BNJZ9T');
              }}
            >
              <i className="fab fa-slack" />
            </Button>
          </div>
        </div>
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default compose(connect(mapStateToProps, undefined), withRouter, withTranslation())(Stats);

Stats.propTypes = {
  t: PropTypes.func,
};
