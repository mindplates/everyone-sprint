import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { UserPropTypes } from '@/proptypes';
import { Button, ExitButton, Input, UserImage } from '@/components';
import './UserCard.scss';

const UserCard = ({ className, onClick, user, editable, onChange, userIndex, addCard, showAdmin, useTags, onChangeTag, t }) => {
  const [tagCreatorOpened, setTagCreatorOpened] = useState(false);

  const [tagText, setTagText] = useState('');

  const CRUD = (user || {}).CRUD || 'S';

  const tags = (useTags && user?.tags?.split(',')) || [];

  return (
    <div
      className={`user-card-wrapper ${className} ${CRUD === 'D' ? 'deleted' : ''} ${addCard ? 'add-card' : ''} ${useTags ? 'use-tags' : ''}`}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      {addCard && (
        <div className="add-card-content">
          <div>
            <div className="icon">
              <i className="fas fa-plus" />
            </div>
            <div>새 멤버 추가</div>
          </div>
        </div>
      )}
      {!addCard && (
        <div>
          {CRUD === 'D' && (
            <div className="role">
              <span className="deleted">DELETED</span>
            </div>
          )}
          {editable.role && CRUD !== 'D' && (
            <div className="role">
              <span>{user.role}</span>
              <Button
                rounded
                size="xs"
                outline
                onClick={() => {
                  onChange(userIndex, 'role', user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN');
                }}
              >
                <i className="fas fa-exchange-alt" />
              </Button>
            </div>
          )}
          {editable.member && (
            <>
              {CRUD === 'D' && (
                <div className="redo-button">
                  <Button
                    rounded
                    size="sm"
                    color="white"
                    onClick={() => {
                      onChange(userIndex, 'CRUD', 'U');
                    }}
                  >
                    <i className="fas fa-retweet" />
                  </Button>
                </div>
              )}
              {CRUD !== 'D' && (
                <div className="remove-button">
                  <ExitButton
                    size="xxs"
                    color="black"
                    className="remove-image-button"
                    onClick={() => {
                      onChange(userIndex, 'CRUD', 'D');
                    }}
                  />
                </div>
              )}
            </>
          )}
          <div className="user-image">
            <UserImage border rounded size="50px" imageType={user.imageType} imageData={user.imageData} />
          </div>
          <div className="user-card-content">
            <div className="alias">
              <span className="alias-text">{user.alias}</span>
              {user.isNameOpened && user.name && <span className="name-text">{user.name}</span>}
            </div>
            <div className="email">{user.email}</div>
          </div>
          {useTags && (
            <div className="tags">
              <div>
                <div className="hashtag">
                  <i className="fas fa-hashtag" />
                </div>
                <div className="tag-list">
                  <div>
                    {tags.map((tag, inx) => {
                      return (
                        <span key={inx}>
                          <span>{tag}</span>
                          {editable.member && (
                            <span
                              className="remove-text"
                              onClick={() => {
                                const next = tags.slice(0);
                                next.splice(inx, 1);
                                onChangeTag(userIndex, next);
                              }}
                            >
                              <i className="fas fa-times" />
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {editable.member && (
                  <div className="add-hash-button">
                    <Button
                      size="xs"
                      outline
                      color="white"
                      onClick={() => {
                        setTagCreatorOpened(true);
                      }}
                    >
                      <i className="fas fa-plus" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {showAdmin && user.role === 'ADMIN' && (
        <div className="admin-info">
          <i className="fas fa-crown" />
        </div>
      )}
      {tagCreatorOpened && (
        <div className="tag-creator">
          <div>
            <div className="tag-creator-text">{t('태그 추가')}</div>
            <div>
              <Input
                type="text"
                size="sm"
                value={tagText}
                onChange={(val) => {
                  setTagText(val);
                }}
                onEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (tagText) {
                    const next = tags.slice(0);
                    next.push(tagText);
                    onChangeTag(userIndex, next);
                    setTagCreatorOpened(false);
                    setTagText('');
                  }
                }}
                minLength={1}
                maxLength={8}
                simple
                outline
              />
            </div>
            <div className="buttons">
              <Button
                size="sm"
                outline
                color="white"
                onClick={(e) => {
                  e.stopPropagation();
                  setTagCreatorOpened(false);
                }}
              >
                {t('취소')}
              </Button>
              <Button
                size="sm"
                outline
                color="white"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tagText) {
                    const next = tags.slice(0);
                    next.push(tagText);
                    onChangeTag(userIndex, next);
                    setTagCreatorOpened(false);
                    setTagText('');
                  }
                }}
              >
                {t('추가')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

UserCard.defaultProps = {
  className: '',
  addCard: false,
  editable: {
    role: true,
    member: true,
  },
  showAdmin: false,
  useTags: false,
};

UserCard.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  onClick: PropTypes.func,
  user: UserPropTypes,
  userIndex: PropTypes.number,
  editable: PropTypes.shape({
    role: PropTypes.bool,
    member: PropTypes.bool,
  }),
  onChange: PropTypes.func,
  addCard: PropTypes.bool,
  showAdmin: PropTypes.bool,
  useTags: PropTypes.bool,
  onChangeTag: PropTypes.func,
};

export default compose(withTranslation())(UserCard);
