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

    <v-navigation-drawer
        v-model="drawer"
        temporary
        width="500"
    >


      <v-list
          :lines="false"
          density="compact"
          nav
      >
        <template
            v-for="(item, i) in menuList"
            :key="i"
        >
          <template v-if="item.subtitle">
            <v-list-item-subtitle>
              {{ item.subtitle}}
            </v-list-item-subtitle>
          </template>
          <template v-else-if="item.spacer">
            <div
            class="h-4"
            >

            </div>
        </template>
          <v-list-item
              v-else
              :value="item"
              color="primary"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-title v-text="item.title" :to="item.to"></v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-2">
      <v-container>
        <v-row>
          <template v-for="n in 4" :key="n">
            <v-col
                class="mt-2"
                cols="12"
            >
              <strong>Category {{ n }}</strong>
            </v-col>

            <v-col
                v-for="j in 6"
                :key="`${n}${j}`"
                cols="6"
                md="2"
            >
              <v-sheet height="450"></v-sheet>
            </v-col>
          </template>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {ref, shallowRef} from 'vue'


const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const drawer = ref(true)

// menu list

const menuIcons = {
  html: 'mdi-language-html5',
  js: 'mdi-nodejs',
  pdf: 'mdi-file-pdf-box',
  png: 'mdi-file-image',
  mov: 'mdi-video-outline',
  mp4: 'mdi-video-outline',
  fileChartOutLine: 'mdi-file-chart-outline',
  home: 'mdi-home-outline'
}


const menuList = [
  {
    to: "home",
    title: "Home",
    icon: menuIcons.home,
  },
  {
    spacer: true
  },
  {
    subtitle: "Report",
  },

]

</script>
