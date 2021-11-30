import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { PageTitle } from '@/components';
import './Sprints.scss';

const Sprints = () => {
  const [info, setInfo] = useState('');

  useEffect(() => {
    setInfo('sample');
    console.log(info);
  }, []);

  return (
    <div className="sprints-wrapper g-content">
      <PageTitle>스프린트</PageTitle>
      <div className="g-page-content">컨텐츠</div>
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
};
