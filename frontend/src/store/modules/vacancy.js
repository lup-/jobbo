import axios from "axios";

export default {
    state: {
        filter: false,
        vacancy: false,
        vacancies: [],
    },
    actions: {
        async loadVacancy({commit, rootState}, vacancyId) {
            let forUser = rootState.user.user;
            let response = await axios.post(`/api/vacancy/${vacancyId}`, {forUser});

            return commit('setVacancy', response.data.vacancy);
        },
        async loadVacancies({commit, rootState}, filter) {
            let forUser = rootState.user.user;
            //commit('setVacancies', []);
            commit('setFilter', filter);
            let response = await axios.post(`/api/vacancy/list`, {filter, forUser});
            return commit('setVacancies', response.data.vacancies);
        },
        async reloadVacancies({dispatch, state}) {
            if (state.vacancies) {
                await dispatch('loadVacancies', state.filter);
            }

            if (state.vacancy) {
                await dispatch('loadVacancy', state.vacancy.id);
            }
        },
        async saveVacancy({commit, rootState}, vacancy) {
            let user = rootState.user.user;
            let response = await axios.post(`/api/vacancy`, {vacancy, user});
            return commit('setVacancy', response.data.vacancy);
        },
        async deleteVacancy({commit, state, rootState, dispatch}, vacancy) {
            let user = rootState.user.user;
            await axios.post(`/api/vacancy/delete`, {id: vacancy.id, user});

            if (state.vacancy.id === vacancy.id) {
                return commit('setVacancy', false);
            }

            return dispatch('reloadVacancies');
        },
        async submitVacancy({rootState, dispatch}, vacancy) {
            let user = rootState.user.user;

            await axios.post(`/api/vacancy/submit`, {
                id: vacancy.id,
                user
            });

            return dispatch('reloadVacancies');
        },
        async moderateVacancy({rootState, dispatch}, {vacancy, isAccepted, comment}) {
            let user = rootState.user.user;

            await axios.post(`/api/vacancy/moderation`, {
                id: vacancy.id,
                status: isAccepted ? 'accepted' : 'rejected',
                comment,
                user
            });

            return dispatch('reloadVacancies');
        },
        async applyToVacancy({rootState, dispatch}, vacancy) {
            let user = rootState.user.user;
            await axios.post(`/api/vacancy/apply`, { vacancy, user });
            await dispatch('reloadUsers');
            return dispatch('reloadVacancies');
        },
        async updateRequestStatus({rootState, dispatch}, {request, isAccepted}) {
            let editUser = rootState.user.user;

            await axios.post(`/api/vacancy/applyStatus`, {
                id: request.id,
                status: isAccepted ? 'accepted' : 'rejected',
                editUser
            });

            await dispatch('reloadUsers');
            return dispatch('reloadVacancies');
        },
        async deleteRequest({rootState, dispatch}, request) {
            let editUser = rootState.user.user;
            await axios.post(`/api/vacancy/deleteRequest`, {id: request.id, editUser});

            await dispatch('reloadUsers');
            return dispatch('reloadVacancies');
        },
    },
    mutations: {
        setFilter(state, filter) {
            state.filter = filter || false;
        },
        setVacancy(state, vacancy) {
            state.vacancy = vacancy || false;
        },
        setVacancies(state, vacancies) {
            state.vacancies = vacancies || [];
        },
    }
}