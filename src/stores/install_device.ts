import {defineStore} from "pinia";
import {pb} from "@/pocketbase";
import type {RecordModel} from "pocketbase";

export const useInstallationDeviceStore = defineStore("installation", {
    state: () => ({
        available_devices: [] as RecordModel[],
    }),
    actions: {
        listenToTaxpayer: async function () {
            this.available_devices = (await this.fetchAvailableDeviceList())
            await pb.collection('available_device').subscribe('*', async (e) => {
                    this.available_devices= (await this.fetchAvailableDeviceList())
                }
            );
        },
        fetchAvailableDeviceList: async function () {
            return await pb.collection('available_device').getFullList({});
        },
        unsubAvailableDeviceList: async function () {
            await pb.collection('available_device').unsubscribe('*');
            this.available_devices = [];
        },
    }
})
