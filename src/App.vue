<template>
  <v-app id="inspire" :theme="theme">
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Inventory</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          slim
          @click="onClick"
      ></v-btn>
    </v-app-bar>
    <navigation-drawer v-model="drawer"></navigation-drawer>
    <v-main class="bg-grey-lighten-2">
      <RouterView></RouterView>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {ref, shallowRef} from 'vue'
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import {RouterView} from "vue-router";


const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const drawer = ref(true)

// menu list

</script>
