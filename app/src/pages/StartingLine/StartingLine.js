import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Input, PageTitle } from '@/components';
import './StartingLine.scss';

const StartingLine = () => {
  const [info, setInfo] = useState({ email: '', password: '' });

  useEffect(() => {
    setInfo('sample');
    console.log(info);
  }, []);

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  return (
    <div className="starting-line-wrapper g-content">
      <PageTitle>페이지 타이틀</PageTitle>
      <div className="starting-line-content g-page-content">
        <Input type="text" value={info.email} onChange={(val) => changeInfo('email', val)} />
        <Input type="password" value={info.password} onChange={(val) => changeInfo('password', val)} />
        <Button size="sm" color="success">
          로그인
        </Button>
        <Link to="/entry">새 계정</Link>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(StartingLine);

StartingLine.propTypes = {
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
