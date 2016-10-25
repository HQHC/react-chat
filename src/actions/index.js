import { CHANGE_USER, CHANGE_TARGET, INIT_USERS, ADD_USER, REMOVE_USER,
    INIT_GROUPS, ADD_GROUP, ADD_GROUP_MSG, ADD_USER_MSG, ADD_SELF_MSG, CHANGE_WARNING,
    CHANGE_MODAL, TOGGLE_RECEIVE, TOGGLE_SOUND, TOGGLE_NOTICE, TOGGLE_SCREEN }
    from '../constants/actionTypes';
import { browserHistory } from 'react-router';
import fetch from 'isomorphic-fetch';
import io from 'socket.io-client';


export const socket = io();


/**
* actionCreator生成辅助函数
**/
function makeActionCreator(type, ...argNames) {
    return (...args) => {
        const action = { type };
        argNames.forEach((arg, index) => {
            action[argNames[index]] = args[index];
        });
        return action;
    };
}

export const changeUser = makeActionCreator(CHANGE_USER, 'user');  // 改变用户
export const changeTarget = makeActionCreator(CHANGE_TARGET, 'target');  // 改变消息对象
export const initUsers = makeActionCreator(INIT_USERS, 'users');  // 初始化用户列表
export const addUser = makeActionCreator(ADD_USER, 'user');  // 添加用户
export const removeUser = makeActionCreator(REMOVE_USER, 'username');  // 删除用户
export const initGroups = makeActionCreator(INIT_GROUPS, 'groups');  // 初始化群组列表
export const addGroup = makeActionCreator(ADD_GROUP, 'group');  // 添加群组
export const addGroupMsg = makeActionCreator(ADD_GROUP_MSG, 'msg');  // 添加群组消息
export const addUserMsg = makeActionCreator(ADD_USER_MSG, 'msg');  // 添加用户消息
export const addSelfMsg = makeActionCreator(ADD_SELF_MSG, 'msg');  // 添加本人消息
export const changeWarning = makeActionCreator(CHANGE_WARNING, 'warning');  // 改变警告
export const changeModal = makeActionCreator(CHANGE_MODAL, 'modal');  // 改变模态框
export const toggleReceive = makeActionCreator(TOGGLE_RECEIVE);  // 切换接收私聊
export const toggleSound = makeActionCreator(TOGGLE_SOUND);  // 切换声音提醒
export const toggleNotice = makeActionCreator(TOGGLE_NOTICE);  // 切换桌面提醒
export const toggleScreen = makeActionCreator(TOGGLE_SCREEN);  // 切换全屏显示


/**
* 异步action
**/

// 用户登录
export function signin(newUser, keep) {
    return dispatch => {
        return fetch('/signin', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucess) {
                const user = data.user;
                if (keep) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                dispatch(changeWarning(''));
                dispatch(changeUser(user));
                browserHistory.push('/');
            } else {
                dispatch(changeUser(null));
                dispatch(changeWarning(data.msg));
            }
        })
        .catch(e => console.log('Oops, signin error', e));
    };
}

// 用户注册
export function signup(newUser, keep) {
    return dispatch => {
        return fetch('/user', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucess) {
                const user = data.user;
                if (keep) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                dispatch(changeWarning(''));
                dispatch(changeUser(user));
                browserHistory.push('/');
            } else {
                dispatch(changeUser(null));
                dispatch(changeWarning(data.msg));
            }
        })
        .catch(e => console.log('Oops, signup error', e));
    };
}

// 用户退出
export function signout() {
    return dispatch => {
        localStorage.setItem('user', JSON.stringify(null));
        dispatch(changeUser(null));
        socket.emit('offline');
        browserHistory.push('/sign');
    };
}

// 修改用户资料
export function updateUser(newUser) {
    return dispatch => {
        return fetch('/user', {
            method: 'put',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucess) {
                dispatch(changeUser(data.user));
                dispatch(changeModal(0));
            }
        })
        .catch(e => console.log('Oops, updateUser error', e));
    };
}

// 获取在线用户列表
export function fetchUsers() {
    return dispatch => {
        return fetch('/users')
        .then(response => response.json())
        .then(data => dispatch(initUsers(data)))
        .catch(e => console.log('Oops, fetchUsers error', e));
    };
}

// 获取群组列表
export function fetchGroups() {
    return dispatch => {
        return fetch('/groups')
        .then(response => response.json())
        .then(data => dispatch(initGroups(data)))
        .catch(e => console.log('Oops, fetchGroups error', e));
    };
}

// 新建群组
export function createGroup(newGroup) {
    return (dispatch, getState) => {
        if (getState().get('groups').findIndex(y => y.get('name') === newGroup.name) !== -1) {
            return dispatch(changeWarning('该群组已存在'));
        }
        return fetch('/group', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newGroup)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const group = data.group;
                dispatch(changeWarning(''));
                dispatch(addGroup(group));
                dispatch(changeModal(0));
                socket.emit('new group', group);
            } else {
                dispatch(changeWarning(data.msg));
            }
        })
        .catch(e => console.log('Oops, createGroups error', e));
    };
}

// 加入群组
export function joinGroup(name) {
    return (dispatch, getState) => {
        const target = getState().get('target');
        if (!target.get('private')) {
            socket.emit('leave group', {
                name: target.get('name')
            });
        }
        socket.emit('join group', { name });
        changeTarget({ private: false, name });
    };
}

// 对用户私聊
export function privateChat(name) {
    return (dispatch, getState) => {
        const target = getState().get('target');
        if (!target.get('private')) {
            socket.emit('leave group', {
                name: target.get('name')
            });
        }
        changeTarget({ private: true, name });
    };
}

// 发送信息
export function sendMsg(msg) {
    return (dispatch, getState) => {
        const sender = getState().get('user').toJS();
        const target = getState().get('target').toJS();
        if (target.private) {
            addGroupMsg({
                target: target.name,
                sender: sender.username,
                type: msg.type,
                text: msg.text,
                time: msg.time
            });
        } else {
            addSelfMsg({
                target: target.name,
                sender: sender.username,
                type: msg.type,
                text: msg.text,
                time: msg.time
            });
        }
        socket.emit('new message', {
            private: target.private,
            target: target.name,
            sender: sender.username,
            avatar: sender.avatar,
            type: msg.type,
            text: msg.text,
            time: msg.time
        });
    };
}
