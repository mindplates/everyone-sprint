const MENU = {
  issues: {
    name: '이슈',
    enabled: true,
    subMenuType: 'category',
    submenus: [],
  },
  clips: {
    name: '클립',
    enabled: true,
    subMenuType: 'category',
    submenus: [],
  },
  hashtags: {
    name: '해슈태그',
    enabled: false,
    submenus: [],
  },
  scraps: {
    name: 'MY 스크랩',
    side: 'right',
    enabled: true,
    needLogin: true,
  },
  manage: {
    name: '관리',
    side: 'right',
    enabled: true,
    adminOnly: true,
    submenus: [
      {
        code: 'issues',
        value: '삭제된 이슈',
        sortOrder: 0,
      },
      {
        code: 'clips',
        value: '삭제된 클립',
        sortOrder: 1,
      },
    ],
  },
};

export default MENU;
