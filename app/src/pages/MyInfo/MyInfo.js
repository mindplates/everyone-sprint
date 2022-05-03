import React, { useEffect, useState } from 'react';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, BottomButtons, Label, Page, PageContent, PageTitle, Text, UserImage, withLogin } from '@/components';
import request from '@/utils/request';
import commonUtil from '@/utils/commonUtil';
import { COUNTRIES, LANGUAGES, TIMEZONES } from '@/constants/constants';
import { HistoryPropTypes } from '@/proptypes';
import './MyInfo.scss';

const labelMinWidth = '140px';

const MyInfo = ({ t, history }) => {
  const [myInfo, setMyInfo] = useState(null);

  const getMyInfo = () => {
    request.get(
      '/api/users/my-info',
      null,
      (data) => {
        setMyInfo(data);
      },
      null,
      t('사용자의 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getMyInfo();
  }, []);

  return (
    <Page className="project-wrapper">
      <PageTitle
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/my-info'),
            name: t('내 정보'),
            current: true,
          },
        ]}
      >
        {t('내 정보')}
      </PageTitle>
      {myInfo && (
        <PageContent className="my-info-wrapper d-flex" info>
          <Block className="pt-0 flex-grow-1">
            <BlockTitle>{t('사용자 정보')}</BlockTitle>
            <div className="user-info-content">
              <div className="user-image">
                <UserImage size="120px" iconFontSize="50px" rounded={false} imageType={myInfo.imageType} imageData={myInfo.imageData} border />
              </div>
              <div>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('이메일')}</Label>
                  <Text>{myInfo.email}</Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('별명')}</Label>
                  <Text>{myInfo.alias}</Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('이름')}</Label>
                  <Text>
                    {myInfo.name} {myInfo.isNameOpened ? t('(공개)') : t('(비공개)')}
                  </Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('전화번호')}</Label>
                  <Text>
                    {myInfo.tel} {myInfo.isTelOpened ? t('(공개)') : t('(비공개)')}
                  </Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('언어')}</Label>
                  <Text>{LANGUAGES[myInfo.language]}</Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('지역')}</Label>
                  <Text>{COUNTRIES[myInfo.country]}</Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('타임존')}</Label>
                  <Text>{TIMEZONES[myInfo.timezone]?.name}</Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('자동로그인')}</Label>
                  <Text>{myInfo.autoLogin ? 'Y' : 'N'}</Text>
                </BlockRow>
              </div>
            </div>
          </Block>
          <BottomButtons
            onListText={t('비밀번호 변경')}
            onList={() => {
              history.push('/my-info/password');
            }}
            onEdit={() => {
              history.push('/my-info/edit');
            }}
            onEditText="변경"
          />
        </PageContent>
      )}
    </Page>
  );
};

export default compose(withLogin, withRouter, withTranslation())(MyInfo);

MyInfo.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
};
