<script setup lang="ts">

import {computed, ref} from "vue";

const data = ref([
  {
    status: "issued",
    color: "#47ea61",
    amount: 10,
  },
  {
    status: "pending-issued",
    color: "#eaa947",
    amount: 40,
  },
  {
    status: "parse-failed",
    color: "#ea4747",
    amount: 10,
  }
])
const totalInvoices = computed(() => (data.value.map(i => i.amount).reduce(((previousValue, currentValue) => previousValue + currentValue), 0)))
</script>

<template>
  <div class="flex flex-nowrap w-full rounded-2xl overflow-hidden h-3">
    <div
        v-for="item in data"
        :style="`width: ${(item.amount / totalInvoices) * 100}%; background-color: ${item.color}`"
        v-tooltip:top="`${item.status}: ${item.amount}`"
    >
    </div>
  </div>
</template>

<style scoped>

</style>