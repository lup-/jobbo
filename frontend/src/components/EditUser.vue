<template>
    <v-container class="fill-height align-start">
        <v-row align="start" justify="center" width="100%">
            <v-col>
                <v-card>
                    <v-card-title>{{isNew ? 'Новый пользователь' : 'Редактирование профиля'}}</v-card-title>
                    <v-card-text>
                        <v-form autocomplete="off">
                            <v-select
                                    v-if="isUserAdmin"
                                    v-model="activeUser.role"
                                    :items="roles"
                                    label="Роль пользователя"
                            ></v-select>
                            <v-text-field v-model="activeUser.fullName" label="ФИО"></v-text-field>
                            <v-text-field v-model="activeUser.email" label="Почта" autocomplete="new-password"></v-text-field>

                            <v-text-field
                                    v-if="isUserAdmin"
                                    v-model="activeUser.password"
                                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="showPassword ? 'text' : 'password'"
                                    label="Пароль"
                                    counter
                                    name="password"
                                    autocomplete="new-password"
                                    @click:append="showPassword = !showPassword"
                            ></v-text-field>

                            <v-text-field v-model="activeUser.phone" label="Телефон"></v-text-field>
                            <div><v-label>Резюме</v-label></div>
                            <v-btn v-if="activeUser.resume"
                                class="mb-2"
                                :download="activeUser.resume.name"
                                :href="activeUser.resume.link"
                            >
                                <v-icon>mdi-download</v-icon>
                                {{activeUser.resume.name}}
                            </v-btn>
                            <v-file-input v-model="resume" label="Прикрепить новый файл"></v-file-input>
                            <v-textarea v-model="activeUser.text" label="Обо мне"></v-textarea>
                            <v-combobox
                                    v-model="activeUser.skills"
                                    deletable-chips
                                    chips
                                    label="Ключевые навыки"
                                    persistent-hint
                                    hint="Enter для разделения навыков. Используются для поиска и распознования в резюме"
                                    multiple
                            ></v-combobox>
                            <v-switch v-model="activeUser.readyToMove" label="Готовность к релокации"></v-switch>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn text small @click="resetUser">Сбросить</v-btn>
                        <v-btn color="success" :loading="isSaving" @click="saveUser">Сохранить</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click="gotoUserList" v-if="isUserAdmin">К списку пользователей</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

</template>

<script>
    import userParams from "@/mixins/userParams";

    export default {
        name: "EditUser",
        mixins: [userParams],
        data() {
            return {
                showPassword: false,
                isSaving: false,
                roles: [
                    {text: 'Соискатель', value: 'applicant'},
                    {text: 'Работодатель', value: 'recruiter'},
                    {text: 'Модератор', value: 'moderator'},
                    {text: 'Администратор', value: 'admin'},
                ],
            }
        },
        async mounted() {
            if (this.userId) {
                await this.loadUser();
            }
        },
        watch: {
            async userId() {
                if (this.userId) {
                    await this.loadUser();
                }
                else {
                    this.activeUser = {};
                    this.savedUser = {};
                }
            }
        },
        methods: {
        },
        computed: {
            userId() {
                if (this.$route.name === 'profile') {
                    return this.user.id || false;
                }

                return this.$route.params.userId || false;
            },
            isNew() {
                return !this.userId;
            },
            isNewUser() {
                return !this.userId;
            }
        }
    }
</script>

<style scoped>

</style>