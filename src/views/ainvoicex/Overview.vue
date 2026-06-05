<script setup lang="ts">

import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {pb} from "@/pocketbase";
import type {RecordModel} from "pocketbase";
import {flatInstitutionsArray} from "@/constants/institutions.ts";
import moment from "moment";


const syncAinvoiceInfo = ref<RecordModel>()


const totalEnterprise = ref(0);
const totalRegisterDevice = ref(0);
const totalOnlineDevice = ref(0);
const totalOfflineDevice = ref(0);
const totalGoliveDevice = ref(0);
const totalDeviceNotGoliveYet = ref(0);

const enterprises = ref([] as RecordModel[])
const originalEnterprise = ref([] as RecordModel[])
const authoritiesFilter = ref([])
const searchKey = ref("")

watch(authoritiesFilter, () => {
  if (authoritiesFilter.value.length > 0) {
    enterprises.value = originalEnterprise.value.filter(i => authoritiesFilter.value.filter(j => j.code == i.expand!.tin["tax_authority"]).length > 0)
  } else {
    enterprises.value = originalEnterprise.value
  }
}, {
  deep: true
})

watch(enterprises, () => {
  totalEnterprise.value = enterprises.value.length;
  totalRegisterDevice.value = enterprises.value.map(i => i.devices_stat.length)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  totalOnlineDevice.value = enterprises.value.map(i => i.devices_stat.filter(j => j.onlineFlag == 1).length)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  totalOfflineDevice.value = enterprises.value.map(i => i.devices_stat.filter(j => j.onlineFlag == 0).length)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  totalGoliveDevice.value = enterprises.value.map(i => i.devices_stat.filter(j => {
    const configuration = (j["configuration"]["app_config"] as any[]).find(k => k.code == "app_auto_invoice_enabled")
    return JSON.parse(configuration["matchedItem"]["value"])["enabled"]
  }).length)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  totalDeviceNotGoliveYet.value = enterprises.value.map(i => i.devices_stat.filter(j => {
    const configuration = (j["configuration"]["app_config"] as any[]).find(k => k.code == "app_auto_invoice_enabled")
    return !(JSON.parse(configuration["matchedItem"]["value"])["enabled"])
  }).length)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
})

onMounted(async () => {
  await getAinvoiceUser()
  await getUpdatedSyncTime()
  await pb.collection('ainvoicex_user').subscribe('*', async function (e) {
    await getAinvoiceUser()
    await getUpdatedSyncTime()
  }, { /* other options like: filter, expand, custom headers, etc. */});

})

onBeforeUnmount(async () => {
  await pb.collection('ainvoicex_user').unsubscribe('*');
})


async function getAinvoiceUser() {
  const records = await pb.collection('ainvoicex_user').getFullList({
    expand: 'tin',
    sort: '-tin.data.registrationTime',
  });
  enterprises.value = records
  originalEnterprise.value = records
}

async function getUpdatedSyncTime() {
  const record = await pb.collection('etax_sync').getOne('syncainvoicex', {});
  syncAinvoiceInfo.value = record
}
</script>

<template>

  <v-app>
    <v-container>
      <Breadcrumbs></Breadcrumbs>
      <div class="flex justify-between">
        <h1 class="text-2xl font-semibold py-3">Overview</h1>
        <span>Sync at {{
            syncAinvoiceInfo ? moment(syncAinvoiceInfo["endAt"]).format("HH:mm DD/MM/YYYY") : " - "
          }}</span>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <v-card class="p-4">
          <div class="flex justify-end">
            <span>ຈຳນວນຫົວໜ່ວຍທຸລະກິດ</span>
          </div>
          <p class="text-8xl font-bold text-right">{{ totalEnterprise }}</p>
        </v-card>
        <v-card class="p-4">
          <div class="flex justify-end">
            <span>ຈຳນວນອຸປະກອນ</span>
          </div>
          <p class="text-8xl font-bold text-right">{{ totalRegisterDevice }}</p>
        </v-card>
        <v-card class="p-4">
          <div class="flex justify-end">
            <span>ຈຳນວນອຸປະກອນທີ່ Online</span>
          </div>
          <p class="text-8xl font-bold text-right">{{ totalOnlineDevice }}</p>
        </v-card>
        <v-card class="p-4">
          <div class="flex justify-end">
            <span>ຈຳນວນອຸປະກອນ Offline</span>
          </div>
          <p class="text-8xl font-bold text-right">{{ totalOfflineDevice }}</p>
        </v-card>
        <v-card class="p-4">
          <div class="flex justify-end">
            <span>ຈຳນວນອຸປະກອນ Go Live ແລ້ວ</span>
          </div>
          <p class="text-8xl font-bold text-right">{{ totalGoliveDevice }}</p>
        </v-card>

        <v-card class="p-4">
          <div class="flex justify-end">
            <span>ຈຳນວນອຸປະກອນຍັງບໍ່ທັນ Go Live</span>
          </div>
          <p class="text-8xl font-bold text-right">{{ totalDeviceNotGoliveYet }}</p>
        </v-card>

      </div>
      <div class="py-4">
        <v-row>
          <v-col>
            <v-autocomplete
                variant="underlined"
                :items="flatInstitutionsArray"
                :item-title="i => i.code + ' - ' +i.name"
                multiple
                label="ກົມສ່ວຍອາກອນ"
                v-model="authoritiesFilter"
                returnObject
                clearable
            ></v-autocomplete>
          </v-col>
          <v-col>
            <v-text-field
                label="ຄົ້ນຫາຕາມເລກ TIN ຫຼື ຊື່"
                v-model="searchKey"
                clearable
            >
            </v-text-field>
          </v-col>
        </v-row>
      </div>


      <div> <!-- table -->
        <v-data-table
            :headers="[
                { title: 'TIN', key: 'tin', align: 'center'},
                { title: 'Name', key: 'name', value: (value)=>value.expand!.tin['name']  },
                { title: 'Province', key: 'province', value: (value)=>value.expand!.tin['data']['institutionName']  },
                { title: 'Devices', key: 'device', value: (value)=>value.devices_stat.length  },
                { title: 'Golive', key: 'golive', value: (value)=> {
                  return value.devices_stat.filter(j => {
                    const configuration = (j['configuration']['app_config'] as any[]).find(k => (k.code == 'app_auto_invoice_enabled'));
                    return JSON.parse(configuration['matchedItem']['value'])['enabled']
                    }).length}
                },
                { title: 'Online', key: 'online', value: (value)=>value.devices_stat.filter(j => j.onlineFlag == 1).length  },
                { title: 'Offline', key: 'offline', value: (value)=>value.devices_stat.filter(j => j.onlineFlag == 0).length  },
                { title: 'Registered at', key: 'registeredAt',value: (value)=>value.expand!.tin['data']['registrationTime']},
              ]"
            fixed-header
            :search="searchKey"
            :items="enterprises">

        </v-data-table>
      </div>
    </v-container>
  </v-app>
</template>

<style scoped>

</style>