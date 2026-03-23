import {defineStore} from "pinia";
import type {RecordModel} from "pocketbase";
import {pb} from "@/pocketbase";

export const useTransactionTypeStore = defineStore("transaction_type", {
    state: () => ({
        transactionType: [] as RecordModel[]
    }),
    actions: {
        listenToTransactions: async function () {
            this.transactionType = (await this.fetchTransactionsList())
            console.log(this.transactionType[0])
            await pb.collection('transaction_type').subscribe('*', async (e) => {
                    console.log('transaction_type', e)
                    this.transactionType = (await this.fetchTransactionsList())
                    console.log(this.transactionType[0])
                }
            );
        },
        fetchTransactionsList: async function () {
            return await pb.collection('transaction_type').getFullList({});
        },
        unsubTransactions: async function () {
            await pb.collection('transaction_type').unsubscribe('*');
            this.transactionType = [];
        }, async createTransaction(data: {
            id: string,
            name: string,

        }) {
            const payload = {
                "id": data.id,
                "name": data.name,
            };

            return await pb.collection('transaction_type').create(payload)
        },
        fetchTransaction: async function (id: string) {
            return await pb.collection('transaction_type').getOne(id, {});
        },
        async updateTransaction(id: string, data: {
            id: string,
            name: string,

        }) {
            const payload = {
                "id": data.id,
                "name": data.name,
            };

            return await pb.collection('transaction_type').update(id, payload)
        },
        async deleteTransaction(id: string) {
            return await pb.collection('transaction_type').delete(id )
        },
    }
})