<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {useUsersStore} from "@/stores/users.ts";
import {computed, onMounted, onUnmounted, reactive, toRaw, watch} from "vue";
import moment from "moment";
import {useInventoryStore} from "@/stores/inventory.ts";
import type {RecordModel} from "pocketbase";
import {useDeviceStore} from "@/stores/device.ts";

import {useI18n} from "vue-i18n";
import _ from "lodash";


const {t} = useI18n()
const usersStore = useUsersStore()
const inventoryStore = useInventoryStore()
const deviceStore = useDeviceStore()

// const {devices: deviceList} = storeToRefs(deviceStore)
const initForm: {
  assignDate: Date,
  assigner: null | RecordModel,
  fromInventory: null | RecordModel,
  receiver: null | RecordModel,
  toInventory: null | RecordModel,
  devices: {
    id: string | null,
    data: null | RecordModel
  }[]
} = {
  assignDate: moment().toDate(),
  assigner: null,
  fromInventory: null,
  receiver: null,
  toInventory: null,
  devices: []
}
const formData = reactive(initForm)

watch(formData, async () => {
  if (formData.fromInventory) {
    deviceStore.addFilterDeviceByInventoryId(formData.fromInventory.id);
    await deviceStore.unsubDevice()
    await deviceStore.listenToDevice()
  } else {
    deviceStore.resetFilterDevice()
    await deviceStore.unsubDevice()
  }
}, {
  deep: true,
  immediate: true,
})

onMounted(async () => {
  await usersStore.listenToUsers()
  await inventoryStore.listenToInventory()
})

onUnmounted(async () => {
  await usersStore.unsubUsers()
  await inventoryStore.unsubInventory()
})

const selectableDevice = computed(() => {
  console.log(formData.devices.filter(i => i.data).map(i => i.data))
  return _.difference(deviceStore.devices, toRaw(formData.devices.filter(i => i.data).map(i => i.data) as RecordModel[]))
})

function addFormDataDeviceRow() {
  formData.devices.push({
    id: null,
    data: null,
  })

}

function onSubmit() {

}

</script>


<template>
  <v-app>
    <v-container>
      <Breadcrumbs></Breadcrumbs>
      <div class="flex justify-between">
        <h1 class="text-2xl font-semibold py-3">{{ $t("assign-devices") }}</h1>
      </div>
      <v-card>
        <v-form @submit.prevent="onSubmit">
          <v-container>

            <v-row>
              <v-col sm="12" md="12" lg="5">
                <v-label class="mb-1">
                  {{ $t("assigner") }}
                </v-label>
                <v-autocomplete
                    :label="$t('select_assigner')"
                    v-model="formData.assigner"
                    :items="usersStore.users.filter(i => {
                      if(formData.receiver) {
                        return i.id !== formData.receiver.id
                      }
                      return true
                    })"
                    :itemTitle="value =>value.name"
                    returnObject
                ></v-autocomplete>
                <v-autocomplete
                    :label="$t('select_inventory')"
                    :disabled="!formData.assigner"
                    v-model="formData.fromInventory"
                    :items="inventoryStore.inventory.filter(i => {
                      let isDefault = false;
                      if(formData.assigner) {
                        isDefault = i.is_default
                      }
                      if(formData.toInventory) {
                        return !isDefault && i.id !== formData.toInventory.id
                      }
                      return !isDefault
                    }
                    )"
                    :itemTitle="value =>value.name"
                    returnObject
                ></v-autocomplete>
              </v-col>
              <v-col sm="12" md="12" lg="2" align-self="center">
                <div class="flex justify-center">
                  <div class="flex flex-col items-center">
                    <v-icon size="x-large" title="assign">
                      mdi-chevron-double-right
                    </v-icon>
                    <b>
                      {{ $t("assign_to") }}
                    </b>
                  </div>
                </div>
              </v-col>
              <v-col sm="12" md="12" lg="5">
                <v-label class="mb-1">
                  {{ $t("receiver") }}
                </v-label>
                <v-autocomplete
                    :label="$t('select_receiver')"
                    v-model="formData.receiver"
                    :items="usersStore.users.filter(i => {
                      if(formData.assigner) {
                        return i.id !== formData.assigner.id
                      }
                      return true
                    })"
                    :itemTitle="value =>value.name"
                    returnObject
                    @update:model-value="()=>{
                      formData.toInventory = null
                    }"
                ></v-autocomplete>
                <v-autocomplete
                    :label="$t('select_inventory')"
                    v-model="formData.toInventory"
                    :disabled="!formData.receiver"
                    :items="inventoryStore.inventory.filter(i => {
                      let isOwner = false;
                      if(formData.receiver) {
                          isOwner = i.user_id === formData.receiver.id // check if user is owner
                      }
                      if(formData.fromInventory) {
                        return isOwner && (i.id !== formData.fromInventory.id) // check if not from opposite
                      }
                      return isOwner
                    }
                    )"
                    :itemTitle="value =>value.name"
                    returnObject
                    autoSelectFirst
                ></v-autocomplete>

              </v-col>
            </v-row>
          </v-container>
          <v-spacer class="mt-2"></v-spacer>
          <v-data-table-virtual
              :items="formData.devices"
              :headers="[
                  {
                    title: t('No.'),
                    key: 'no',
                    align: 'center',
                    width: 100,
                  },
                  {
                    title: t('sn'),
                    key: 'sn',
                  },
                  {
                    title: t('device-type'),
                    key: 'device_type_id',
                    width: 200
                  }
              ]"
          >
            <template v-slot:[`item.sn`]>
              <v-autocomplete
                  :items="selectableDevice"
                  itemTitle="sn"
                  returnObject
              >

              </v-autocomplete>
              {{ selectableDevice[0] }}
            </template>
            <template v-slot:tfoot>
              <div class="table-footer-group">
                <tr>
                  <td colspan="3">
                    <div class="flex justify-center py-2">
                      <v-btn
                          variant="outlined"
                          color="primary"
                          @click="addFormDataDeviceRow"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </div>
            </template>
          </v-data-table-virtual>

          <v-container class="flex justify-between mt-2">
            <v-btn
                type="submit"
                variant="outlined"
                color="info"
            >
              {{ $t("reset") }}
            </v-btn>
            <v-spacer>

            </v-spacer>
            <v-btn
                type="submit"
                variant="elevated"
                color="primary"
            >
              {{ $t("submit") }}
            </v-btn>
          </v-container>
        </v-form>
      </v-card>

      <div>
        some report here maybe
      </div>
    </v-container>
  </v-app>

</template>

<style scoped>

</style>