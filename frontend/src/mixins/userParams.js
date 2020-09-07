import clone from "lodash.clone";
import axios from "axios";

export default {
    data() {
        return {
            isSaving: false,
            isLoading: false,
            resume: null,
            activeUser: {},
            savedUser: {},
        }
    },
    methods: {
        gotoUserList() {
            this.$router.push({name: 'listUsers'});
        },
        gotoUserDetails() {
            if (!this.activeUser) {
                return;
            }
            this.$router.push({name: 'viewUser', params: {userId: this.activeUser.id}});
        },
        gotoUserEdit() {
            if (!this.activeUser) {
                return;
            }
            this.$router.push({name: 'editUser', params: {userId: this.activeUser.id}});
        },
        resetUser() {
            if (this.isNew) {
                this.activeUser = {};
            }
            else {
                this.activeUser = clone(this.savedUser);
            }
        },

        async uploadResume(file) {
            let requestData = new FormData();
            requestData.append('resume', file);

            let uploadResult = await axios.post( '/api/file/resume',
                requestData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return uploadResult.data.file;
        },

        async saveUser() {
            this.isSaving = true;
            let saveUser = clone(this.activeUser);

            if (this.resume) {
                saveUser.resume = await this.uploadResume(this.resume);
                this.resume = null;
            }

            await this.$store.dispatch('saveUser', saveUser);
            this.updateViewUserState();
            this.isSaving = false;
            if (this.isNewUser) {
                let userId = this.$store.state.user.viewUser.id;
                this.$router.push({name: 'editUser', params: {userId}});
            }
        },
        updateViewUserState() {
            this.activeUser = this.$store.state.user.viewUser;
            this.savedUser = clone(this.activeUser);
        },
        async loadUser() {
            if (!this.userId) {
                return;
            }

            this.isLoading = true;
            await this.$store.dispatch('loadUser', this.userId);
            this.isLoading = false;
            this.updateViewUserState();
        },
        async deleteUser() {
            this.isLoading = true;
            await this.$store.dispatch('deleteUser', this.activeUser);
            this.isLoading = false;
            this.updateViewUserState();
        }
    },
    computed: {
        user() {
            return this.$store.state.user.user;
        },
        isUserRecruiter() {
            return this.user.role && this.user.role === 'recruiter';
        },
        isUserModerator() {
            return this.user.role && this.user.role === 'moderator';
        },
        isUserAdmin() {
            return this.user.role && this.user.role === 'admin';
        },
        isUserApplicant() {
            if (!this.user.role) {
                return true;
            }

            return !this.isUserRecruiter && !this.isUserModerator && !this.isUserAdmin;
        },
    }
}