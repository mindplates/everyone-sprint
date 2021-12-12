import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import './UserList.scss';
import { UserPropTypes } from '@/proptypes';
import { Popup, UserCard } from '@/components';
import UserSelector from '@/components/UserList/UserSelector';

const UserList = ({ className, users, editable, onChange, onChangeUsers }) => {
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
    <div className={`user-list-wrapper ${className}`}>
      {!editable.member && users.length < 1 && (
        <div className="empty-message">
          <div>등록된 멤버가 없습니다.</div>
        </div>
      )}
      {(editable.member || users.length > 0) && (
        <div className="sprint-user-list">
          {users.map((user, index) => {
            return (
              <div key={index} className="user-card">
                <UserCard userIndex={index} user={user} editable={editable} onChange={changeUser} />
              </div>
            );
          })}
          {editable.member && (
            <div className="user-card">
              <UserCard
                addCard
                onClick={() => {
                  setPopup(true);
                }}
              />
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

export default UserList;

UserList.defaultProps = {
  className: '',
  editable: {
    role: true,
    member: true,
  },
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
};
