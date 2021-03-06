import {routerRedux} from 'dva/router';
import {login} from '../service';
import pathToRegexp from 'path-to-regexp';
import $$ from 'cmn-utils';

export default {
    namespace: 'login',
    state: {
        loggedIn: false,
        message: '',
        user: {},
    },

    subscriptions: {
        setup({history, dispatch}) {
            return history.listen(({pathname}) => {
                let match = pathToRegexp('/sign/login').test(pathname);
                if (match) {
                    dispatch({
                        type: 'logout'
                    });
                }
            });
        }
    },

    effects: {
        * login({payload}, {call, put}) {
            const {status, message, data} = yield call(login, payload);
            if (status) {
                $$.setStore('user', data);
                yield put(routerRedux.replace('/'));
            } else {
                yield put({
                    type: 'loginError',
                    payload: {message}
                });
            }
        },
        * logout(_, {put}) {
            yield $$.removeStore('user');
        }
    },

    reducers: {
        loginSuccess(state, {payload}) {
            return {
                ...state,
                loggedIn: true,
                message: '',
                user: payload
            };
        },
        loginError(state, {payload}) {
            return {
                ...state,
                loggedIn: false,
                message: payload.message
            };
        },
    }
};

