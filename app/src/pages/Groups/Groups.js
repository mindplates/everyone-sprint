import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PageTitle } from '@/components';
import './Groups.scss';

const Groups = () => {
  return (
    <div className="groups-wrapper g-content">
      <PageTitle>그룹</PageTitle>
      <div className="g-page-content">컨텐츠</div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(Groups);

Groups.propTypes = {
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
