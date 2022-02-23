import React from 'react';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import Spinner from '@/components/Spinner/Spinner';
import './withLoader.scss';

const withLoader = (WrappedComponent, name, delay = 500) => {
  class NeedLogin extends React.Component {
    timer = null;

    constructor(props) {
      super(props);
      this.state = {
        delayed: false,
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
      }, delay);
    }

    componentWillUnmount() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    }

    render() {
      const { delayed } = this.state;
      // eslint-disable-next-line react/destructuring-assignment
      const loaded = !!this.props[name];

      if (delayed && loaded) {
        return <WrappedComponent {...this.props} />;
      }

      return (
        <div className="with-loader-wrapper">
          <div>
            <Spinner color="point" type="bar" />
          </div>
        </div>
      );
    }
  }

  return compose(withTranslation())(NeedLogin);
};

export default withLoader;
