import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, PageTitle } from '@/components';
import './Sprints.scss';
import { HistoryPropTypes } from '@/proptypes';

const Sprints = ({ history }) => {
  return (
    <div className="sprints-wrapper g-content">
      <PageTitle
        control={
          <>
            <Button
              size="xs"
              color="white"
              outline
              onClick={() => {
                history.push('/sprints/new');
              }}
            >
              <i className="fas fa-plus" /> 새 스프린트
            </Button>
          </>
        }
      >
        스프린트
      </PageTitle>
      <div className="g-list-content" />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(Sprints);

Sprints.propTypes = {
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
};
