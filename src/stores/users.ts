import {defineStore} from "pinia";
import {pb} from "@/pocketbase";
import type {RecordModel} from "pocketbase";


export const useUsersStore = defineStore("users", {
    state: () => ({
        users: [] as RecordModel[],
        filter: "",
    }),
    actions: {
        listenToUsers: async function () {
            this.users = (await this.fetchUsersList())
            console.log(this.users[0])
            await pb.collection('users').subscribe('*', async (e) => {
                    console.log('users', e)
                    this.users = (await this.fetchUsersList())
                    console.log(this.users[0])
                }
            );
        },
        fetchUsersList: async function () {
            return await pb.collection('users').getFullList({
                expand: "group_id,company_id"
            });
        },
        unsub: async function() {
            await pb.collection('users').unsubscribe('*');
           this.users = [];
        },
        async createUser() {

        }
    }
});