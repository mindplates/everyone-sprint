import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs, Button, Liner } from '@/components';
import './PageTitle.scss';

const PageTitle = ({ className, children, control, buttons, tabs, tab, onChangeTab, breadcrumbs, isListPageTitle }) => {
  return (
    <div className={`page-title-wrapper ${className} ${isListPageTitle ? 'is-list-page-title' : ''}`}>
      <div className="bullet">
        <span />
      </div>
      <div className="text">
        <span>{children}</span>
      </div>
      {control && (
        <div className="control">
          <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
          {control}
        </div>
      )}
      {buttons && (
        <div className="control">
          <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
          {buttons.map((button, inx) => {
            return (
              <Button className='mr-3' key={inx} size="md" color="white" outline onClick={button.handler}>
                {button.icon && <span>{button.icon}</span>} {button.text}
              </Button>
            );
          })}
          {control}
        </div>
      )}
      {tabs && (
        <div className="page-title-tab g-no-select">
          <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
          <div className="page-tabs">
            {tabs.map((d) => {
              return (
                <div
                  key={d.key}
                  className={d.key === tab ? 'selected' : ''}
                  onClick={() => {
                    onChangeTab(d.key);
                  }}
                >
                  <div className="line" />
                  <span>{d.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {breadcrumbs && <Breadcrumbs className="flex-grow-1" list={breadcrumbs} />}
    </div>
  );
};

export default PageTitle;

PageTitle.defaultProps = {
  className: '',
};

PageTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  control: PropTypes.node,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      text: PropTypes.string,
      handler: PropTypes.func,
    }),
  ),
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.node,
      value: PropTypes.string,
      handler: PropTypes.func,
    }),
  ),
  tab: PropTypes.string,
  onChangeTab: PropTypes.func,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      link: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  isListPageTitle: PropTypes.bool,
};
