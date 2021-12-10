import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './UserSelector.scss';
import { Button, Input, Liner, UserImage } from '@/components';
import request from '@/utils/request';
import { UserPropTypes } from '@/proptypes';

const UserSelector = ({ t, users: parentUsers, close, onChangeUsers }) => {
  const [word, setWord] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);

  useEffect(() => {
    setCurrentUsers(parentUsers.slice(0));
  }, []);

  const getUsers = () => {
    request.get(
      '/api/users',
      { word },
      (list) => {
        setUsers(list);
      },
      null,
      '사용자를 검색중입니다',
    );
  };

  const toggleUser = (inx) => {
    const targetUser = users[inx];
    const nextUsers = currentUsers.slice(0);
    const currentUserIndex = nextUsers.findIndex((d) => d.userId === targetUser.id);
    if (currentUserIndex > -1) {
      if (nextUsers[currentUserIndex].id && nextUsers[currentUserIndex].CRUD === 'D') {
        nextUsers[currentUserIndex].CRUD = 'U';
      } else if (nextUsers[currentUserIndex].id && nextUsers[currentUserIndex].CRUD !== 'D') {
        nextUsers[currentUserIndex].CRUD = 'D';
      } else {
        nextUsers.splice(currentUserIndex, 1);
      }
    } else {
      nextUsers.push({
        userId: targetUser.id,
        email: targetUser.email,
        alias: targetUser.alias,
        name: targetUser.name,
        imageType: targetUser.imageType,
        imageData: targetUser.imageData,
        role: 'MEMBER',
        CRUD: 'C',
      });
    }

    setCurrentUsers(nextUsers);
  };

  const changeRole = (userId) => {
    const nextUsers = currentUsers.slice(0);
    const targetUser = nextUsers.find((d) => d.userId === userId);
    if (targetUser.role === 'ADMIN') {
      targetUser.role = 'MEMBER';
    } else {
      targetUser.role = 'ADMIN';
    }

    setCurrentUsers(nextUsers);
  };

  console.log(currentUsers);

  return (
    <div className="user-selector-wrapper g-no-select">
      <div className="search-content">
        <div>
          <div>{t('검색어')}</div>
          <div>
            <Input
              type="text"
              size="md"
              value={word}
              onChange={(val) => {
                setWord(val);
              }}
              outline
              simple
              placeholderMessage="이메일 또는 이름 또는 별명"
              placeholder="이메일 또는 이름 또는 별명"
            />
          </div>
          <div>
            <Button size="md" color="primary" onClick={getUsers}>
              검색
            </Button>
          </div>
        </div>
      </div>
      {users.length < 1 && (
        <div className="empty-content">
          <div>
            <div>검색된 사용자가 없습니다.</div>
          </div>
        </div>
      )}
      {users.length > 0 && (
        <div className="search-user-content">
          <div className="g-scrollbar">
            <ul>
              {users.map((user, inx) => {
                const currentUser = currentUsers
                  .filter((info) => info.CRUD !== 'D')
                  .find((info) => info.userId === user.id);
                return (
                  <li
                    key={inx}
                    className={currentUser ? 'selected' : ''}
                    onClick={() => {
                      toggleUser(inx);
                    }}
                  >
                    <div>
                      <div className="checked">
                        {currentUser && <i className="fas fa-check-square" />}
                        {!currentUser && <i className="far fa-square" />}
                      </div>
                      <div className="separator">
                        <Liner display="inline-block" width="1px" height="14px" color="light" />
                      </div>
                      <div className="user-image">
                        <UserImage rounded size="40px" imageType={user.imageType} imageData={user.imageData} />
                      </div>
                      <div className="user-content">
                        <div className="email">{user.email}</div>
                        <div className="alias">
                          <span>{user.alias}</span>
                          {user.name && <span className="user-name">{user.name}</span>}
                        </div>
                      </div>
                      {currentUser && (
                        <div className="separator">
                          <Liner display="inline-block" width="1px" height="14px" color="light" />
                        </div>
                      )}
                      <div className="user-role">
                        {currentUser && (
                          <div>
                            <span className="role">{currentUser.role}</span>
                            <Button
                              rounded
                              size="xs"
                              outline
                              onClick={(e) => {
                                console.log(e);
                                e.stopPropagation();
                                changeRole(currentUser.userId);
                              }}
                            >
                              <i className="fas fa-exchange-alt" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <div className="g-popup-bottom-button">
        <Button size="md" color="white" outline onClick={() => {}}>
          <i className="fas fa-times" /> 취소
        </Button>
        <Button
          type="submit"
          size="md"
          color="white"
          outline
          onClick={() => {
            onChangeUsers(currentUsers);
            close();
          }}
        >
          <i className="fas fa-vote-yea" /> {t('선택')}
        </Button>
      </div>
    </div>
  );
};

export default withTranslation()(UserSelector);

UserSelector.propTypes = {
  t: PropTypes.func,
  close: PropTypes.func,
  users: PropTypes.arrayOf(UserPropTypes),
  onChangeUsers: PropTypes.func,
};
