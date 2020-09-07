<template>
    <div>
        <v-card v-if="isPreview" @click.native="gotoVacancyDetails">
            <v-card-title>
                {{vacancy.name}}
                <v-spacer></v-spacer>
                <div v-if="isUserRecruiter || isUserAdmin">
                    <v-chip v-if="vacancy.moderationStatus === 'rejected' && vacancy.status !== 'pending'" label outlined color="red" class="mr-2">Отказ модератора</v-chip>
                    <v-chip v-if="!vacancy.status || vacancy.status === 'draft'" label outlined>Черновик</v-chip>
                    <v-chip v-if="vacancy.status === 'pending'" label outlined color="yellow">На модерации</v-chip>
                    <v-chip v-if="vacancy.status === 'published'" label outlined color="success">Опубликована</v-chip>
                </div>
            </v-card-title>
            <v-card-subtitle v-if="vacancy.salary">{{vacancy.salary}}</v-card-subtitle>
            <v-card-subtitle v-html="vacancyInfo.join('&nbsp;&bull;&nbsp;')"></v-card-subtitle>

            <v-card-text v-if="isUserApplicant">
                <v-chip color="yellow" label outlined v-if="isUserApplied && !isUserRejected && !isUserAccepted">Отклик отправлен</v-chip>
                <v-chip color="success" label outlined v-if="isUserAccepted">Получено согласие</v-chip>
                <v-chip color="red" label outlined v-if="isUserRejected">Получен отказ</v-chip>
            </v-card-text>

            <v-card-text v-if="isUserRecruiter">
                <v-btn color="success" @click.prevent.stop="gotoVacancyUsers" v-if="vacancyHasRequests">Откликов: {{vacancy.requests.length}}</v-btn>
            </v-card-text>

            <v-card-text v-if="vacancy.moderationStatus === 'rejected' && vacancy.status !== 'pending' && (isUserRecruiter || isUserAdmin)">
                <v-alert type="error">Комментарий модератора: {{vacancy.moderationComment}}</v-alert>
            </v-card-text>

            <v-card-actions v-if="showApplicantButtons">
                <v-btn color="success" :loading="isLoading" @click.prevent.stop="applyToVacancy" :disabled="isUserApplied">Откликнуться</v-btn>
            </v-card-actions>
            <v-card-actions v-if="showModerateButtons">
                <v-btn color="red" @click.prevent.stop="rejectModeration">Отклонить</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="green" @click.prevent.stop="acceptModeration">Принять</v-btn>
            </v-card-actions>
            <v-card-actions v-if="showEditButtons">
                <v-btn color="red" @click.prevent.stop="deleteVacancy">Удалить</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="green" @click.prevent.stop="gotoVacancyEdit" :loading="isLoading && !showSubmitButton" v-if="showEditButton">
                    <v-icon v-if="showSubmitButton">mdi-pencil-outline</v-icon>
                    <span v-else>Редактировать</span>
                </v-btn>
                <v-btn color="green" @click.prevent.stop="submitVacancy" v-if="showSubmitButton" :loading="isLoading">Опубликовать</v-btn>
            </v-card-actions>
        </v-card>
        <v-container class="fill-height align-start" v-else>
            <v-row align="start" justify="center">
                <v-card width="100%">
                    <v-card-title>
                        {{vacancy.name}}
                        <v-spacer></v-spacer>
                        <div v-if="isUserRecruiter || isUserAdmin">
                            <v-chip v-if="vacancy.moderationStatus === 'rejected' && vacancy.status !== 'pending'" label outlined color="red" class="mr-2">Отказ модератора</v-chip>
                            <v-chip v-if="!vacancy.status || vacancy.status === 'draft'" label outlined>Черновик</v-chip>
                            <v-chip v-if="vacancy.status === 'pending'" label outlined color="yellow">На модерации</v-chip>
                            <v-chip v-if="vacancy.status === 'published'" label outlined color="success">Опубликована</v-chip>
                        </div>
                    </v-card-title>
                    <v-card-subtitle v-if="vacancy.salary">{{vacancy.salary}}</v-card-subtitle>
                    <v-card-subtitle v-html="vacancyInfo.join('&nbsp;&bull;&nbsp;')"></v-card-subtitle>

                    <v-card-text>{{vacancy.text}}</v-card-text>
                    <v-card-text v-if="vacancy.skills">
                        <v-chip label class="mr-2" v-for="skill in vacancy.skills" :key="skill">{{skill}}</v-chip>
                    </v-card-text>

                    <v-card-text v-if="isUserApplicant">
                        <v-chip color="yellow" label outlined v-if="isUserApplied && !isUserRejected && !isUserAccepted">Отклик отправлен</v-chip>
                        <v-chip color="success" label outlined v-if="isUserAccepted">Получено согласие</v-chip>
                        <v-chip color="red" label outlined v-if="isUserRejected">Получен отказ</v-chip>
                    </v-card-text>

                    <v-card-text v-if="isUserRecruiter">
                        <v-btn color="success" @click.prevent.stop="gotoVacancyUsers" v-if="vacancyHasRequests">Откликов: {{vacancy.requests.length}}</v-btn>
                    </v-card-text>

                    <v-card-text v-if="vacancy.moderationStatus === 'rejected' && vacancy.status !== 'pending' && (isUserRecruiter || isUserAdmin)">
                        <v-alert type="error">Комментарий модератора: {{vacancy.moderationComment}}</v-alert>
                    </v-card-text>

                    <v-card-actions v-if="showApplicantButtons">
                        <v-btn color="success" :loading="isLoading" @click.stop.prevent="applyToVacancy" :disabled="isUserApplied">Откликнуться</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click.stop.prevent="gotoVacancyList" small>К списку вакансий</v-btn>
                    </v-card-actions>
                    <v-card-actions v-if="showModerateButtons">
                        <v-btn color="red" @click.stop.prevent="rejectModeration">Отклонить</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="green" @click.stop.prevent="acceptModeration">Опубликовать</v-btn>
                    </v-card-actions>
                    <v-card-actions v-if="showEditButtons">
                        <v-btn color="red" @click.stop.prevent="deleteVacancy">Удалить</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="green" @click.stop.prevent="gotoVacancyEdit" v-if="showEditButton">Редактировать</v-btn>
                        <v-btn @click.stop.prevent="gotoVacancyList" small>К списку вакансий</v-btn>
                    </v-card-actions>
                </v-card>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    import vacancyParams from "@/mixins/vacancyParams";
    import userParams from "@/mixins/userParams";
    import clone from "lodash.clone";

    export default {
        name: "ViewVacancy",
        props: ['isPreview', 'inputVacancy'],
        mixins: [vacancyParams, userParams],
        data() {
            return {
            }
        },
        async mounted() {
            await this.updateLocalVacancyData();
        },
        watch: {
            inputVacancy() {
                this.updateLocalVacancyData();
            }
        },
        methods: {
            async updateLocalVacancyData() {
                if (this.inputVacancy) {
                    this.vacancy = clone(this.inputVacancy);
                }
                else if (this.vacancyId) {
                    await this.loadVacancy();
                }
            },
            applyToVacancy() {
                this.$store.dispatch('applyToVacancy', this.vacancy);
            },
            updateVacancyState() {
                if (this.isStandalone) {
                    this.vacancy = this.$store.state.vacancy.vacancy;
                    this.savedVacancy = clone(this.vacancy);
                }
            },
        },
        computed: {
            vacancyId() {
                return this.$route.params.vacancyId;
            },
            isStandalone() {
                return !this.inputVacancy;
            },
            vacancyInfo() {
                const infoFields = ['city', 'company', 'testPeriod', 'remote'];
                const titles = {'testPeriod': 'Испытательный срок', 'remote': 'Удаленка'};

                let info = infoFields.map(field => {
                        if (typeof (this.vacancy[field]) === 'boolean' ) {
                            return this.vacancy[field] ? titles[field] : false;
                        }
                        else {
                            return this.vacancy[field] || false;
                        }
                    })
                    .filter(value => value !== false);

                return info;
            },
            showEditButtons() {
                return this.isUserRecruiter || this.isUserAdmin;
            },
            showModerateButtons() {
                return (this.isUserModerator || this.isUserAdmin) && this.vacancy.status === 'pending';
            },
            showApplicantButtons() {
                return this.isUserApplicant;
            },
            showSubmitButton() {
                return this.showEditButtons && (!this.vacancy.status || this.vacancy.status === 'draft');
            },
            showEditButton() {
                return this.showEditButtons && !(this.vacancy.status === 'published' && this.vacancyHasRequests);
            },
            vacancyHasRequests() {
                return this.vacancy && this.vacancy.requests && this.vacancy.requests.length > 0;
            },
            currentVacancyRequest() {
                return this.vacancyHasRequests
                    ? this.vacancy.requests[ this.vacancy.requests.length - 1 ]
                    : false;
            },
            isUserApplied() {
                return Boolean(this.currentVacancyRequest);
            },
            isUserAccepted() {
                return this.currentVacancyRequest && this.currentVacancyRequest.status === 'accepted';
            },
            isUserRejected() {
                return this.currentVacancyRequest && this.currentVacancyRequest.status === 'rejected';
            }
        }
    }
</script>

<style scoped>

</style>