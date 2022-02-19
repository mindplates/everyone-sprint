import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, BottomButtons, Label, Page, PageContent, PageTitle, Text, UserList, withLogin } from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes } from '@/proptypes';

const labelMinWidth = '140px';

const Project = ({
  t,
  history,
  match: {
    params: { id },
  },
}) => {
  const [project, setProject] = useState(null);

  useEffect(() => {
    request.get(`/api/projects/${id}`, null, setProject, null, t('프로젝트 정보를 가져오고 있습니다.'));
  }, [id]);

  const onDelete = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('데이터 삭제 경고'), t('프로젝트를 삭제하시겠습니까?'), () => {
      request.del(
        `/api/projects/${id}`,
        null,
        () => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('삭제되었습니다.'), () => {
            history.push('/projects');
          });
        },
        null,
        t('프로젝트와 관련된 모든 데이터를 정리중입니다.'),
      );
    });
  };

  return (
    <Page className="project-common">
      <PageTitle>{t('프로젝트 정보')}</PageTitle>
      {project && (
        <PageContent>
          <Block className="pt-0">
            <BlockTitle>{t('프로젝트 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('이름')}</Label>
              <Text>{project.name}</Text>
            </BlockRow>
          </Block>
          <Block>
            <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('검색 허용')}</Label>
              <Text>{(ALLOW_SEARCHES.find((d) => d.key === project.allowSearch) || {}).value}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
              <Text>{(JOIN_POLICIES.find((d) => d.key === project.allowAutoJoin) || {}).value}</Text>
            </BlockRow>
          </Block>
          <Block>
            <BlockTitle>{t('멤버')}</BlockTitle>
            <UserList
              users={project.users}
              editable={{
                role: false,
                member: false,
              }}
            />
          </Block>
          <BottomButtons
            onList={() => {
              history.push('/projects');
            }}
            onEdit={() => {
              history.push(`/projects/${id}/edit`);
            }}
            onEditText="프로젝트 변경"
            onDelete={onDelete}
            onDeleteText="프로젝트 삭제"
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

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(withLogin(Project))));

Project.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
