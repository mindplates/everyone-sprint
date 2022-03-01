import store from '@/store';

function checkUserLogin(history) {
  const state = store.getState();
  if (!(state.user && state.user.id)) {
    console.log(window.location);
    const { pathname } = window.location;
    history.push(`/login?url=${pathname || '/'}`);
  }
}

const auth = {
  checkUserLogin,
};

export default auth;
