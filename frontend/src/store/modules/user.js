import axios from "axios";

export default {
    state: {
        error: false,
        user: false,
        viewUser: false,
        filter: false,
        users: [],
    },
    getters: {
        isLoggedIn(state) {
            return state.user && state.user.id;
        }
    },
    actions: {
        loginSavedUser({commit}) {
            let savedData = localStorage.getItem('savedUser') || false;
            if (savedData) {
                let user = JSON.parse(savedData);
                commit('setUser', user);
            }
        },
        async loginNewUser({commit}, {email, password}) {
            let response = await axios.post(`/api/user/login`, {email, password});
            if (response.data.error) {
                commit('setError', response.data.error);
            }
            else {
                commit('setError', false);
                commit('setUser', response.data.user);
            }
        },
        async registerUser({commit}, user) {
            let response = await axios.post(`/api/user/register`, user);
            if (response.data.error) {
                commit('setError', response.data.error);
            }
            else {
                commit('setError', false);
                commit('setUser', response.data.user);
            }
        },
        logout({dispatch}) {
            dispatch('resetState');
        },

        async loadUser({commit, rootState}, userId) {
            let forUser = rootState.user.user;
            let response = await axios.post(`/api/user/${userId}`, {forUser});

            return commit('setViewUser', response.data.user);
        },
        async loadUsers({commit, rootState}, filter) {
            let forUser = rootState.user.user;
            //commit('setUsers', []);
            commit('setUserFilter', filter);
            let response = await axios.post(`/api/user/list`, {filter, forUser});
            return commit('setUsers', response.data.users);
        },
        async reloadUsers({dispatch, state}) {
            if (state.users) {
                await dispatch('loadUsers', state.filter);
            }

            if (state.viewUser) {
                await dispatch('loadUser', state.user.id);
            }
        },
        async saveUser({commit, state, rootState}, user) {
            let emptyUser = !user || (user && Object.keys(user).length === 0);
            if (emptyUser) {
                return;
            }

            let editUser = rootState.user.user;
            let response = await axios.post(`/api/user/update`, {user, editUser});
            if (response.data.user.id === state.user.id) {
                commit('setUser', response.data.user);
            }
            return commit('setViewUser', response.data.user);
        },
        async deleteUser({state, rootState, dispatch}, user) {
            let emptyUser = !user || (user && Object.keys(user).length === 0);
            if (emptyUser) {
                return;
            }

            let editUser = rootState.user.user;
            await axios.post(`/api/user/delete`, {id: user.id, editUser});

            if (state.user.id === user.id) {
                return dispatch('logout');
            }

            return dispatch('reloadUsers');
        },

    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            if (user) {
                localStorage.setItem('savedUser', JSON.stringify(user));
            }
            else {
                localStorage.removeItem('savedUser');
            }
        },
        setViewUser(state, user) {
            state.viewUser = user;
        },
        setUsers(state, users) {
            state.users = users;
        },
        setUserFilter(state, filter) {
            state.filter = filter;
        },
        setError(state, error) {
            state.error = error;
        }
    }
}