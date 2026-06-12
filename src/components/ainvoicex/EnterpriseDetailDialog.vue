<script setup lang="ts">
import {VDateRangePicker} from 'vuetify/labs/VDateRangePicker'
import {ref} from "vue";
import moment from "moment";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const dateToLoadModel = ref([]);
const dateToLoadDialog = ref(false);
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
      <v-card :title="item.expand?.tin['id'] + ' - ' + item.expand?.tin['name']">
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
                        max-width="600"
                    >
                      <template v-slot:activator="{ props: activatorProps }">
                        <v-text-field
                            readonly
                            v-bind="activatorProps"
                            :label="`
                            ${dateToLoadModel.length != 2 ?
                                'Select date range' :
                                moment(dateToLoadModel[0]).format('DD/MM/YYYY')
                                  + ' - ' + moment(dateToLoadModel[1]).format('DD/MM/YYYY')}`"
                        ></v-text-field>
                      </template>

                      <v-card>
                        <v-date-range-picker
                            v-model="dateToLoadModel"
                            label="Date Range"
                            @update:model-value="()=> {
                              if(dateToLoadModel.length == 2) {
                                 dateToLoadDialog = false
                              }
                            }"
                        >

                        </v-date-range-picker>
                      </v-card>
                    </v-dialog>


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
                  <v-col :cols="2">
                    <v-btn color="primary" block append-icon="mdi-microsoft-excel">
                      Export to excel
                    </v-btn>
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