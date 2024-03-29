import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  Button,
  ClipBoardCopyButton,
  Form,
  Input,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  Text,
  UserList,
  withLogin,
  withSpace,
} from '@/components';
import dialog from '@/utils/dialog';
import { ACTIVATES, ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { SpacePropTypes, UserPropTypes } from '@/proptypes';
import commonUtil from '@/utils/commonUtil';

const labelMinWidth = '140px';

const EditProject = ({
  t,
  type,
  space,
  user,
  match: {
    params: { id, spaceCode },
  },
}) => {
  const [project, setProject] = useState({
    name: '',
    description: '',
    allowSearch: true,
    allowAutoJoin: true,
    activated: true,
    users: [],
  });

  const getToken = (nextProject) => {
    request.get(
      '/api/{spaceCode}/projects/token',
      null,
      (data) => {
        setProject({
          ...nextProject,
          token: data,
        });
      },
      null,
      t('토큰을 재발급하고 있습니다.'),
    );
  };

  useEffect(() => {
    if (id && type === 'edit') {
      request.get(
        `/api/{spaceCode}/projects/${id}`,
        null,
        (data) => {
          data.users = data.users.map((u) => {
            return {
              ...u,
              CRUD: 'R',
            };
          });
          setProject(data);
        },
        null,
        t('프로젝트 정보를 가져오고 있습니다'),
      );
    }
  }, [id, type]);

  useEffect(() => {
    if (type === 'new') {
      const nextProject = { ...project };
      const users = nextProject.users.splice(0);
      if (user && user.id && users.length < 1) {
        users.push({
          userId: user.id,
          email: user.email,
          alias: user.alias,
          name: user.name,
          imageType: user.imageType,
          imageData: user.imageData,
          role: 'ADMIN',
          CRUD: 'C',
        });

        nextProject.users = users;

        setProject(nextProject);
      }
      getToken(nextProject);
    }
  }, []);

  const changeInfo = (key, value) => {
    const next = { ...project };
    next[key] = value;
    setProject(next);
  };

  const changeUsers = (users) => {
    const next = { ...project };
    next.users = users;
    setProject(next);
  };

  const updateProject = () => {
    request.put(
      `/api/{spaceCode}/projects/${project.id}`,
      project,
      (data) => {
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 변경되었습니다.'), () => {
          commonUtil.move(`/projects/${data.id}/info`);
        });
      },
      null,
      t('프로젝트를 변경하고 있습니다.'),
    );
  };

  const save = () => {
    if (type === 'edit') {
      if (project.users.filter((u) => u.CRUD === 'D').length > 0) {
        dialog.setConfirm(
          MESSAGE_CATEGORY.WARNING,
          t('프로젝트 사용자 제거 경고'),
          t('프로젝트에서 제외된 사용자가 참여중인 스프린트, 미팅을 비롯한 프로젝트와 관련된 사용자 정보가 모두 삭제됩니다. 변경하시겠습니까?'),
          () => {
            updateProject();
          },
        );
      } else {
        updateProject();
      }
    } else {
      request.post(
        '/api/{spaceCode}/projects',
        project,
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('프로젝트가 생성되었습니다.'), () => {
            commonUtil.move(`/projects/${data.id}/info`);
          });
        },
        null,
        t('새로운 프로젝트를 만들고 있습니다.'),
      );
    }
  };

  const onDelete = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('데이터 삭제 경고'), t('프로젝트를 삭제하시겠습니까?'), () => {
      request.del(
        `/api/{spaceCode}/projects/${id}`,
        null,
        () => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('삭제되었습니다.'), () => {
            commonUtil.move('/projects/my');
          });
        },
        null,
        t('프로젝트와 관련된 모든 데이터를 정리중입니다.'),
      );
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (project.users.filter((u) => u.CRUD !== 'D').length < 1) {
      dialog.setMessage(MESSAGE_CATEGORY.WARNING, t('사용자 없음'), t('최소 한명의 멤버는 추가되어야 합니다.'));
      return;
    }

    if (project.users.filter((u) => u.CRUD !== 'D').filter((d) => d.role === 'ADMIN').length < 1) {
      dialog.setMessage(MESSAGE_CATEGORY.WARNING, t('어드민 없음'), t('최소 한명의 어드민은 설정되어야 합니다.'));
      return;
    }

    const me = project.users.filter((u) => u.CRUD !== 'D').find((u) => u.userId === user.id);
    if (!me) {
      dialog.setConfirm(
        MESSAGE_CATEGORY.WARNING,
        t('권한 경고'),
        t('프로젝트 멤버에 현재 사용자가 포함되어 있지 않습니다. 변경 후 프로젝트에 더 이상 접근이 불가능합니다. 계속하시겠습니까?'),
        () => {
          save();
        },
      );
    } else {
      save();
    }
  };

  const projectLink = `${window.location.origin}/${spaceCode}/projects/tokens/${project.token}`;

  return (
    <Page className="edit-project-wrapper">
      <PageTitle
        breadcrumbs={
          type === 'new'
            ? [
                {
                  link: commonUtil.getSpaceUrl('/'),
                  name: t('TOP'),
                },
                {
                  link: commonUtil.getSpaceUrl('/projects/my'),
                  name: t('프로젝트 목록'),
                },
                {
                  link: commonUtil.getSpaceUrl('/projects/new'),
                  name: t('새 프로젝트'),
                  current: true,
                },
              ]
            : [
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
                {
                  link: commonUtil.getSpaceUrl(`/projects/${project?.id}/edit`),
                  name: t('변경'),
                  current: true,
                },
              ]
        }
      >
        {type === 'edit' ? t('프로젝트 변경') : t('새로운 프로젝트')}
      </PageTitle>
      <PageContent className="d-flex" info>
        <Form className="new-project-content" onSubmit={onSubmit}>
          <Block className="pt-0">
            <BlockTitle>{t('기본 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('스페이스')}
              </Label>
              <Text>{space.name}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('이름')}
              </Label>
              <Input type="text" size="md" value={project.name} onChange={(val) => changeInfo('name', val)} outline simple required minLength={1} />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('설명')}</Label>
              <Input className="w-100" type="text" size="md" value={project.description} onChange={(val) => changeInfo('description', val)} outline simple />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('활성화')}</Label>
              <RadioButton
                size="sm"
                items={ACTIVATES}
                value={project.activated}
                onClick={(val) => {
                  changeInfo('activated', val);
                }}
              />
            </BlockRow>
          </Block>
          <Block>
            <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('검색 허용')}</Label>
              <RadioButton
                size="sm"
                items={ALLOW_SEARCHES}
                value={project.allowSearch}
                onClick={(val) => {
                  changeInfo('allowSearch', val);
                }}
              />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('초대 링크')}</Label>
              <div className="d-flex">
                <div>{projectLink}</div>
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                <div>
                  <Button
                    size="xs"
                    color="point"
                    outline
                    onClick={() => {
                      getToken(project);
                    }}
                  >
                    {t('재발급')}
                  </Button>
                </div>
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                <div>
                  <ClipBoardCopyButton size="xs" data={projectLink} text="URL 복사" />
                </div>
              </div>
            </BlockRow>

            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
              <RadioButton
                size="sm"
                items={JOIN_POLICIES}
                value={project.allowAutoJoin}
                onClick={(val) => {
                  changeInfo('allowAutoJoin', val);
                }}
              />
            </BlockRow>
          </Block>
          <Block className="g-last-block">
            <BlockTitle>{t('멤버')}</BlockTitle>
            <div className="flex-grow-1">
              <UserList
                useTags
                project={project}
                users={project.users}
                onChange={(val) => changeInfo('users', val)}
                onChangeUsers={changeUsers}
                editable={{
                  role: true,
                  member: true,
                  add: true,
                }}
              />
            </div>
          </Block>
          <BottomButtons
            onCancel={() => {
              commonUtil.goBack();
            }}
            onDelete={project?.isAdmin ? onDelete : null}
            onDeleteText="삭제"
            onSubmit={type === 'new' || project?.isAdmin}
            onSubmitText="저장"
            onCancelIcon=""
          />
        </Form>
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    space: state.space,
  };
};

export default compose(withLogin, withSpace, connect(mapStateToProps, undefined), withRouter, withTranslation())(EditProject);

EditProject.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  space: SpacePropTypes,
  type: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      spaceCode: PropTypes.string,
    }),
  }),
};
