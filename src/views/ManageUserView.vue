<script setup lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {useUsersStore} from "@/stores/users.ts";
import {computed, onMounted, onUnmounted} from "vue";
import {displayDate, displayTimestamp} from "@/utils/displayFormaters.ts";

const usersStore = useUsersStore();

const tableHeaders = computed(() => ([
  {
    title: 'No.',
    key: 'no',
    align: 'left'
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
    title: 'Group',
    key: 'expend',
    align: 'center',
    value: (item) => item["expand"]["group_id"]["name"]
  },
  {
    title: 'Created At',
    key: 'created',
    align: 'center',
    value: (item) => displayDate(item)
  },
]))
onMounted(() => {
  usersStore.listenToUsers();
})

onUnmounted(() => {
  usersStore.unsub();
})
</script>

<template>
  <v-container>
    <Breadcrumbs></Breadcrumbs>
    <h1 class="text-2xl font-bold py-3">User Management</h1>

    <v-card>
      <v-data-table :items="usersStore.users" :headers="tableHeaders">

      </v-data-table>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>