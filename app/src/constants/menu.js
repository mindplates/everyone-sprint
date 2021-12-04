import React from 'react';

const MENU = {
  'public-park': {
    icon: <i className="fas fa-tree" />,
    name: '모두의 공원',
    enabled: false,
    submenus: [],
  },
  sprints: {
    icon: <i className="fas fa-plane" />,
    name: '스프린트',
    enabled: true,
    submenus: [],
  },
  scrums: {
    icon: <i className="fas fa-circle-notch" />,
    name: '스크럼',
    enabled: true,
    submenus: [],
  },
};

export default MENU;
