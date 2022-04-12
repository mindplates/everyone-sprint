import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, BottomButtons, Form, Input, Label, Page, PageContent, PageTitle, TextArea, UserList, withLogin } from '@/components';
import dialog from '@/utils/dialog';
import { ACTIVATES, ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import { setSpaceInfo } from '@/store/actions';
import './EditSpace.scss';

const labelMinWidth = '140px';

const EditSpace = ({
  t,
  type,
  history,
  user,
  match: {
    params: { id },
  },
  setSpaceInfo: setSpaceInfoReducer,
}) => {
  const [space, setSpace] = useState({
    name: '',
    code: '',
    description: '',
    allowSearch: true,
    allowAutoJoin: true,
    activated: true,
    users: [],
  });

  useEffect(() => {
    if (id && type === 'edit')
      request.get(
        `/api/spaces/${id}`,
        null,
        (data) => {
          setSpace(data);
        },
        null,
        t('스페이스 정보를 가져오고 있습니다'),
      );
  }, [id, type]);

  useEffect(() => {
    if (type === 'new') {
      const users = space.users.splice(0);
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

        setSpace({
          ...space,
          users,
        });
      }
    }
  }, [user]);

  const changeInfo = (key, value) => {
    const next = { ...space };
    next[key] = value;
    setSpace(next);
  };

  const changeUsers = (users) => {
    const next = { ...space };
    next.users = users;
    setSpace(next);
  };

  const save = () => {
    if (type === 'edit') {
      request.put(
        `/api/spaces/${space.id}`,
        {
          ...space,
          users: space.users.filter((u) => u.CRUD !== 'D'),
        },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/spaces/${data.id}`);
          });
        },
        null,
        t('스페이스를 변경하고 있습니다.'),
      );
    } else {
      request.post(
        '/api/spaces',
        { ...space },
        (data) => {
          setSpaceInfoReducer(data);
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/spaces/${data.id}`);
          });
        },
        null,
        t('새로운 스페이스를 만들고 있습니다.'),
      );
    }
  };

  const onDelete = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('데이터 삭제 경고'), t('스페이스를 삭제하시겠습니까?'), () => {
      request.del(
        `/api/spaces/${id}`,
        null,
        () => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('삭제되었습니다.'), () => {
            history.push('/spaces');
          });
        },
        null,
        t('스페이스와 관련된 모든 데이터를 정리중입니다.'),
      );
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (space.users.filter((u) => u.CRUD !== 'D').length < 1) {
      dialog.setMessage(MESSAGE_CATEGORY.WARNING, t('사용자 없음'), t('최소 한명의 멤버는 추가되어야 합니다.'));
      return;
    }

    if (space.users.filter((u) => u.CRUD !== 'D').filter((d) => d.role === 'ADMIN').length < 1) {
      dialog.setMessage(MESSAGE_CATEGORY.WARNING, t('어드민 없음'), t('최소 한명의 어드민은 설정되어야 합니다.'));
      return;
    }

    const me = space.users.filter((u) => u.CRUD !== 'D').find((u) => u.userId === user.id);
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

  return (
    <Page className="edit-space-wrapper">
      <PageTitle
        breadcrumbs={
          type === 'new'
            ? [
                {
                  link: '/',
                  name: t('TOP'),
                },
                {
                  link: '/spaces',
                  name: t('스페이스 목록'),
                },
                {
                  link: '/spaces/new',
                  name: t('새 스페이스'),
                  current: true,
                },
              ]
            : [
                {
                  link: '/',
                  name: t('TOP'),
                },
                {
                  link: '/spaces',
                  name: t('스페이스 목록'),
                },
                {
                  link: `/spaces/${space?.id}`,
                  name: space?.name,
                },
                {
                  link: `/spaces/${space?.id}/edit`,
                  name: t('변경'),
                  current: true,
                },
              ]
        }
      >
        {type === 'edit' ? t('스페이스 변경') : t('새로운 스페이스')}
      </PageTitle>
      <PageContent className="d-flex" info>
        <Form className="flex-grow-1 d-flex flex-column" onSubmit={onSubmit}>
          <Block className="pt-0">
            <BlockTitle>{t('스페이스 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('이름')}
              </Label>
              <Input type="text" size="md" value={space.name} onChange={(val) => changeInfo('name', val)} outline simple required minLength={1} />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('코드')}
              </Label>
              <Input
                className="code"
                pattern="^[a-zA-Z0-9-_]+$"
                type="text"
                size="md"
                value={space.code}
                onChange={(val) => changeInfo('code', val)}
                outline
                simple
                required
                minLength={1}
                maxLength={20}
              />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('설명')}</Label>
              <TextArea
                className="description"
                type="text"
                size="md"
                value={space.description}
                onChange={(val) => changeInfo('description', val)}
                simple
                minLength={1}
              />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('활성화')}</Label>
              <RadioButton
                size="sm"
                items={ACTIVATES}
                value={space.activated}
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
                value={space.allowSearch}
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
                value={space.allowAutoJoin}
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
                users={space.users}
                onChange={(val) => changeInfo('users', val)}
                onChangeUsers={changeUsers}
                editable={{
                  role: type === 'edit',
                  member: type === 'edit',
                  add: false,
                }}
              />
            </div>
          </Block>
          <BottomButtons
            onCancel={() => {
              history.goBack();
            }}
            onDelete={space?.isAdmin ? onDelete : null}
            onDeleteText="삭제"
            onSubmit={type === 'new' || space?.isAdmin}
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withRouter(withLogin(EditSpace))));

EditSpace.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  type: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  setSpaceInfo: PropTypes.func,
};