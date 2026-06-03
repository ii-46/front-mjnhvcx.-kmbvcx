<script setup lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {useTaxpayerStore} from "@/stores/taxpayer.ts";
import {onMounted, onUnmounted} from "vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const taxpayerStore = useTaxpayerStore()


onMounted(async () => {
  await taxpayerStore.listenToTaxpayer()
})

onUnmounted(async () => {
  await taxpayerStore.unsubTaxpayerList()
})

</script>


<template>
  <v-app>
    <v-container>
      <Breadcrumbs></Breadcrumbs>
      <div class="flex justify-between">
        <h1 class="text-2xl font-semibold py-3">{{ $t("record-installation") }}</h1>
      </div>
      <v-card>
        <v-container>
          <h2>Taxpayer Info</h2>
          <v-row>
            <v-col>
              <v-autocomplete
                  :label="$t('select_enterprise')"
                  :items="taxpayerStore.taxpayers"
                  :itemTitle="i=>i['id'] + ' - ' + i['name']"
                  returnObject
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <v-card>
        <v-container>
          <h2>Installed Device List</h2>
          <v-data-table-virtual
              disable-sort
              :items="[].fill('1',0,10)"
              :headers="[
                  {
                    title: t('No.'),
                    key: 'no',
                    align: 'center',
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
              <tfoot class="table-footer-group">
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
              </tfoot>
            </template>
          </v-data-table-virtual>
        </v-container>
      </v-card>

    </v-container>
  </v-app>

</template>

<style scoped>

</style>
