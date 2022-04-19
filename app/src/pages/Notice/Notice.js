import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Page, PageContent, Popup, ProductLogo } from '@/components';
import './Notice.scss';
import dateUtil from '@/utils/dateUtil';
import { DATE_FORMATS_TYPES } from '@/constants/constants';

const Notice = ({ t }) => {
  const [list] = useState([
    {
      date: new Date(2022, 4, 20, 9, 0, 0),
      title: '모두의 스프린트 깃헙',
      subject: '모두의 스프린트에 참여하기',
      content: (
        <div>
          <p>
            모두의 스프린트는 아파치 라이선스(
            <a target="_blank" rel="noreferrer" href="https://www.apache.org/licenses/LICENSE-2.0">
              https://www.apache.org/licenses/LICENSE-2.0
            </a>
            )를 가지는 오픈 소스로써, 스프린트 기반의 프로젝트를 진행하면서, 발생하는 여러 상황을 웹을 통해 온라인을 통해 진행에 도움을 주기 위한 도구입니다.
            현재는 온라인을 통해 만나고, 데일리 스크럼과 이야기를 나누기 위한 기능들이 개발되어 있습니다.
          </p>
          <p>
            모두의 스프린트 깃헙(
            <a target="_blank" rel="noreferrer" href="https://github.com/mindplates/everyone-sprint">
              https://github.com/mindplates/everyone-sprint
            </a>
            )을 통해 누구나 필요한 기능을 개발하고 만드는 과정에 직접 참여하실 수도 있으며, 사용하면서 발생하는 버그에 대한 정보나, 아이디어를 제공하는 것도 큰
            도움이 됩니다.
          </p>
          <p>새로운 기능이나, 버그에 대한 PR, 다양한 의견을 남기실 수 있습니다.</p>
        </div>
      ),
    },
    {
      date: new Date(2022, 4, 20, 9, 0, 0),
      title: 'EESPRINT.COM',
      subject: 'EESPRINT.COM 사이트 안내',
      content: (
        <div>
          <p>
            EESPRINT.COM은 실제 서비스의 용도로 운영되고 있지 않습니다. 만들어진 EESPRINT의 최신 릴리즈를 테스트하기 위해 운영되고 있으며, 따라서 사용자 정보를
            비롯한 생성된 데이터 파일이 유지되는 것을 보장하지 않습니다. 실제 안정적인 사용을 위해서는 최신 릴리즈를 다운로드하여, 사용자의 환경에 설치하고
            사용하는 것을 권장합니다.
          </p>
          <p>
            최신 릴리즈는{' '}
            <a target="_blank" rel="noreferrer" href="https://github.com/mindplates/everyone-sprint/releases">
              https://github.com/mindplates/everyone-sprint/releases
            </a>
            를 통해 확인 및 다운로드 할 수 있으며, 설치 방법은{' '}
            <a target="_blank" rel="noreferrer" href="https://github.com/mindplates/everyone-sprint">
              https://github.com/mindplates/everyone-sprint
            </a>
            의 설치 가이드를 통해 확인할 수 있습니다.
          </p>
        </div>
      ),
    },
  ]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const selectedContent = list[selectedIndex];

  return (
    <Page className="notice-wrapper" title={false}>
      <PageContent listLayout className="notice-page-content">
        <div className="content">
          <div className="welcome">
            <div>
              <div className="logo">
                <ProductLogo className="bg-transparent d-inline-block" name={false} width="auto" />
              </div>
            </div>
          </div>
        </div>
        <div className="notice-board">
          <div className="title">
            <span>{t('NOTICE')}</span>
          </div>
          <div className="list">
            <div className="g-scroller">
              <ul>
                {list.map((d, inx) => {
                  return (
                    <li key={inx}>
                      <div>
                        <div
                          className="title"
                          onClick={() => {
                            setSelectedIndex(inx);
                          }}
                        >
                          <span>{d.title}</span>
                        </div>
                        <div className="date">{dateUtil.getDateString(d.date, DATE_FORMATS_TYPES.yearsDays)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </PageContent>
      {selectedIndex !== null && (
        <Popup
          title={selectedContent.title}
          position="top"
          open
          size="md"
          setOpen={() => {
            setSelectedIndex(null);
          }}
        >
          <div className="notice-content">
            <div className="logo">
              <ProductLogo className="bg-transparent d-inline-block" name={false} width="auto" />
            </div>
            <div className="title">{selectedContent.subject}</div>
            <div>{selectedContent.content}</div>
            <div className="date">{dateUtil.getDateString(selectedContent.date, DATE_FORMATS_TYPES.yearsDays)}</div>
          </div>
        </Popup>
      )}
    </Page>
  );
};

export default compose(withRouter, withTranslation())(Notice);

Notice.propTypes = {
  t: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      spaceCode: PropTypes.string,
    }),
  }),
};
