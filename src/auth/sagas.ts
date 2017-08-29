import Auth0Lock from 'auth0-lock';
import { push } from 'react-router-redux';
import { call, put, take } from 'redux-saga/effects';

import { removeStoredAuthState, setStoredAuthState } from '../utils';

import {
  loginFailure,
  loginSuccess,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
} from './reducer';

interface ShowLock {
  profile: auth0.Auth0UserProfile;
  idToken: string;
}

export function* loginRequestSaga() {
  const lock = new Auth0Lock(
    process.env.AUTH0_CLIENT_ID as string,
    process.env.AUTH0_DOMAIN as string,
    {
      auth: { redirect: false },
      languageDictionary: { title: 'Serverless API' },
    },
  );

  const showLock = () =>
    new Promise<ShowLock>((resolve, reject) => {
      lock.on('hide', () => reject('Lock closed'));

      lock.on('authenticated', (authResult: auth0.Auth0DecodedHash) => {
        lock.getUserInfo(
          authResult.accessToken as string,
          (error: auth0.Auth0Error, profile: auth0.Auth0UserProfile) => {
            if (!error) {
              lock.hide();
              resolve({ profile, idToken: authResult.idToken as string });
            }
          },
        );
      });

      lock.on('unrecoverable_error', (error) => {
        lock.hide();
        reject(error);
      });

      lock.show();
    });

  try {
    const { profile, idToken }: ShowLock = yield call(showLock);

    yield put(loginSuccess(profile, idToken));
    yield put(push('/items'));
  } catch (error) {
    yield put(loginFailure(error));
    yield put(push('/'));
  }
}

export function* watchLoginRequest() {
  while (true) {
    yield take(LOGIN_REQUEST);
    yield call(loginRequestSaga);
  }
}

export function* watchLoginSuccess() {
  while (true) {
    const { profile, idToken }: ShowLock = yield take(LOGIN_SUCCESS);

    setStoredAuthState(profile, idToken);
  }
}

export function* watchLoginFailure() {
  while (true) {
    yield take(LOGIN_FAILURE);

    removeStoredAuthState();
  }
}

export function* watchLogout() {
  while (true) {
    yield take(LOGOUT);

    removeStoredAuthState();

    yield put(push('/'));
  }
}
