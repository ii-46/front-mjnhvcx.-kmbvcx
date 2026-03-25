<script setup lang="ts">

import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {VDateInput} from "vuetify/labs/components";
import moment from "moment";
import {router} from "@/routes/routes.ts";
import {onMounted, onUnmounted, ref, toRaw, watch} from "vue";
import {useDeviceStore} from "@/stores/device.ts";
import type {RecordModel} from "pocketbase";
import {read, utils as xlsxUtils} from "xlsx";
import {toast} from "vue3-toastify";
import {pb} from "@/pocketbase";

const deviceStore = useDeviceStore()

const lotDate = ref()
const inventoryName = ref()
const deviceTypeSelected = ref([] as RecordModel[])

const xlsxFileUploaded = ref({} as {
  [k: string]: {
    deviceType: RecordModel,
    file: File | null,
    sn: string[]
  }
})


watch(deviceTypeSelected, (newValue) => {
  if (newValue.length > 0) {
    for (const newValueElement of newValue) {
      if (xlsxFileUploaded.value[newValueElement.id]) continue;
      xlsxFileUploaded.value[newValueElement.id] = {
        deviceType: toRaw(newValueElement),
        file: null,
        sn: []
      };
      processed.value = false;
    }

  }
})

onMounted(async () => {
  await deviceStore.listenToDeviceTypes()

  inventoryName.value = `LOT_` + moment().format('DD_MM_YYYY');
  lotDate.value = moment().toDate();
})
onUnmounted(() => {
  deviceStore.unsubDeviceTypes()
})

const loading = ref(false)

async function onSubmit() {
  // if (Object.values(xlsxFileUploaded.value)
  for (const item of deviceTypeSelected.value) {
    if (xlsxFileUploaded.value[item.id].sn.length === 0) {
      toast.warning("Please input valid file and click process again")
      return
    }
  }
  const payload = Object.values(toRaw(xlsxFileUploaded.value)).map(i => ({
    device_type_id: i.deviceType.id,
    sn: i.sn
  }))
  console.log('payload', payload)
  await pb.send("api/etax/import-devices", {
    credentials: "include",
    method: "POST"
  })
}

const processed = ref(false)

async function onProcessFiles() {
  try {
    loading.value = true
    for (const item of deviceTypeSelected.value) {
      if (xlsxFileUploaded.value[item.id].file) {
        xlsxFileUploaded.value[item.id].sn = await processSnXlsxFile(xlsxFileUploaded.value[item.id].file!)
        console.log(xlsxFileUploaded.value[item.id].sn)
        processed.value = true
      } else {
        toast.warning("Please upload sn list for device: " + item["name"])
        processed.value = false
      }
    }
  } catch (e) {
    toast.error(e)
  } finally {
    loading.value = false
  }
}

async function processSnXlsxFile(file: File): Promise<string[]> {
  const fileContent = read(await file.bytes())
  const sheet = Object.values(fileContent.Sheets)[0];
  const sheetAsJson = xlsxUtils.sheet_to_json(sheet, {
    header: "A",
    raw: true
  }).slice(1)

  // output[file.name] = []
  const snList = [];
  for (const sheetAsJsonElement of sheetAsJson) {
    const sn = sheetAsJsonElement["A"].toString().trim();
    snList.push(sn)
  }
  return snList;
}


async function validateSn(deviceType: RecordModel, input: string): boolean {
  const content: string = input.toString();
  const length =
      content.trim().length;
  const startWith = content.startsWith(deviceType["sn_start_with"]);
  if (length === deviceType["length"] && startWith) {
    return true
  } else {
    return false
  }
}
</script>

<template>
  <v-app>
    <v-container>
      <Breadcrumbs></Breadcrumbs>
      <div class="flex justify-between">
        <h1 class="text-2xl font-semibold py-3">Import New Device List</h1>
      </div>
      <v-form @submit.prevent="onSubmit">
        <v-card>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-date-input
                    v-model="lotDate"
                    label="Import Date*"
                    :displayFormat="value => moment(value).format('DD/MM/YYYY')"
                ></v-date-input>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="inventoryName"
                    label="Inventory Name*"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-autocomplete
                v-model="deviceTypeSelected"
                :items="deviceStore.deviceTypes"
                :itemTitle="value =>value.name"
                label="Select device types*"
                returnObject
                multiple
                chips
            ></v-autocomplete>
            <small class="text-body-small text-medium-emphasis">*indicates required field</small>
          </v-container>
        </v-card>
        <template v-for="item of deviceTypeSelected" :key="item.id">
          <v-card class="mt-4">
            <v-container>
              <div class="flex justify-between pb-3">
                <label>Upload XLSX for Device type: <span class="font-bold">{{ item.name }}</span></label>
                <div>
                  <v-btn variant="outlined" size="small" color="secondary">
                    <v-icon>mdi-download</v-icon>
                    Download Template
                  </v-btn>
                </div>
              </div>
              <v-file-input
                  v-model="xlsxFileUploaded[item['id']].file"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  label="File input*"
                  @update:model-value="()=> processed = false"
              ></v-file-input>
              <small class="text-body-small text-medium-emphasis">*indicates required field</small>

              <div v-if="processed && !loading">
                {{ xlsxFileUploaded[item['id']].sn }}
                <v-data-table-virtual
                    :items="xlsxFileUploaded[item['id']].sn.map(i => ({
                     sn: i,
                     device_type: xlsxFileUploaded[item['id']].deviceType['name']
                    }))"
                    :headers="[
                        {title: 'No. ', key: 'no', align: 'end'},
                        {title: 'Serial Number', key: 'sn', align: 'center'},
                        {title: 'Device Type', key: 'device_type', align: 'center'}
                        ]"
                    height="400"
                    fixed-header
                    fixed-footer
                >
                  <template v-slot:[`item.no`]="{index}">
                    {{ index + 1 }}
                  </template>
                  <template v-slot:tfoot>
                  </template>
                </v-data-table-virtual>
              </div>
            </v-container>
          </v-card>
        </template>
        <v-spacer class="h-6">
        </v-spacer>
        <div class="flex justify-between">
          <v-btn variant="outlined" size="large" @click="router.back()">Cancel</v-btn>
          <!--          <ComfirmImportSnListDialog-->
          <!--              :disabled="deviceTypeSelected.length === 0"-->
          <!--          >-->
          <!--            Submit-->
          <!--          </ComfirmImportSnListDialog>-->
          <div class="flex gap-4">

            <v-btn
                :disabled="deviceTypeSelected.length === 0 || processed"
                variant="outlined" color="primary" size="large"
                @click="onProcessFiles"
            >Process
            </v-btn>
            <v-btn
                type="submit"
                :disabled="deviceTypeSelected.length === 0 || !processed"
                variant="elevated" color="primary" size="large">Submit
            </v-btn>
          </div>
        </div>
      </v-form>
    </v-container>
  </v-app>
</template>

<style scoped>

</style>
