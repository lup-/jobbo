<template>
    <v-container class="fill-height" :class="{'align-start': !isEmpty && !isLoading}">
        <v-row :align="isEmpty || isLoading ? 'center' : 'start'" justify="center">
            <v-progress-circular v-if="isLoading"
                :size="70"
                :width="7"
                indeterminate
            ></v-progress-circular>

            <v-col cols="12" class="text-center" v-if="isEmpty">Вакансий не найдено</v-col>
            <v-col cols="12" md="6" lg="4" v-for="vacancy in vacancies" :key="'vacancy'+vacancy.id+vacancy.lastUpdated">
                <view-vacancy :is-preview="true" :input-vacancy="vacancy"></view-vacancy>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import ViewVacancy from "@/components/ViewVacancy";
    import userParams from "@/mixins/userParams";

    export default {
        name: "ListVacancies",
        components: {ViewVacancy},
        mixins: [userParams],
        data() {
            return {
                isLoading: false,
            }
        },
        async mounted() {
            if (this.isUserRecruiter) {
                await this.loadRecruiterVacancies();
            }

            if (this.isUserApplicant) {
                await this.loadApplicantVacancies();
            }

            if (this.isUserModerator) {
                await this.loadModeratorVacancies();
            }

            if (this.isUserAdmin) {
                await this.loadAllVacancies();
            }
        },
        methods: {
            async loadRecruiterVacancies() {
                let recruiterId = this.user.id;
                this.isLoading = true;
                await this.$store.dispatch('loadVacancies', {recruiterId});
                this.isLoading = false;
            },
            async loadApplicantVacancies() {
                let status = 'published';
                this.isLoading = true;
                await this.$store.dispatch('loadVacancies', {status});
                this.isLoading = false;
            },
            async loadModeratorVacancies() {
                let status = 'pending';
                this.isLoading = true;
                await this.$store.dispatch('loadVacancies', {status});
                this.isLoading = false;
            },
            async loadAllVacancies() {
                this.isLoading = true;
                await this.$store.dispatch('loadVacancies', {});
                this.isLoading = false;
            }
        },
        computed: {
            vacancies() {
                return this.$store.state.vacancy.vacancies;
            },
            isEmpty() {
                return this.vacancies.length === 0 && this.isLoading === false;
            }
        }
    }
</script>

<style scoped>

</style>