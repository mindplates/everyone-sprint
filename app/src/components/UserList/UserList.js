import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import './UserList.scss';
import { UserPropTypes } from '@/proptypes';
import { Popup, UserCard, UserListItem } from '@/components';
import UserSelector from '@/components/UserList/UserSelector';
import withLoader from '@/components/Common/withLoader';

const UserList = ({ className, users, editable, onChange, onChangeUsers, type, icon }) => {
  const [popup, setPopup] = useState(false);

  const changeUser = useCallback(
    (targetIndex, field, value) => {
      const next = users.slice();
      const target = next[targetIndex];

      if (field === 'CRUD' && value === 'D') {
        if (!target.id) {
          next.splice(targetIndex, 1);
        } else {
          target.CRUD = 'D';
        }
      } else if (field !== 'CRUD') {
        target[field] = value;
        target.CRUD = 'U';
      } else {
        target[field] = value;
      }

      onChange(next);
    },
    [users],
  );

  return (
    <div className={`user-list-wrapper ${className} type-${type}`}>
      {!editable.member && users.length < 1 && (
        <div className="empty-message">
          <div>등록된 멤버가 없습니다.</div>
        </div>
      )}
      {(editable.member || users.length > 0) && (
        <div className="user-list">
          {users.map((user, index) => {
            if (type === 'card') {
              return (
                <div key={index} className="user-card">
                  <UserCard icon={icon} userIndex={index} user={user} editable={editable} onChange={changeUser} />
                </div>
              );
            }

            return (
              <div key={index} className="user-card">
                <UserListItem icon={icon} userIndex={index} user={user} editable={editable} onChange={changeUser} />
              </div>
            );
          })}
          {editable.member && (
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
          title="사용자 검색"
          open
          size="md"
          setOpen={() => {
            setPopup(false);
          }}
        >
          <UserSelector
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

export default withLoader(UserList, 'users');

UserList.defaultProps = {
  className: '',
  editable: {
    role: true,
    member: true,
  },
  type: 'card',
  icon: true,
};

UserList.propTypes = {
  className: PropTypes.string,
  users: PropTypes.arrayOf(UserPropTypes),
  editable: PropTypes.shape({
    role: PropTypes.bool,
    member: PropTypes.bool,
  }),
  onChange: PropTypes.func,
  onChangeUsers: PropTypes.func,
  type: PropTypes.string,
  icon: PropTypes.bool,
};
