<template>
    <v-sheet color="transparent" class="d-flex flex-column align-center">
        <v-card class="mb-4 p-4">
            <v-card-title>{{isRegister ? 'Регистрация' : 'Вход'}}</v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid">
                    <v-text-field
                            v-model="email"
                            :rules="emailRules"
                            label="Электропочта"
                            hint="Например: anna.ahmatova@mail.ru"
                            outlined
                            required
                    ></v-text-field>

                    <v-text-field
                            v-if="isRegister"
                            v-model="fullName"
                            :rules="nameRules"
                            label="Полное имя"
                            hint="Например: Анна Ахматова"
                            outlined
                            required
                    ></v-text-field>

                    <v-text-field
                            v-model="password"
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            :rules="passwordRules"
                            :type="showPassword ? 'text' : 'password'"
                            hint="Не меньше 6 символов"
                            label="Пароль"
                            outlined
                            required
                            counter
                            name="password"
                            @click:append="showPassword = !showPassword"
                    ></v-text-field>

                    <v-select
                            v-if="isRegister"
                            v-model="role"
                            name="role"
                            :items="roles"
                            outlined
                    ></v-select>

                    <v-row>
                        <v-col class="d-flex align-end" v-if="isRegister">
                            <v-btn
                                    :disabled="!valid"
                                    color="success"
                                    class="mr-4"
                                    @click="register"
                            >
                                Зарегистрироваться
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                                    text
                                    x-small
                                    @click="isRegister = false"
                            >Вход</v-btn>
                        </v-col>
                        <v-col class="d-flex align-end" v-else>
                            <v-btn
                                    :disabled="!valid"
                                    color="success"
                                    class="mr-4"
                                    @click="login"
                            >
                                Войти
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                                    text
                                    x-small
                                    @click="isRegister = true"
                            >Регистрация</v-btn>
                        </v-col>
                    </v-row>
                    <v-row v-if="this.error">
                        <v-alert
                                dense
                                outlined
                                type="error"
                                class="mb-0"
                        >
                            {{this.error}}
                        </v-alert>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </v-sheet>
</template>

<script>
    export default {
        name: "Login",
        data() {
            return {
                email: null,
                password: null,
                fullName: null,
                role: 'applicant',
                roles: [
                    {text: 'Соискатель', value: 'applicant'},
                    {text: 'Работодатель', value: 'recruiter'},
                    {text: 'Модератор', value: 'moderator'},
                    {text: 'Администратор', value: 'admin'},
                ],
                valid: false,
                showPassword: false,
                emailRules: [
                    v => Boolean(v) || 'Обязательное поле',
                    v => v && /.+@.+\..+/.test(v) || 'Ошибка в адресе',
                ],
                passwordRules: [
                    v => Boolean(v) || 'Обязательное поле',
                    v => v && v.length >= 6 || 'Не меньше 6 символов',
                ],
                nameRules: [
                    v => Boolean(v) || 'Обязательное поле',
                    v => v && v.indexOf(' ') !== -1 || 'Укажите имя и фамилию'
                ],
                isRegister: false
            }
        },
        methods: {
            validate() {
                this.$refs.form.validate();
            },
            async register() {
                this.validate();
                if (this.valid) {
                    await this.$store.dispatch('registerUser', {
                        email: this.email,
                        fullName: this.fullName,
                        password: this.password,
                        role: this.role,
                    });
                    this.gotoProfile();
                }
            },
            async login() {
                this.validate();
                if (this.valid) {
                    await this.$store.dispatch('loginNewUser', {
                        email: this.email,
                        password: this.password,
                    });
                    this.goHome();
                }
            },
            gotoProfile() {
                this.$router.push({name: 'profile'});
            },
            goHome() {
                this.$router.push({name: 'home'});
            }

        },
        computed: {
            error() {
                return this.$store.state.user.error;
            }
        }
    }
</script>

<style scoped>
    .google-button {
        height: 64px!important;
        line-height: 24px;
    }
</style>