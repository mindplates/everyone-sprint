import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { HistoryPropTypes, SpacePropTypes, UserPropTypes } from '@/proptypes';
import { Button, Liner, ProductLogo, Selector } from '@/components';
import Spinner from '@/components/Spinner/Spinner';
import './withSpace.scss';
import { CONFERENCE_URL_PATTERN } from '@/constants/constants';
import { setSpaceInfo } from '@/store/actions';

const withLogin = (WrappedComponent, skipDelay) => {
  class NeedSpace extends React.Component {
    timer = null;

    constructor(props) {
      super(props);
      this.state = {
        delayed: skipDelay === undefined ? false : skipDelay,
        spaceCode: '',
      };
    }

    componentDidMount() {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        this.setState({
          delayed: true,
        });
      }, 10);
    }

    componentWillUnmount() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    }

    render() {
      const { space, user, t, history } = this.props;
      const { delayed, spaceCode } = this.state;
      const { setSpaceInfo: setSpaceInfoReducer } = this.props;

      if (delayed && space && space.id) {
        return <WrappedComponent {...this.props} />;
      }

      const isConference = CONFERENCE_URL_PATTERN.test(history.location.pathname);
      const hasSpace = user?.spaces?.length > 0;

      return (
        <div className={`with-space-wrapper ${isConference ? 'black' : ''}`}>
          {!delayed && (
            <div>
              <Spinner color="primary" />
            </div>
          )}
          {delayed && !(space && space.id) && (
            <div>
              <div className="logo">
                <ProductLogo className="bg-transparent d-inline-block" name={false} width="auto" />
              </div>
              {hasSpace && (
                <div>
                  <div className="message">{t('스페이스가 선택되지 않았습니다.')}</div>
                  <div className="space-selector">
                    <Selector
                      className="selector"
                      outline
                      size="md"
                      items={[
                        {
                          key: '',
                          value: t('스페이스를 선택해주세요'),
                        },
                      ].concat(
                        user.spaces.map((d) => {
                          return {
                            key: d.code,
                            value: d.name,
                          };
                        }),
                      )}
                      value={spaceCode}
                      onChange={(val) => {
                        if (val) {
                          setSpaceInfoReducer((user.spaces || []).find((d) => d.code === val));
                        }
                      }}
                    />
                  </div>
                  <div className="liner">
                    <Liner width="100%" height="1px" color="light" margin="2rem 0" />
                  </div>
                  <div className="message">{t('또는 스페이스를 만들거나, 다른 스페이스를 검색해서 참여해보세요.')}</div>
                  <div className="search-space">
                    <Button
                      size="sm"
                      color="white"
                      outline
                      onClick={() => {
                        history.push('/spaces');
                      }}
                    >
                      <i className="fas fa-search" /> 스페이스 검색
                    </Button>
                  </div>
                  <div className="new-space">
                    <Link to="/spaces/new">
                      <i className="fas fa-plus" /> {t('새로운 스페이스')}
                    </Link>
                  </div>
                </div>
              )}
              {!hasSpace && (
                <div>
                  <div className="message">{t('참여중인 스페이스가 없습니다.')}</div>
                  <div className="message">{t('스페이스를 만들거나, 혹은 스페이스를 검색해서 참여해보세요.')}</div>
                  <div className="search-space">
                    <Button
                      size="sm"
                      color="white"
                      outline
                      onClick={() => {
                        history.push('/spaces');
                      }}
                    >
                      <i className="fas fa-search" /> 스페이스 검색
                    </Button>
                  </div>
                  <div className="new-space">
                    <Link to="/spaces/new">
                      <i className="fas fa-plus" /> {t('새로운 스페이스')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  }

  NeedSpace.propTypes = {
    space: SpacePropTypes,
    user: UserPropTypes,
    t: PropTypes.func,
    history: HistoryPropTypes,
    setSpaceInfo: PropTypes.func,
  };

  const mapStateToProps = (state) => {
    return {
      space: state.space,
      user: state.user,
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return {
      setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
    };
  };

  return compose(withTranslation(), connect(mapStateToProps, mapDispatchToProps))(withRouter(NeedSpace));
};

export default withLogin;
