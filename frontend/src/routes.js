import EditVacancy from "@/components/EditVacancy";
import ViewVacancy from "@/components/ViewVacancy";
import ListVacancies from "@/components/ListVacancies";

import EditUser from "@/components/EditUser";
import ViewUser from "@/components/ViewUser";
import ListUsers from "@/components/ListUsers";

export default [
    { name: 'home', path: '/', component: ListVacancies },

    { name: 'newVacancy', path: '/vacancy/new', component: EditVacancy },
    { name: 'editVacancy', path: '/vacancy/edit/:vacancyId', component: EditVacancy },
    { name: 'viewVacancy', path: '/vacancy/view/:vacancyId', component: ViewVacancy },
    { name: 'viewVacancyUsers', path: '/vacancy/users/:vacancyId', component: ListUsers },
    { name: 'listVacancies', path: '/vacancy/list', component: ListVacancies },

    { name: 'profile', path: '/user/profile', component: EditUser },
    { name: 'newUser', path: '/user/new', component: EditUser },
    { name: 'editUser', path: '/user/edit/:userId', component: EditUser },
    { name: 'viewUser', path: '/user/view/:userId', component: ViewUser },
    { name: 'listUsers', path: '/user/list', component: ListUsers },
]