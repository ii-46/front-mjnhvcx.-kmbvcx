import i18n from './i18n';
import {createPinia} from 'pinia';
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type {App} from 'vue'

// Plugins
import vuetify from './vuetify'
import {createRulesPlugin} from "vuetify/labs/rules";

export function registerPlugins(app: App) {
    app.use(vuetify)
    app.use(createPinia());
    app.use(i18n);
    app.use(createRulesPlugin({ /* options */}, vuetify.locale))
}