import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, Liner, PageTitle } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';
import dateUtil from '@/utils/dateUtil';
import './Sprints.scss';

const Sprints = ({ t, history }) => {
  const [sprints, setSprints] = useState([]);

  const getSprints = () => {
    request.get('/api/sprints', null, (list) => {
      console.log(list);
      setSprints(list);
    });
  };

  useEffect(() => {
    getSprints();
  }, []);

  return (
    <div className="sprints-wrapper g-content">
      <PageTitle
        control={
          <>
            <Button
              size="xs"
              color="white"
              outline
              onClick={() => {
                history.push('/sprints/new');
              }}
            >
              <i className="fas fa-plus" /> 새 스프린트
            </Button>
          </>
        }
      >
        스프린트
      </PageTitle>
      <div className={`${sprints && sprints.length > 0 ? 'g-list-content' : 'g-page-content'}`}>
        {!(sprints && sprints.length > 0) && (
          <div className="empty-sprint">
            <div>{t('스프린트가 없습니다.')}</div>
          </div>
        )}
        {sprints && sprints.length > 0 && (
          <ul className="sprint-list">
            {sprints.map((sprint) => {
              return (
                <li
                  key={sprint.id}
                  onClick={() => {
                    history.push(`/sprints/${sprint.id}`);
                  }}
                >
                  <div>
                    <div className="name-and-date">
                      <div className="name">{sprint.name}</div>
                      <div className="sprint-date">
                        <div>
                          <div className="start-date">
                            <span className="date-label">FROM</span>
                            {dateUtil.getDate(sprint.startDate)}
                          </div>
                          <Liner
                            className="date-liner"
                            width="10px"
                            height="1px"
                            display="inline-block"
                            color="black"
                            margin="0 0.5rem"
                          />
                          <div className="end-date">
                            <span className="date-label">TO</span>
                            {dateUtil.getDate(sprint.endDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="liner">
                      <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 0.5rem" />
                    </div>
                    <div className="others">
                      <div className="user-count">
                        <div className="label">
                          <span>USERS</span>
                        </div>
                        <div className="value">{sprint.userCount}</div>
                      </div>
                      <div className="is-jira-sprint">
                        <div className="label">
                          <span>JIRA</span>
                        </div>
                        <div className="value">{sprint.isJiraSprint ? 'Y' : 'N'}</div>
                      </div>
                      <div className="allow-auto-join">
                        <div className="label">
                          <span>자동 승인</span>
                        </div>
                        <div className="value">{sprint.allowAutoJoin ? 'Y' : 'N'}</div>
                      </div>
                      <div className="allow-search">
                        <div className="label">
                          <span>검색 허용</span>
                        </div>
                        <div className="value">{sprint.allowSearch ? 'Y' : 'N'}</div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(Sprints)));

Sprints.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
};
