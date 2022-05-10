import React from 'react';

const MENU = {
  home: {
    icon: <i className="fas fa-home" />,
    name: 'HOME',
    enabled: true,
    side : 'left',
    submenus: [],
  },
  'public-park': {
    icon: <i className="fas fa-tree" />,
    name: '모두의 공원',
    enabled: false,
    side : 'left',
    submenus: [],
  },
  spaces: {
    icon: <i className="fas fa-globe-asia" />,
    name: '스페이스',
    enabled: true,
    side : 'right',
    submenus: [],
  },
  projects: {
    path : '/my',
    icon: <i className="fas fa-archive" />,
    name: '프로젝트',
    enabled: true,
    side : 'left',
    submenus: [],
  },
  sprints: {
    icon: <i className="fas fa-plane" />,
    name: '스프린트',
    enabled: true,
    side : 'left',
    submenus: [],
  },
  meetings: {
    icon: <i className="fas fa-comment-dots" />,
    name: '미팅',
    enabled: true,
    side : 'left',
    submenus: [],
  },
};

export default MENU;
