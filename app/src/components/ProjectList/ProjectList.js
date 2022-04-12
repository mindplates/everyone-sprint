import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button } from '@/components';
import { HistoryPropTypes, ProjectPropTypes } from '@/proptypes';
import withLoader from '@/components/Common/withLoader';
import commonUtil from '@/utils/commonUtil';
import './ProjectList.scss';

const ProjectList = (props) => {
  const { className, t, history, projects } = props;
  return (
    <ul className={`project-list-wrapper ${className}`}>
      {projects.map((project) => {
        return (
          <li
            key={project.id}
            onClick={() => {
              history.push();
              commonUtil.move(`/projects/${project.id}`);
            }}
          >
            <div>
              <div className="name">
                <div className="text">{project.name}</div>
                {project.isAdmin && (
                  <div className="controls">
                    <Button
                      size="sm"
                      color="white"
                      outline
                      rounded
                      data-tip={t('')}
                      onClick={(e) => {
                        e.stopPropagation();
                        commonUtil.move(`/projects/${project.id}/edit`);
                      }}
                    >
                      <i className="fas fa-cog" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="status">
                {project.activated ? <span className="activated">ACTIVATED</span> : <span className="deactivated">DEACTIVATED</span>}
              </div>
              <div className="counts">
                <div>
                  <div>
                    <div className="label">SPRINT</div>
                    <div className="value">{project.activatedSprintCount}</div>
                  </div>
                </div>
                <div>
                  <div>
                    <div className="label">USER</div>
                    <div className="value">{project.users.length}</div>
                  </div>
                </div>
              </div>
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

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(withLoader(ProjectList, 'projects'));

ProjectList.defaultProps = {
  className: '',
};

ProjectList.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  projects: PropTypes.arrayOf(ProjectPropTypes),
  history: HistoryPropTypes,
};
