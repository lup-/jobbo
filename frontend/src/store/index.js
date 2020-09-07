import Vue from 'vue';
import Vuex from "vuex";
import vacancy from "./modules/vacancy";
import user from "./modules/user";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        vacancy,
        user,
    },
    state: {
        appError: false
    },
    actions: {
        resetState({commit}) {
            commit('setUser', false);
            commit('setError', false);
            commit('setVacancies', []);
            commit('setVacancy', false);
            commit('setFilter', false);
        }
    }
});