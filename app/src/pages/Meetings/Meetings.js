import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { HistoryPropTypes } from '@/proptypes';
import { Button, EmptyContent, Liner, MeetingList, PageTitle, Selector } from '@/components';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import './Meetings.scss';

const tabs = [
  {
    key: 'list',
    value: '리스트',
  },
  {
    key: 'calendar',
    value: '캘린더',
  },
];

const Meetings = ({ t, history }) => {
  const [tab, setTab] = useState(tabs[0].key);
  const [currentSprintId, setCurrentSprintId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [meetings, setMeetings] = useState(null);

  const getSprints = () => {
    request.get(
      '/api/sprints',
      null,
      (list) => {
        setSprints(list);
      },
      null,
      t('사용자의 스프린트 목록을 모으고 있습니다.'),
    );
  };

  const getMeetings = () => {
    request.get(
      '/api/meetings',
      null,
      (list) => {
        console.log(list);
        setMeetings(list);
      },
      null,
      t('사용자의 스프린트 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getSprints();
    getMeetings();
  }, []);

  return (
    <div className="meetings-wrapper g-content">
      <PageTitle
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 미팅'),
            handler: () => {
              history.push('/meetings/new');
            },
          },
        ]}
      >
        {t('미팅')}
      </PageTitle>
      <div className="search d-none">
        <div>
          <div className="label">스프린트</div>
          <div>
            <Selector
              outline
              size="xs"
              items={[{ key: null, value: '모두' }].concat(
                sprints.map((sprint) => {
                  return {
                    key: sprint.id,
                    value: sprint.name,
                  };
                }),
              )}
              value={currentSprintId}
              onChange={(val) => setCurrentSprintId(val)}
              minWidth="65px"
            />
          </div>
          <div>
            <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
          </div>
          <div className="label">보기</div>
          <div>
            <RadioButton
              size="xs"
              items={tabs}
              value={tab}
              onClick={(val) => {
                setTab(val);
              }}
            />
          </div>
        </div>
      </div>
      {tab === 'list' && meetings != null && (
        <div className={`${meetings && meetings.length > 0 ? 'g-page-content' : 'g-page-content'}`}>
          <div className="search">
            <div>
              <div className="label">스프린트</div>
              <div>
                <Selector
                  outline
                  size="xs"
                  items={[{ key: null, value: '모두' }].concat(
                    sprints.map((sprint) => {
                      return {
                        key: sprint.id,
                        value: sprint.name,
                      };
                    }),
                  )}
                  value={currentSprintId}
                  onChange={(val) => setCurrentSprintId(val)}
                  minWidth="65px"
                />
              </div>
              <div>
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
              </div>
              <div className="label">보기</div>
              <div>
                <RadioButton
                  size="xs"
                  items={tabs}
                  value={tab}
                  onClick={(val) => {
                    setTab(val);
                  }}
                />
              </div>
            </div>
          </div>
          {meetings && meetings.length > 0 && <MeetingList meetings={meetings} />}
          {!(meetings && meetings.length > 0) && (
            <EmptyContent
              height="100%"
              message={t('약속된 미팅이 없습니다.')}
              additionalContent={
                <div className="mt-3">
                  <Button
                    size="md"
                    color="primary"
                    onClick={() => {
                      history.push('/meetings/new');
                    }}
                  >
                    <i className="fas fa-plus" /> {t('새 미팅')}
                  </Button>
                </div>
              }
            />
          )}
        </div>
      )}
      {tab === 'calendar' && (
        <div className="g-page-content mt-3">
          <EmptyContent height="100%" message={t('아직 구현되지 않은 기능입니다.')} />
        </div>
      )}
    </div>
  );
};

export default compose(withRouter, withTranslation())(Meetings);

Meetings.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
};
