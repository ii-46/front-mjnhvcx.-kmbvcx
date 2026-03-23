import {defineStore} from "pinia";
import {pb} from "@/pocketbase";
import type {RecordModel} from "pocketbase";

export const useGroupStore = defineStore("groups", {
    state: () => ({
        groups: [] as RecordModel[],
    }),
    actions: {
        listenToGroups: async function () {
            this.groups = (await this.fetchGroupsList())
            console.log(this.groups[0])
            await pb.collection('group').subscribe('*', async (e) => {
                console.log('group', e)
                    this.groups = (await this.fetchGroupsList())
                    console.log(this.groups[0])
                }
            );
        },
        fetchGroupsList: async function () {
            return await pb.collection('group').getFullList({});
        },
        unsubGroups: async function () {
            await pb.collection('group').unsubscribe('*');
            this.groups = [];
        }, async createGroup(data: {
            name: string,

        }) {
            const payload = {
                "name": data.name,
            };

            return await pb.collection('group').create(payload)
        },
        fetchGroup: async function (id: string) {
            return await pb.collection('group').getOne(id, {});
        },
        async updateGroup(id: string, data: {
            name: string,

        }) {
            const payload = {
                "name": data.name,
            };

            return await pb.collection('group').update(id, payload)
        },
        async deleteGroup(id: string) {
            return await pb.collection('group').delete(id )
        },
    }
})
