const MENU = {
  issues: {
    name: '메뉴1',
    enabled: true,
    subMenuType: 'menu1',
    submenus: [],
  },
  clips: {
    name: '메뉴2',
    enabled: true,
    subMenuType: 'menu2',
    submenus: [],
  },
  hashtags: {
    name: '메뉴3',
    enabled: false,
    submenus: [],
  },
  scraps: {
    name: '메뉴4',
    side: 'right',
    enabled: true,
    needLogin: true,
  },
  manage: {
    name: '메뉴5',
    side: 'right',
    enabled: true,
    adminOnly: true,
    submenus: [
      {
        code: 'submenu1',
        value: '서브 메뉴 1',
        sortOrder: 0,
      },
      {
        code: 'submenu2',
        value: '서브 메뉴 2',
        sortOrder: 1,
      },
    ],
  },
};

export default MENU;
