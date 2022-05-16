import React from 'react';
import PropTypes from 'prop-types';
import { SpacePropTypes } from '@/proptypes';
import './SpaceCard.scss';

import { Button } from '@/components';

const SpaceCard = ({ className, space, description, onCardClick, onConfigClick }) => {
  return (
    <div
      className={`space-card-wrapper ${className} ${onCardClick ? 'g-cursor-pointer hover' : ''}`}
      onClick={() => {
        if (onCardClick) {
          onCardClick();
        }
      }}
    >
      <div className="space-name-code">
        {onConfigClick && space.isAdmin && (
          <div className="config-button">
            <Button
              size="sm"
              outline
              rounded
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick();
              }}
            >
              <i className="fas fa-cog" />
            </Button>
          </div>
        )}
        <div className="space-label">
          <span>SPACE</span>
        </div>
        <div className="name">{space.name}</div>
        <div className="code">{space.code}</div>
      </div>
      <div className={`user-info ${description ? 'mb-0' : ''}`}>
        <div className="icon">
          <i className="fas fa-medal" />
        </div>
        <div className="tags">
          {space.isAdmin && <div className="is-admin">{space.isAdmin ? 'ADMIN' : ''}</div>}
          {space.isMember && <div className="is-member">{space.isMember ? 'MEMBER' : ''}</div>}
          {!space.isMember && !space.isAdmin && <div className="is-no-auth">NOT AUTHORIZED</div>}
        </div>
      </div>
      <div className="activated">{space.activated ? '' : 'DISABLED'}</div>
      {description && (
        <div className="description">
          <div>{space.description}</div>
        </div>
      )}
    </div>
  );
};

export default SpaceCard;

SpaceCard.defaultProps = {
  className: '',
  description: true,
};

SpaceCard.propTypes = {
  className: PropTypes.string,
  space: SpacePropTypes,
  description: PropTypes.bool,
  onCardClick: PropTypes.func,
  onConfigClick: PropTypes.func,
};
