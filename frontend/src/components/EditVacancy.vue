<template>
    <v-container class="fill-height align-start">
        <v-row align="start" justify="center" width="100%">
            <v-col>
                <v-card>
                    <v-card-title>{{isNew ? 'Новая вакансия' : 'Редактирование вакансии'}}</v-card-title>
                    <v-card-text>
                        <v-form>
                            <div v-if="isUserAdmin">
                                <v-select v-model="vacancy.status" :items="vacancyStatuses" label="Статус вакансии"></v-select>
                                <v-select v-model="vacancy.moderationStatus" :items="moderationStatuses" label="Статус вакансии"></v-select>
                                <v-divider></v-divider>
                            </div>
                            <v-text-field v-model="vacancy.name" label="Название позиции"></v-text-field>
                            <v-text-field v-model="vacancy.city" label="Город"></v-text-field>
                            <v-text-field v-model="vacancy.company" label="Компания"></v-text-field>
                            <v-text-field v-model="vacancy.salary" label="Заработная плата"></v-text-field>
                            <v-textarea v-model="vacancy.text" label="Текст вакансии"></v-textarea>
                            <v-combobox
                                    v-model="vacancy.skills"
                                    deletable-chips
                                    chips
                                    label="Ключевые навыки"
                                    persistent-hint
                                    hint="Enter для разделения навыков. Используются для поиска и распознования в резюме"
                                    multiple
                            ></v-combobox>
                            <v-switch v-model="vacancy.testPeriod" label="Есть испытательный срок"></v-switch>
                            <v-switch v-model="vacancy.remote" label="Удаленка"></v-switch>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn text small @click="resetVacancy">Сбросить</v-btn>
                        <v-btn color="success" :loading="isSaving" @click="saveVacancy">Сохранить</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click="gotoVacancyList">К списку вакансий</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import vacancyParams from "@/mixins/vacancyParams";
    import userParams from "@/mixins/userParams";

    export default {
        name: "EditVacancy",
        mixins: [userParams,vacancyParams],
        data() {
            return {
                vacancyStatuses: [
                    {text: 'Черновик', value: 'draft'},
                    {text: 'Опубликована', value: 'published'},
                    {text: 'На модерации', value: 'pending'},
                ],
                moderationStatuses: [
                    {text: 'Не рассмотрена', value: ''},
                    {text: 'Принята', value: 'accepted'},
                    {text: 'Отклонена', value: 'rejected'},
                ]
            }
        },
        async mounted() {
            if (this.vacancyId) {
                await this.loadVacancy();
            }
        },
        watch: {
            async vacancyId() {
                if (this.vacancyId) {
                    await this.loadVacancy();
                }
                else {
                    this.vacancy = {};
                    this.savedVacancy = {};
                }
            }
        },
        computed: {
            vacancyId() {
                return this.$route.params.vacancyId || false;
            },
            isNew() {
                return !this.vacancyId;
            }
        }
    }
</script>

<style scoped>

</style>