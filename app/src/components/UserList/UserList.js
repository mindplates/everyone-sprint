import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import './UserList.scss';
import { UserPropTypes } from '@/proptypes';
import { UserCard } from '@/components';

const UserList = ({ className, users, editable, onChange }) => {
  const changeUser = useCallback(
    (targetIndex, field, value) => {
      const next = users.slice();
      const target = next[targetIndex];
      target[field] = value;
      if (field !== 'CRUD') {
        target.CRUD = 'U';
      }
      onChange(next);
    },
    [users],
  );

  return (
    <div className={`user-list-wrapper ${className}`}>
      {!editable && users.length < 1 && (
        <div className="empty-message">
          <div>등록된 멤버가 없습니다.</div>
        </div>
      )}
      {(editable || users.length > 0) && (
        <div className="sprint-user-list">
          {users.map((user, index) => {
            return (
              <div key={index} className="user-card">
                <UserCard userIndex={index} user={user} editable={editable} onChange={changeUser} />
              </div>
            );
          })}
          {editable && (
            <div className="user-card">
              <UserCard
                addCard
                onClick={() => {
                  console.log('add');
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;

UserList.defaultProps = {
  className: '',
  editable: false,
};

UserList.propTypes = {
  className: PropTypes.string,
  users: PropTypes.arrayOf(UserPropTypes),
  editable: PropTypes.bool,
  onChange: PropTypes.func,
};
