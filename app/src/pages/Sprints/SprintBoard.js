import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, DateRangeText, Label, Page, PageContent, PageTitle, Text } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';

const labelMinWidth = '140px';

const SprintBoard = ({
  t,
  history,
  user,
  match: {
    params: { id },
  },
}) => {
  const [sprint, setSprint] = useState(null);

  useEffect(() => {
    request.get(
      `/api/sprints/${id}`,
      null,
      (data) => {
        setSprint(data);
      },
      null,
      t('스프린트 정보를 가져오고 있습니다.'),
    );
  }, [id]);

  console.log(history);

  return (
    <Page>
      <PageTitle>{t('스프린트 보드')}</PageTitle>
      {sprint && (
        <PageContent>
          <Block className="pt-0">
            <BlockTitle>{t('스프린트 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('이름')}</Label>
              <Text>{sprint.name}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('기간')}</Label>
              <DateRangeText country={user.country} startDate={sprint.startDate} endDate={sprint.endDate} />
            </BlockRow>
          </Block>
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

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(SprintBoard)));

SprintBoard.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
