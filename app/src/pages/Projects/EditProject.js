import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, BottomButtons, Form, Input, Label, Page, PageContent, PageTitle, UserList } from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';

const labelMinWidth = '140px';

const EditProject = ({
  t,
  type,
  history,
  user,
  match: {
    params: { id },
  },
}) => {
  const [project, setProject] = useState({
    name: '',
    allowSearch: true,
    allowAutoJoin: true,
    activated: true,
    users: [],
  });

  useEffect(() => {
    if (id && type === 'edit')
      request.get(
        `/api/projects/${id}`,
        null,
        (data) => {
          setProject(data);
        },
        null,
        t('프로젝트 정보를 가져오고 있습니다'),
      );
  }, [id, type]);

  useEffect(() => {
    if (type === 'new') {
      const users = project.users.splice(0);
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

        setProject({
          ...project,
          users,
        });
      }
    }
  }, [user]);

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

  const onSubmit = (e) => {
    e.preventDefault();

    if (type === 'edit') {
      request.put(
        `/api/projects/${project.id}`,
        {
          ...project,
          users: project.users.filter((u) => u.CRUD !== 'D'),
        },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/projects/${data.id}`);
          });
        },
        null,
        t('프로젝트를 변경하고 있습니다.'),
      );
    } else {
      request.post(
        '/api/projects',
        { ...project },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/projects/${data.id}`);
          });
        },
        null,
        t('새로운 프로젝트를 만들고 있습니다.'),
      );
    }
  };

  return (
    <Page className="edit-project-wrapper">
      <PageTitle>{type === 'edit' ? t('프로젝트 변경') : t('새로운 프로젝트')}</PageTitle>
      <PageContent>
        <Form className="new-project-content" onSubmit={onSubmit}>
          <Block className="pt-0">
            <BlockTitle>{t('프로젝트 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('이름')}
              </Label>
              <Input type="name" size="md" value={project.name} onChange={(val) => changeInfo('name', val)} outline simple required minLength={1} />
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
          <Block>
            <BlockTitle>{t('멤버')}</BlockTitle>
            <UserList
              users={project.users}
              onChange={(val) => changeInfo('users', val)}
              onChangeUsers={changeUsers}
              editable={{
                role: true,
                member: true,
              }}
            />
          </Block>
          <BottomButtons
            onCancel={() => {
              history.goBack();
            }}
            onSubmit
            onSubmitIcon={<i className="fas fa-plane" />}
            onSubmitText={type === 'edit' ? t('프로젝트 변경') : t('프로젝트 등록')}
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
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(EditProject)));

EditProject.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  type: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
