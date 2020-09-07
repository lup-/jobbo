import clone from "lodash.clone";

export default {
    data() {
        return {
            isSaving: false,
            isLoading: false,
            savedVacancy: {},
            vacancy: {},
        }
    },
    methods: {
        gotoVacancyList() {
            this.$router.push({name: 'listVacancies'});
        },
        gotoVacancyDetails() {
            this.$router.push({name: 'viewVacancy', params: {vacancyId: this.vacancy.id}});
        },
        gotoVacancyEdit() {
            this.$router.push({name: 'editVacancy', params: {vacancyId: this.vacancy.id}});
        },
        gotoVacancyUsers() {
            this.$router.push({name: 'viewVacancyUsers', params: {vacancyId: this.vacancy.id}});
        },
        resetVacancy() {
            if (this.isNew) {
                this.vacancy = {};
            }
            else {
                this.vacancy = clone(this.savedVacancy);
            }
        },
        async saveVacancy() {
            this.isSaving = true;
            await this.$store.dispatch('saveVacancy', this.vacancy);
            this.updateVacancyState();
            this.isSaving = false;
            if (this.isNew) {
                let vacancyId = this.$store.state.vacancy.vacancy.id;
                this.$router.push({name: 'editVacancy', params: {vacancyId}});
            }
        },
        updateVacancyState() {
            this.vacancy = this.$store.state.vacancy.vacancy;
            this.savedVacancy = clone(this.vacancy);
        },
        async loadVacancy() {
            if (!this.vacancyId) {
                return;
            }
            this.isLoading = true;
            await this.$store.dispatch('loadVacancy', this.vacancyId);
            this.isLoading = false;
            this.updateVacancyState();
        },
        async submitVacancy() {
            this.isLoading = true;
            await this.$store.dispatch('submitVacancy', this.vacancy);
            this.isLoading = false;
            this.updateVacancyState();
        },
        async acceptModeration() {
            this.isLoading = true;
            await this.$store.dispatch('moderateVacancy', {
                vacancy: this.vacancy,
                isAccepted: true,
                comment: false,
            })
            this.isLoading = false;

            this.updateVacancyState();
        },
        async rejectModeration() {
            let reason = "Нужно исправить текст";
            this.isLoading = true;
            await this.$store.dispatch('moderateVacancy', {
                vacancy: this.vacancy,
                isAccepted: false,
                comment: reason,
            })
            this.isLoading = false;

            this.updateVacancyState();
        },
        async deleteVacancy() {
            this.isLoading = true;
            await this.$store.dispatch('deleteVacancy', this.vacancy);
            this.isLoading = false;
            this.updateVacancyState();
        }

    },

}