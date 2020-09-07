<template>
    <div>
        <v-card v-if="isPreview" @click.native="gotoUserDetails">
            <v-card-title>
                {{activeUser.fullName}}
                <v-spacer></v-spacer>
                <div v-if="isUserAdmin">
                    <v-chip label outlined>{{roleName}}</v-chip>
                </div>
            </v-card-title>
            <v-card-subtitle v-html="userInfo.join('&nbsp;&bull;&nbsp;')"></v-card-subtitle>
            <v-card-text>
                <v-btn v-if="activeUser.resume"
                        class="mb-2"
                        :download="activeUser.resume.name"
                        :href="activeUser.resume.link"
                >
                    <v-icon>mdi-download</v-icon>
                    {{activeUser.resume.name}}
                </v-btn>
            </v-card-text>

            <v-card-text v-if="isUserRecruiter">
                <v-chip color="success" label outlined v-if="isApplicantAccepted">Отправлено согласие</v-chip>
                <v-chip color="red" label outlined v-if="isApplicantRejected">Отправлен отказ</v-chip>
            </v-card-text>

            <v-card-actions v-if="isUserRecruiter && isApplicantWaiting">
                <v-btn color="red" @click.prevent.stop="declineApplicant" >Отказать</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="green" @click.prevent.stop="acceptApplicant">Принять</v-btn>
            </v-card-actions>
            <v-card-actions v-if="isUserAdmin">
                <v-btn color="red" @click.stop.prevent="deleteUser">Удалить</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="green" @click.stop.prevent="gotoUserEdit">Редактировать</v-btn>
            </v-card-actions>
        </v-card>
        <v-container class="fill-height align-start" v-else>
            <v-row align="start" justify="center">
                <v-card width="100%">
                    <v-card-title>
                        {{activeUser.fullName}}
                        <v-spacer></v-spacer>
                        <div v-if="isUserAdmin">
                            <v-chip label outlined>{{roleName}}</v-chip>
                        </div>
                    </v-card-title>
                    <v-card-subtitle v-html="userInfo.join('&nbsp;&bull;&nbsp;')"></v-card-subtitle>
                    <v-card-text>
                        <v-btn v-if="activeUser.resume"
                                class="mb-2"
                                :download="activeUser.resume.name"
                                :href="activeUser.resume.link"
                        >
                            <v-icon>mdi-download</v-icon>
                            {{activeUser.resume.name}}
                        </v-btn>
                    </v-card-text>
                    <v-card-text v-html="activeUser.about"></v-card-text>
                    <v-card-text v-html="applicationLetter" v-if="isUserRecruiter"></v-card-text>
                    <v-card-actions v-if="isUserRecruiter && isApplicantWaiting">
                        <v-btn color="red" @click.prevent.stop="declineApplicant">Отказать</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="green" @click.prevent.stop="acceptApplicant">Принять</v-btn>
                    </v-card-actions>
                    <v-card-actions v-if="isUserAdmin">
                        <v-btn color="red" @click.stop.prevent="deleteUser">Удалить</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="green" @click.stop.prevent="gotoUserEdit">Редактировать</v-btn>
                        <v-btn @click.stop.prevent="gotoUserList" small>К списку пользователей</v-btn>
                    </v-card-actions>
                </v-card>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    import clone from "lodash.clone";
    import userParams from "@/mixins/userParams";
    import axios from "axios";

    export default {
        name: "ViewUser",
        props: ['isPreview', 'inputUser', 'inputVacancy'],
        mixins: [userParams],
        data() {
            return {
                vacancy: this.inputVacancy || null,
            }
        },
        async mounted() {
            await this.updateLocalUserData();
        },
        watch: {
            inputUser() {
                this.updateLocalUserData();
            },
        },
        methods: {
            async updateLocalUserData() {
                if (this.inputUser) {
                    this.activeUser = clone(this.inputUser);
                }
                else if (this.userId) {
                    await this.loadUser();
                }
            },
            async updateLocalVacancyData() {
                if (this.inputVacancy) {
                    this.vacancy = clone(this.inputVacancy);
                }
                else if (this.vacancyId) {
                    await this.loadVacancy();
                }
            },
            async acceptApplicant() {
                if (!this.vacancy) {
                    return;
                }

                this.$store.dispatch('updateRequestStatus', {request: this.userRequest, isAccepted: true});
            },
            async declineApplicant() {
                if (!this.vacancy) {
                    return;
                }
                this.$store.dispatch('updateRequestStatus', {request: this.userRequest, isAccepted: false});
            },
            async loadVacancy() {
                let response = await axios.get(`/api/vacancy/${this.vacancyId}`, {
                    params: {}
                });

                this.vacancy = response.data.vacancy;
            }
        },
        computed: {
            userId() {
                return this.$route.params.userId;
            },
            vacancyId() {
                return this.$route.params.vacancyId;
            },
            userInfo() {
                const infoFields = ['email', 'phone'];

                let info = infoFields.map(field => {
                        return this.activeUser[field] || false;
                    })
                    .filter(value => value !== false);

                return info;
            },
            roleName() {
                const roles = {
                    'recruiter': 'Работодатель',
                    'moderator': 'Модератор',
                    'admin': 'Администратор',
                    'applicand': 'Соискатель',
                }

                return this.user.role ? roles[this.user.role] || '' : '';
            },
            applicationLetter() {
                return 'Без сопроводительного письма';
            },
            userRequest() {
                if (!this.activeUser) {
                    return false;
                }

                if (!this.activeUser.requests) {
                    return false;
                }

                return this.activeUser.requests[ this.activeUser.requests.length - 1 ];
            },
            userHasRequests() {
                return this.activeUser && this.activeUser.requests && this.activeUser.requests.length > 0;
            },
            currentUserRequest() {
                return this.userHasRequests
                    ? this.activeUser.requests[ this.activeUser.requests.length - 1 ]
                    : false;
            },
            isUserApplied() {
                return Boolean(this.currentUserRequest);
            },
            isApplicantWaiting() {
                return !this.isApplicantAccepted && !this.isApplicantRejected;
            },
            isApplicantAccepted() {
                return this.currentUserRequest && this.currentUserRequest.status === 'accepted';
            },
            isApplicantRejected() {
                return this.currentUserRequest && this.currentUserRequest.status === 'rejected';
            }
        }
    }
</script>

<style scoped>

</style>