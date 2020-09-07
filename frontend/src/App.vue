<template>
    <v-app id="vjobbo">
        <v-navigation-drawer v-model="drawer" app clipped v-if="isAuthorized">
            <v-list dense>
                <v-list-item link @click="$router.push({name: 'profile'})" :disabled="$route.name === 'profile'">
                    <v-list-item-action>
                        <v-icon>mdi-account</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Мои данные</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link @click="$router.push({name: 'newVacancy'})" v-if="isUserAdmin || isUserRecruiter" :disabled="$route.name === 'newVacancy'">
                    <v-list-item-action>
                        <v-icon>mdi-briefcase-plus</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Новая вакансия</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item  @click="$router.push({name: 'listVacancies'})" :disabled="$route.name === 'listVacancies'">
                    <v-list-item-action>
                        <v-icon>mdi-view-dashboard</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Список вакансий</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link @click="$router.push({name: 'newUser'})" v-if="isUserAdmin" :disabled="$route.name === 'newUser'">
                    <v-list-item-action>
                        <v-icon>mdi-account-plus</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Новый пользователь</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item  @click="$router.push({name: 'listUsers'})" v-if="isUserAdmin || isUserRecruiter" :disabled="$route.name === 'listUsers'">
                    <v-list-item-action>
                        <v-icon>mdi-account-group</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Список {{isUserRecruiter ? 'соискателей' : 'пользователей'}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-spacer></v-spacer>
                <v-divider></v-divider>
                <v-list-item  @click="logout">
                    <v-list-item-action>
                        <v-icon>mdi-logout</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Выход</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app clipped-left>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title>Вджоббо</v-toolbar-title>
        </v-app-bar>

        <v-main>
            <router-view v-if="isAuthorized"></router-view>
            <v-container class="fill-height" v-else>
                <v-row align="start" justify="center" width="100%">
                    <v-col>
                        <login></login>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <v-footer app>
        </v-footer>
    </v-app>
</template>

<script>
    import Login from "@/components/Login";
    import userParams from "@/mixins/userParams";

    export default {
        name: "App",
        components: {Login},
        mixins: [userParams],
        data: () => ({
            drawer: null,
        }),
        async created () {
            this.$vuetify.theme.dark = true;
            return this.checkAndLoginSavedUser();
        },
        methods: {
            checkAndLoginSavedUser() {
                return this.$store.dispatch('loginSavedUser');
            },
            logout() {
                return this.$store.dispatch('logout');
            }
        },
        computed: {
            isAuthorized() {
                return this.$store.getters.isLoggedIn;
            }
        }
    }
</script>
