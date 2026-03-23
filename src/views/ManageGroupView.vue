<script setup lang="ts">

import {computed, onMounted, onUnmounted} from "vue";
import {displayDate} from "@/utils/displayFormaters.ts";
import {useUsersStore} from "@/stores/users.ts";
import {useGroupStore} from "@/stores/groups.ts";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import CreateUserDialog from "@/components/users/CreateUserDialog.vue";
import EditUserDialog from "@/components/users/EditUserDialog.vue";
import DeleteUserDialog from "@/components/users/DeleteUserDialog.vue";
import CreateGroupDialog from "@/components/group/CreateGroupDialog.vue";
import EditGroupDialog from "@/components/group/EditGroupDialog.vue";
import DeleteGroupDialog from "@/components/group/DeleteGroupDialog.vue";

const groupStore = useGroupStore();
const tableHeaders = computed(() => ([
  {
    title: 'No.',
    key: 'no',
    align: 'center'
  },
  {
    title: 'ID',
    key: 'id',
    align: 'left'
  },
  {
    title: 'Name',
    key: 'name',
    align: 'left'
  },
  {
    title: 'Created At',
    key: 'created',
    align: 'center',
    value: (item) => displayDate(item)
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: "center"
  }
]))
onMounted(() => {
  groupStore.listenToGroups()
})

onUnmounted(() => {
  groupStore.unsubGroups()
})
</script>

<template>
  <v-app>
    <v-container>
      <Breadcrumbs></Breadcrumbs>
      <div class="flex justify-between">
        <h1 class="text-2xl font-semibold py-3">Group Management</h1>
        <div class="flex align-center">
          <CreateGroupDialog/>
        </div>
      </div>

      <v-card>
        <v-data-table :items="groupStore.groups" :headers="tableHeaders">
          <template v-slot:item.no="{ value , index}">
            {{ index + 1 }}
          </template>
          <template v-slot:item.actions="{ value , index, item}">
            <div class="flex justify-center gap-1">
              <EditGroupDialog :id="item.id"/>
              <DeleteGroupDialog :id="item.id" :name="item.name"/>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </v-app>
</template>

<style scoped>

</style>