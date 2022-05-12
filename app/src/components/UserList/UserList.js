import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { UserPropTypes } from '@/proptypes';
import { Popup, UserCard, UserListItem } from '@/components';
import UserSelector from '@/components/UserList/UserSelector';
import withLoader from '@/components/Common/withLoader';
import './UserList.scss';

const UserList = ({ className, t, users, editable, onChange, onChangeUsers, type, icon, showAdmin, target, targetId }) => {
  const [popup, setPopup] = useState(false);

  const changeUser = (targetIndex, field, value) => {
    const next = users.slice();
    const targetUser = next[targetIndex];

    if (field === 'CRUD' && value === 'D') {
      if (!targetUser.id) {
        next.splice(targetIndex, 1);
      } else {
        targetUser.CRUD = 'D';
      }
    } else if (field !== 'CRUD') {
      targetUser[field] = value;
      targetUser.CRUD = 'U';
    } else {
      targetUser[field] = value;
    }

    onChange(next);
  };

  return (
    <div className={`user-list-wrapper ${className} type-${type}`}>
      {!editable.member && users.length < 1 && (
        <div className="empty-message">
          <div>{t('등록된 멤버가 없습니다.')}</div>
        </div>
      )}
      {(editable.member || users.length > 0) && (
        <div className="user-list">
          {users.map((user, index) => {
            if (type === 'card') {
              return (
                <div key={index} className="user-card">
                  <UserCard icon={icon} userIndex={index} user={user} editable={editable} onChange={changeUser} showAdmin={showAdmin} />
                </div>
              );
            }

            return (
              <div key={index} className="user-card">
                <UserListItem icon={icon} userIndex={index} user={user} editable={editable} onChange={changeUser} showAdmin={showAdmin} />
              </div>
            );
          })}
          {editable.member && editable.add && (
            <div className="user-card">
              {type === 'card' && (
                <UserCard
                  icon={icon}
                  addCard
                  onClick={() => {
                    setPopup(true);
                  }}
                />
              )}
              {type === 'type' && (
                <UserListItem
                  icon={icon}
                  addCard
                  onClick={() => {
                    setPopup(true);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
      {popup && (
        <Popup
          title={target === 'space' ? '스페이스 사용자 검색' : '프로젝트 사용자 검색'}
          open
          size="md"
          setOpen={() => {
            setPopup(false);
          }}
        >
          <UserSelector
            target={target}
            targetId={targetId}
            close={() => {
              setPopup(false);
            }}
            onChange={() => {}}
            users={users}
            onChangeUsers={onChangeUsers}
            editable={editable.role}
          />
        </Popup>
      )}
    </div>
  );
};

export default compose(withTranslation())(withLoader(UserList, 'users'));

UserList.defaultProps = {
  className: '',
  editable: {
    role: true,
    member: true,
    add: true,
  },
  type: 'card',
  icon: true,
  showAdmin: false,
  target: 'space',
};

UserList.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  users: PropTypes.arrayOf(UserPropTypes),
  editable: PropTypes.shape({
    role: PropTypes.bool,
    member: PropTypes.bool,
    add: PropTypes.bool,
  }),
  onChange: PropTypes.func,
  onChangeUsers: PropTypes.func,
  type: PropTypes.string,
  icon: PropTypes.bool,
  showAdmin: PropTypes.bool,
  target: PropTypes.string,
  targetId: PropTypes.number,
};
