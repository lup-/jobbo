<template>
    <v-container class="fill-height" :class="{'align-start': !isEmpty && !isLoading}">
        <v-row :align="isEmpty || isLoading ? 'center' : 'start'" justify="center">
            <v-progress-circular v-if="isLoading"
                    :size="70"
                    :width="7"
                    indeterminate
            ></v-progress-circular>

            <v-col cols="12" class="text-center" v-if="isEmpty">{{isUserAdmin ? 'Пользователей' : 'Соискателей'}} не найдено</v-col>
            <v-col cols="12" md="6" lg="4" v-for="user in users" :key="'user'+user.id+user.lastUpdated">
                <view-user :is-preview="true" :input-user="user" :input-vacancy="vacancy"></view-user>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import userParams from "@/mixins/userParams";
    import vacancyParams from "@/mixins/vacancyParams";
    import ViewUser from "@/components/ViewUser";

    export default {
        name: "ListUsers",
        mixins: [userParams, vacancyParams],
        components: {ViewUser},
        data() {
            return {
                isLoading: false,
            }
        },
        watch: {
            vacancyId() {
                this.reloadListData();
            },
        },
        async mounted() {
            this.reloadListData();
        },
        methods: {
            async reloadListData() {
                if (this.isUserRecruiter) {
                    if (this.vacancyId) {
                        await this.loadVacancy();
                        await this.loadVacancyApplicants();
                    }
                    else {
                        await this.loadRecruiterApplicants();
                    }
                }

                if (this.isUserAdmin) {
                    await this.loadAllUsers();
                }
            },
            async loadRecruiterApplicants() {
                this.isLoading = true;
                await this.$store.dispatch('loadUsers', {});
                this.isLoading = false;
            },
            async loadVacancyApplicants() {
                this.isLoading = true;
                await this.$store.dispatch('loadUsers', {vacancyId: this.vacancyId});
                this.isLoading = false;
            },
            async loadAllUsers() {
                this.isLoading = true;
                await this.$store.dispatch('loadUsers', {});
                this.isLoading = false;
            }
        },

        computed: {
            vacancyId () {
                return this.$route.params.vacancyId || false;
            },
            users() {
                return this.$store.state.user.users;
            },
            isEmpty() {
                return this.users.length === 0 && this.isLoading === false;
            }
        }
    }
</script>

<style scoped>

</style>