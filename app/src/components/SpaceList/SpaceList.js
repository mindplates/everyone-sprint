import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button } from '@/components';
import { HistoryPropTypes, ProjectPropTypes } from '@/proptypes';
import withLoader from '@/components/Common/withLoader';
import './SpaceList.scss';

const SpaceList = ({ className, t, history, spaces }) => {
  return (
    <ul className={`project-list-wrapper ${className}`}>
      {spaces.map((space) => {
        const isMember = space.isAdmin || space.isMember;
        return (
          <li
            key={space.code}
            onClick={() => {
              history.push(`/spaces/${space.code}`);
            }}
          >
            <div>
              <div className="name">
                <div className="text">{space.name}</div>
                {space.isAdmin && (
                  <div className="controls">
                    <Button
                      size="sm"
                      color="white"
                      outline
                      rounded
                      data-tip={t('')}
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(`/spaces/${space.code}/edit`);
                      }}
                    >
                      <i className="fas fa-cog" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="description">{space.description}</div>
              <div className="options">
                {space.allowAutoJoin ? <span className="auto-join">{t('누구나 참여')}</span> : <span className="auto-join">{t('승인 후 참가')}</span>}
                {isMember && space.allowSearch && <span className="allow-search">{t('검색 허용')}</span>}
              </div>
              <div className="role">
                {space.isAdmin && <span className="allow-search">ADMIN</span>}
                {!space.isAdmin && space.isMember && <span className="allow-search">MEMBER</span>}
              </div>
              {isMember && (
                <div className="status">
                  {space.activated ? <span className="activated">ACTIVATED</span> : <span className="deactivated">DEACTIVATED</span>}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(withLoader(SpaceList, 'spaces'));

SpaceList.defaultProps = {
  className: '',
};

SpaceList.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  spaces: PropTypes.arrayOf(ProjectPropTypes),
  history: HistoryPropTypes,
};
