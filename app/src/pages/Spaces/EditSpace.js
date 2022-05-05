import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import PropTypes from 'prop-types';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  Button,
  EmptyContent,
  Form,
  Input,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  TextArea,
  UserList,
  withLogin,
} from '@/components';
import dialog from '@/utils/dialog';
import { ACTIVATES, ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import { setSpaceInfo, setUserInfo } from '@/store/actions';
import commonUtil from '@/utils/commonUtil';
import './EditSpace.scss';

const labelMinWidth = '140px';

const EditSpace = ({
  t,
  type,
  history,
  user,
  match: {
    params: { spaceCode },
  },
  setSpaceInfo: setSpaceInfoReducer,
  setUserInfo: setUserInfoReducer,
}) => {
  const [copyText, setCopyText] = useState(t('URL 복사'));

  const skip = useRef(false);

  const [space, setSpace] = useState({
    name: '',
    code: '',
    description: '',
    allowSearch: true,
    allowAutoJoin: true,
    activated: true,
    token: '',
    users: [],
  });

  const getToken = (nextSpace) => {
    request.get(
      '/api/spaces/token',
      null,
      (data) => {
        setSpace({
          ...nextSpace,
          token: data,
        });
      },
      null,
      t('토큰을 재발급하고 있습니다.'),
    );
  };

  useEffect(() => {
    if (skip.current) {
      return;
    }

    if (user && spaceCode && type === 'edit') {
      request.get(
        `/api/spaces/${spaceCode}`,
        null,
        (data) => {
          data.users = data.users.map((d) => {
            return {
              ...d,
              CRUD: 'R',
            };
          });
          setSpace(data);
        },
        null,
        t('스페이스 정보를 가져오고 있습니다'),
      );
    }

    if (user && type === 'new') {
      getToken({
        name: '',
        code: '',
        description: '',
        allowSearch: true,
        allowAutoJoin: true,
        activated: true,
        token: '',
        users: [
          {
            userId: user.id,
            email: user.email,
            alias: user.alias,
            name: user.name,
            imageType: user.imageType,
            imageData: user.imageData,
            role: 'ADMIN',
            CRUD: 'C',
          },
        ],
      });
    }
  }, [spaceCode, type, user]);

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

  const getMyInfo = () => {
    request.get(
      '/api/users/my-info',
      null,
      (data) => {
        skip.current = true;
        setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces));
        setUserInfoReducer(data);
      },
      null,
      t('사용자의 정보를 가져오고 있습니다.'),
    );
  };

  const updateSpace = () => {
    request.put(
      `/api/spaces/${space.code}`,
      space,
      () => {
        getMyInfo();
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 변경되었습니다.'), () => {
          history.push(`/spaces/${space.code}`);
        });
      },
      null,
      t('스페이스를 변경하고 있습니다.'),
    );
  };

  const save = () => {
    if (type === 'edit') {
      if (space.users.filter((u) => u.CRUD === 'D').length > 0) {
        dialog.setConfirm(
          MESSAGE_CATEGORY.WARNING,
          t('스페이스 사용자 제거 경고'),
          t('스페이스에서 제외된 사용자가 참여중인 프로젝트, 스프린트, 미팅을 비롯한 스페이스와 관련된 사용자 정보가 모두 삭제됩니다. 변경하시겠습니까?'),
          () => {
            updateSpace();
          },
        );
      } else {
        updateSpace();
      }
    } else {
      request.post(
        '/api/spaces',
        space,
        () => {
          getMyInfo();
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/spaces/${space.code.toUpperCase()}`);
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
        `/api/spaces/${spaceCode}`,
        null,
        () => {
          getMyInfo();
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

  const spaceLink = `${window.location.origin}/spaces/tokens/${space.token}`;

  return (
    <Page className="edit-space-wrapper">
      <PageTitle
        breadcrumbs={
          type === 'new'
            ? [
                {
                  link: commonUtil.getSpaceUrl('/'),
                  name: t('TOP'),
                },
                {
                  link: commonUtil.getSpaceUrl('/spaces'),
                  name: t('스페이스 목록'),
                },
                {
                  link: commonUtil.getSpaceUrl('/spaces/new'),
                  name: t('새 스페이스'),
                  current: true,
                },
              ]
            : [
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
                },
                {
                  link: commonUtil.getSpaceUrl(`/spaces/${space?.id}/edit`),
                  name: t('변경'),
                  current: true,
                },
              ]
        }
      >
        {type === 'edit' ? t('스페이스 변경') : t('새로운 스페이스')}
      </PageTitle>
      {type === 'edit' && !space.id && (
        <PageContent className="space-content">
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={
              <div>
                <div>{t('스페이스가 존재하지 않습니다.')}</div>
              </div>
            }
          />
          <BottomButtons
            onList={() => {
              history.push('/spaces');
            }}
          />
        </PageContent>
      )}
      {!(type === 'edit' && !space.id) && (
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
                  minLength={2}
                  maxLength={20}
                />
                <span className="align-self-center ml-3 small">* {t('2자 이상의 공백 없는 영문자, 숫자 및 -, _기호만 사용 가능합니다.')}</span>
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
                <Label minWidth={labelMinWidth}>{t('초대 링크')}</Label>
                <div className="d-flex">
                  <div>{spaceLink}</div>
                  <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                  <div>
                    <Button
                      size="xs"
                      color="point"
                      outline
                      onClick={() => {
                        getToken(space);
                      }}
                    >
                      {t('재발급')}
                    </Button>
                  </div>
                  <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                  <div>
                    <Button
                      size="xs"
                      color="point"
                      outline
                      onClick={() => {
                        copy(spaceLink);
                        setCopyText(
                          <span>
                            <i className="fas fa-check mr-2" />
                            {t('URL 복사')}
                          </span>,
                        );
                        setTimeout(() => {
                          setCopyText(t('URL 복사'));
                        }, 1000);
                      }}
                    >
                      {copyText}
                    </Button>
                  </div>
                </div>
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
      )}
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
    setUserInfo: (user) => dispatch(setUserInfo(user)),
  };
};

export default compose(withLogin, connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(EditSpace);

EditSpace.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  type: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      spaceCode: PropTypes.string,
    }),
  }),
  setSpaceInfo: PropTypes.func,
  setUserInfo: PropTypes.func,
};
