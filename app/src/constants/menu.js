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
  meetings: {
    icon: <i className="fas fa-circle-notch" />,
    name: '미팅',
    enabled: true,
    submenus: [],
  },
};

export default MENU;
