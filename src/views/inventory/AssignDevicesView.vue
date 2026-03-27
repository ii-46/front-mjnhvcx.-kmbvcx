<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {useUsersStore} from "@/stores/users.ts";
import {computed, onMounted, onUnmounted, reactive, ref, toRaw, watch} from "vue";
import moment from "moment";
import {useInventoryStore} from "@/stores/inventory.ts";
import type {RecordModel} from "pocketbase";
import {useDeviceStore} from "@/stores/device.ts";

import {useI18n} from "vue-i18n";
import {toast} from "vue3-toastify";
import {useRules} from "vuetify/labs/rules";
import {TRANSACTION_TYPES} from "@/constants/transaction_types.ts";
import {pb} from "@/pocketbase";

const rules = useRules()

const {t} = useI18n()
const usersStore = useUsersStore()
const inventoryStore = useInventoryStore()
const deviceStore = useDeviceStore()

// const {devices: deviceList} = storeToRefs(deviceStore)
const formRef = ref()
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
    // formData.devices = []
    deviceStore.addFilterDeviceByInventoryId(formData.fromInventory.id);
    await deviceStore.unsubDevice()
    await deviceStore.listenToDevice()
  } else {
    deviceStore.resetFilterDevice()
    await deviceStore.unsubDevice()
  }

  if (formData.receiver !== null) {
    const inventory = inventoryStore.inventory.filter(i => i.user_id === formData.receiver!.id)[0]
    formData.toInventory = inventory ?? null
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
  // return _.difference([], deviceStore.devices)
  return deviceStore.devices.filter(i => !formData.devices.filter(iv => iv.data !== null).map(ib => ib.data!.id).includes(i.id))
})

const deviceRowIncrementValue = ref(10)

function addFormDataDeviceRow(incrementValue: number) {
  if (incrementValue > 30) {
    toast.warning("too much row, please add a little when you input all the field")
    return
  }
  for (let i = 0; i < incrementValue; i++) {
    formData.devices.push({
      id: null,
      data: null,
    })
  }

}

const loading = ref(false)

async function onSubmit() {
  const {valid} = await formRef.value.validate()
  if (!valid) return;
  const rawFormData = toRaw(formData);

  const hasDevices = rawFormData.devices.filter(i => i.id).length > 0
  if (!hasDevices) {
    toast.warning(t("please-select-at-least-one-device"))
  }

  const body = {
    from_user_id: rawFormData.assigner!.id,
    to_user_id: rawFormData.receiver!.id,
    from_inventory_id: rawFormData.fromInventory!.id,
    to_inventory_id: rawFormData.toInventory!.id,
    transaction_date: moment().toDate(),
    devices: rawFormData.devices.filter(i => i.data).map(i => i.data!.id),
    transaction_type_id: TRANSACTION_TYPES.ASSIGN
  }

  try {
    loading.value = true
    await pb.send("api/etax/batch-transactions", {
      body: body,
      method: "POST",
      credentials: "include",
    })

    toast.success(t("assign-devices-successfully"))
    onResetForm()
  } catch (e) {
    toast.error(e)
  } finally {
    loading.value = false
  }
  console.log("body: ", body)
}

function onResetForm() {
  formData.toInventory = null;
  formData.devices = [];
  formData.fromInventory = null;
  formData.receiver = null;
  formData.assigner = null
}

function onSelectDevice(item: RecordModel | null, index: number) {
  if (item) {
    formData.devices[index] = {
      id: item.id,
      data: item
    }
  } else {
    formData.devices = formData.devices.filter((_value, index1) => index1 !== index)
  }
  // console.log(item, index)
}


const summeryTotalSelectedDevice = computed(() => {
  const output: { [k: string]: any } = {}
  for (const item of formData.devices.filter(i => i.data)) {
    if (output[item.data!.expand!.type_id.name as string]) {
      output[item.data!.expand!.type_id.name]++;
    } else {
      output[item.data!.expand!.type_id.name] = 1
    }
  }
  return output
})
</script>


<template>
  <v-app>
    <v-container>
      <Breadcrumbs></Breadcrumbs>
      <div class="flex justify-between">
        <h1 class="text-2xl font-semibold py-3">{{ $t("assign-devices") }}</h1>
      </div>
      <v-card>
        <v-form @submit.prevent="onSubmit" ref="formRef">
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
                    :rules="[rules.required()]"
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
                    @update:model-value="formData.devices = formData.devices.map(i => ({id: null, data: null}))"
                    :rules="[rules.required()]"
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
                    :rules="[rules.required()]"
                ></v-autocomplete>
                <!--                :disabled="!formData.receiver"-->
                <v-autocomplete
                    :label="$t('select_inventory')"
                    v-model="formData.toInventory"
                    :readonly="true"
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
                    :rules="[rules.required()]"
                ></v-autocomplete>

              </v-col>
            </v-row>
          </v-container>
          <v-spacer class="mt-2"></v-spacer>
          <v-data-table-virtual
              disable-sort
              :items="formData.devices"
              :headers="[
                  {
                    title: t('No.'),
                    key: 'no',
                    align: 'center',
                  },
                  {
                    title: t('sn'),
                    key: 'sn',
                  },
                  {
                    title: t('device-type'),
                    key: 'data',
                    align: 'center',
                    value: item => item
                  },
                {
                  title: t('actions'),
                  key: 'actions',
                }

              ]"
          >
            <template v-slot:[`item.no`]="{index}">
              {{ index + 1 }}
            </template>
            <template v-slot:[`item.sn`]="{ index, item: value}">
              <v-autocomplete
                  :items="selectableDevice"
                  itemTitle="sn"
                  returnObject
                  @update:model-value="(item) => onSelectDevice(item, index)"
                  :modelValue="value.data?.sn"
                  hide-details
              >
              </v-autocomplete>
            </template>
            <template v-slot:[`item.data`]="{ item }">
              {{ item.data?.expand?.type_id?.name || "" }}
            </template>
            <template v-slot:[`item.actions`]="{ item, index }">
              <v-btn
                  size="small"
                  variant="plain"
                  color="error"
                  @click="onSelectDevice(null, index)"
              >
                <v-icon>
                  mdi-backspace-outline
                </v-icon>
              </v-btn>
            </template>

            <template v-slot:tfoot>
              <div class="table-footer-group">
                <tr>
                  <td colspan="4">
                    <div class="flex justify-center gap-1 py-2">
                      <v-text-field
                          v-model="deviceRowIncrementValue"
                          flat
                          hide-details color="primary"
                          density="compact"
                          type="number"
                          variant="underlined"
                          max-width="80"></v-text-field>
                      <v-btn
                          variant="outlined"
                          color="primary"
                          @click="addFormDataDeviceRow(deviceRowIncrementValue)"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </div>
            </template>
          </v-data-table-virtual>

          <v-container class="flex justify-end py-0">
            <div class="text-right">
              <template v-for="key of Object.keys(summeryTotalSelectedDevice)" :key="key">
                <p>{{ key.toString() }}: {{ summeryTotalSelectedDevice[key] }}</p>
              </template>
              <p>{{ $t("total-selected") }}: <span class="font-bold">{{
                  formData.devices.filter(i => i.id).length
                }} </span></p>
            </div>

          </v-container>
          <v-container class="flex justify-between mt-2">
            <v-btn
                variant="outlined"
                color="info"
                @click="onResetForm"
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
    </v-container>
  </v-app>

</template>

<style scoped>

</style>