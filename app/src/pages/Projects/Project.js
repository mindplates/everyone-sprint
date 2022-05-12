import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Alert } from 'reactstrap';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  ClipBoardCopyButton,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  Text,
  UserApplicants,
  UserList,
  withLogin,
  withSpace,
} from '@/components';
import { ACTIVATES, ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import commonUtil from '@/utils/commonUtil';
import dialog from '@/utils/dialog';

const labelMinWidth = '140px';

const Project = ({
  t,
  match: {
    params: { id, spaceCode },
  },
}) => {
  const [project, setProject] = useState(null);

  const getProject = (projectId) => {
    request.get(
      `/api/{spaceCode}/projects/${projectId}`,
      null,
      (data) => {
        setProject(data);
      },
      (error, response) => {
        return response && (response.status === 423 || response.status === 404);
      },
      t('프로젝트 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getProject(id);
  }, [id]);

  const onReject = (applicantId) => {
    request.put(
      `/api/${spaceCode}/projects/${id}/applicants/${applicantId}/reject`,
      null,
      () => {
        getProject(id);
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('거절하였습니다.'));
      },
      null,
      t('사용자에게 스페이스 결정 사항을 알리고 있습니다.'),
    );
  };

  const onApprove = (applicantId) => {
    request.put(
      `/api/${spaceCode}/projects/${id}/applicants/${applicantId}/approve`,
      null,
      () => {
        getProject(id);
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('승인하였습니다.'));
      },
      null,
      t('사용자를 스페이스에 참여시키고 있습니다.'),
    );
  };

  const onExit = () => {
    dialog.setConfirm(
      MESSAGE_CATEGORY.WARNING,
      t('프로젝트 탈퇴'),
      t('프로젝트 탈퇴를 선택하시면, 프로젝트 및 포함된 스프린트에서 사용자의 모든 정보가 즉시 삭제됩니다. 프로젝트를 탈퇴하시겠습니까?'),
      () => {
        request.del(
          `/api/{spaceCode}/projects/${id}/users/my`,
          null,
          () => {
            commonUtil.move('/projects/my');
          },
          null,
          t('프로젝트에 사용자의 정보를 정리하고 있습니다.'),
        );
      },
    );
  };

  const projectLink = `${window.location.origin}/${spaceCode}/projects/tokens/${project?.token}`;

  return (
    <Page className="sprint-common">
      <PageTitle
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/projects/my'),
            name: t('프로젝트 목록'),
          },
          {
            link: commonUtil.getSpaceUrl(`/projects/${project?.id}`),
            name: project?.name,
          },
        ]}
      >
        {t('프로젝트 정보')}
      </PageTitle>
      {project && (
        <PageContent info>
          {project.closed && (
            <Block>
              <Alert color="warning mb-0">
                <div className="message">{t('종료된 프로젝트입니다. 종료된 프로젝트 및 관련 데이터는 검색되지 않습니다.')}</div>
              </Alert>
            </Block>
          )}
          <Block className="pt-0">
            <BlockTitle>{t('기본 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('스페이스')}</Label>
              <Text>{project.spaceName}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('이름')}</Label>
              <Text>{project.name}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('설명')}</Label>
              <Text>{project.description}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('활성화')}</Label>
              <Text>{(ACTIVATES.find((d) => d.key === project.activated) || {}).value}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('검색 허용')}</Label>
              <Text>{(ALLOW_SEARCHES.find((d) => d.key === project.allowSearch) || {}).value}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('초대 링크')}</Label>
              <div className="d-flex">
                <div>{projectLink}</div>
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                <div>
                  <ClipBoardCopyButton size="xs" data={projectLink} text="URL 복사" />
                </div>
              </div>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
              <Text>{(JOIN_POLICIES.find((d) => d.key === project.allowAutoJoin) || {}).value}</Text>
            </BlockRow>
          </Block>
          <Block className="g-last-block">
            <BlockTitle>{t('멤버')}</BlockTitle>
            <div className="flex-grow-1">
              <UserList
                showAdmin
                users={project.users}
                editable={{
                  role: false,
                  member: false,
                  add: false,
                }}
              />
            </div>
          </Block>
          {project.isAdmin && (
            <Block className="g-last-block">
              <BlockTitle>{t('참여 요청')}</BlockTitle>
              <UserApplicants applicants={project.applicants} onReject={onReject} onApprove={onApprove} />
            </Block>
          )}
          <BottomButtons
            onCancel={() => {
              commonUtil.goBack();
            }}
            onCancelText={t('뒤로')}
            onList={() => {
              commonUtil.move('/projects/my');
            }}
            onEdit={
              project?.isAdmin
                ? () => {
                    commonUtil.move(`/projects/${id}/edit`);
                  }
                : null
            }
            onEditText={t('변경')}
            onClose={project.isAdmin ? null : onExit}
            onCloseText={project.isAdmin ? '' : t('프로젝트 탈퇴')}
          />
        </PageContent>
      )}
    </Page>
  );
};

export default compose(withLogin, withSpace, withRouter, withTranslation())(Project);

Project.propTypes = {
  t: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      spaceCode: PropTypes.string,
    }),
  }),
};
