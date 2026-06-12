<script setup lang="ts">
import {VDateRangePicker} from 'vuetify/labs/VDateRangePicker'
import {computed, ref, watch} from "vue";

import moment from "moment";


import {useDate} from 'vuetify'

const adapter = useDate()
const formatDate = v => (v ? adapter.format(adapter.date(v), 'keyboardDate') : '')

const today = adapter.date()

function daysAgo(count) {
  return adapter.addDays(today, -count)
}

function monthsAgo(count) {
  return adapter.addMonths(today, -count)
}

const presets = [
  {title: 'Today', value: 'today'},
  {title: 'Last 7 days', value: 'last-7d'},
  {title: 'Last 30 days', value: 'last-30d'},
  {title: 'Last 3 months', value: 'last-3m'},
  {title: 'Last 12 months', value: 'last-12m'},
  {title: 'Month to date', value: 'month-to-date'},
  {title: 'Year to date', value: 'year-to-date'},
]

const preset = ref(['last-30d'])
const draft = ref([daysAgo(6), today])
const applied = ref([daysAgo(6), today])

const hasRange = computed(() => draft.value?.length === 2)

watch(preset, ([value]) => {
  if (value === 'today') draft.value = [today, today]
  else if (value === 'last-7d') draft.value = [daysAgo(6), today]
  else if (value === 'last-30d') draft.value = [daysAgo(29), today]
  else if (value === 'last-3m') draft.value = [monthsAgo(3), today]
  else if (value === 'last-12m') draft.value = [monthsAgo(12), today]
  else if (value === 'month-to-date') draft.value = [adapter.startOfMonth(today), today]
  else if (value === 'year-to-date') draft.value = [adapter.startOfYear(today), today]
})

function apply() {
  applied.value = [...draft.value]
  dateToLoadDialog.value = false;
}

function cancel() {
  draft.value = applied.value ? [...applied.value] : []
  dateToLoadDialog.value = false;
}

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const dateToLoadDialog = ref(false);


function onLoadOrderData() {
  console.log(applied.value)
}
</script>

<template>
  <v-dialog max-width="1200">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
          v-bind="activatorProps"
          color="primary"
          prepend-icon="mdi-eye"
      >
        Detail
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card
          :title="item.expand?.tin['id'] + ' - ' + item.expand?.tin['name']"
      >
        <template v-slot:subtitle>
          {{item.enterpise_code + ', ' + item.password}}
        </template>
        <v-card-text>
                    <span>

                    </span>
          <v-expansion-panels>
            <v-expansion-panel
                :title="`ຈຳນວນອຸປະກອນ ${ item.devices_stat?.length || 0 }`"
            >
              <template v-slot:text>

                <v-data-table
                    :headers="[
                            {
                              key: 'no',
                              title: 'No.'
                            },
                            {
                              'key': 'id',
                              'title': 'ID',
                              'align': 'start',
                              'value': value => value?.equipmentCode || '-'
                            },
                            {
                              key: 'createTime',
                              title: 'Created at',
                            },
                            {
                              key: 'loginTime',
                              title: 'Login at'
                            },
                            {
                              key: 'configuration',
                              title: 'Configuration'
                            }

                        ]"
                    :items="item.devices_stat.map(((i,idx) => ({...i, no: idx+1})))"
                >
                  <template v-slot:item.configuration="{value}">
                    <p>app_text_parse_rule: <b><code>{{
                        (value['app_config'] as []).find(i => i.code == 'app_text_parse_rule').valueJson
                      }}</code></b></p>
                    <p>app_image_parse_rule: <b><code>{{
                        (value['app_config'] as []).find(i => i.code == 'app_image_parse_rule').valueJson
                      }}</code></b></p>
                    <p>app_image_prompt:
                      "{{ value['app_image_prompt'][value['app_image_prompt'].length - 1]?.content || '' }}"</p>
                  </template>

                </v-data-table>
              </template>
            </v-expansion-panel>
            <v-expansion-panel
                :title="`Sale Orders`"
            >
              <template v-slot:text>
                <v-label>Load data</v-label>
                <v-row>
                  <v-col>
                    <v-text-field
                        label="Number of Records"
                    ></v-text-field>
                  </v-col>
                  <v-col>
                    <v-dialog
                        v-model="dateToLoadDialog"
                        max-width="800"
                    >
                      <template v-slot:activator="{ props: activatorProps }">
                        <v-text-field
                            readonly
                            v-bind="activatorProps"
                            :label="`
                            ${applied.length != 2 ?
                                'Select date range' :
                                moment(applied[0]).format('DD/MM/YYYY')
                                  + ' - ' + moment(applied[1]).format('DD/MM/YYYY')}`"
                        ></v-text-field>
                      </template>

                      <v-card>

                        <v-row justify="center">
                          <v-card class="d-flex" elevation="2" rounded>
                            <v-list
                                v-model:selected="preset"
                                :items="presets"
                                density="compact"
                                width="180"
                                mandatory
                                nav
                            ></v-list>

                            <v-divider vertical></v-divider>

                            <div class="d-flex flex-column">
                              <v-date-range-picker v-model="draft" independent-months>
                                <template v-slot:footer>
                                  <v-text-field
                                      :model-value="formatDate(draft?.[0])"
                                      density="compact"
                                      style="max-width: 140px"
                                      variant="outlined"
                                      hide-details
                                      readonly
                                  ></v-text-field>
                                  <span class="text-medium-emphasis">»</span>
                                  <v-text-field
                                      :model-value="formatDate(draft?.[1])"
                                      density="compact"
                                      style="max-width: 140px"
                                      variant="outlined"
                                      hide-details
                                      readonly
                                  ></v-text-field>
                                  <v-spacer></v-spacer>
                                  <v-btn text="Cancel" variant="text" @click="cancel"></v-btn>
                                  <v-btn
                                      :disabled="!hasRange"
                                      color="primary"
                                      text="Apply"
                                      @click="apply"
                                  ></v-btn>
                                </template>
                              </v-date-range-picker>
                            </div>
                          </v-card>
                        </v-row>


                      </v-card>
                    </v-dialog>


                  </v-col>
                  <v-col
                      cols="2"
                  >
                    <v-btn
                        color="primary"
                        size="large"
                        variant="outlined"
                        block
                        @click="onLoadOrderData"
                    >
                      Load
                    </v-btn>
                  </v-col>
                </v-row>
                <v-divider class="py-2"></v-divider>
                <v-label>Filter</v-label>
                <v-row>
                  <v-col>
                    <v-text-field
                        label="Serial Number / OrderId"
                    ></v-text-field>
                  </v-col>
                  <v-col>
                    <v-autocomplete
                        label="Status"
                    ></v-autocomplete>
                  </v-col>
                  <v-col>
                    <v-autocomplete
                        label="Device"
                    ></v-autocomplete>
                  </v-col>
                </v-row>


                <v-data-table
                    size="small"
                ></v-data-table>
              </template>
            </v-expansion-panel>

          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              text="Close"
              @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

</template>

<style scoped>

</style>