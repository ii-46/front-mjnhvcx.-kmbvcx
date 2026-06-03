import {defineStore} from "pinia";
import {pb} from "@/pocketbase";
import type {RecordModel} from "pocketbase";

export const useTaxpayerStore = defineStore("taxpayer", {
    state: () => ({
        taxpayers: [] as RecordModel[],
    }),
    actions: {
        listenToTaxpayer: async function () {
            this.taxpayers = (await this.fetchTaxpayerList())
            console.log(this.taxpayers[0])
            await pb.collection('taxpayer').subscribe('*', async (e) => {
                    console.log('taxpayer', e)
                    this.taxpayers = (await this.fetchTaxpayerList())
                    console.log(this.taxpayers[0])
                }
            );
        },
        fetchTaxpayerList: async function () {
            return await pb.collection('taxpayer').getFullList({});
        },
        unsubTaxpayerList: async function () {
            await pb.collection('taxpayer').unsubscribe('*');
            this.taxpayers = [];
        },
    }
})
