import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Page, PageTitle, withLogin } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes } from '@/proptypes';
import commonUtil from '@/utils/commonUtil';
import SpaceApplicantStatus from '@/pages/Spaces/SpaceApplicantStatus';

const SpaceLink = ({
  t,
  history,
  match: {
    params: { token },
  },
}) => {
  const [space, setSpace] = useState(null);
  const [allowed, setAllowed] = useState(null);

  const getSpace = () => {
    request.get(
      `/api/spaces/token/${token}`,
      null,
      (data) => {
        if (data.isMember) {
          history.push(`/spaces/${data.code}`);
        } else {
          setAllowed(true);
          setSpace(data);
        }
      },
      (error, response) => {
        setAllowed(false);
        if (response && (response.status === 423 || response.status === 404)) {
          return true;
        }

        return false;
      },
      t('스페이스 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getSpace();
  }, [token]);

  return (
    <Page title={false}>
      <PageTitle
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/spaces'),
            name: t('스페이스 목록'),
          },
          {
            link: commonUtil.getSpaceUrl(`/spaces/${space?.id}`),
            name: space?.name,
            current: true,
          },
        ]}
      >
        {t('스페이스 참여')}
      </PageTitle>
      <SpaceApplicantStatus allowed={allowed} spaceCode={space?.code} space={space} getSpace={getSpace} token={token} />
    </Page>
  );
};

export default compose(withLogin, withRouter, withTranslation())(SpaceLink);

SpaceLink.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string,
    }),
  }),
};
