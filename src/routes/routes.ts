import {createRouter, createWebHistory} from 'vue-router'

import HelloWorld from '@/components/HelloWorld.vue'
import ManageUserView from "@/views/ManageUserView.vue";
import ManageGroupView from "@/views/ManageGroupView.vue";
import ManageDeviceView from "@/views/ManageDeviceView.vue";
import ManageTransactionTypeView from "@/views/ManageTransactionTypeView.vue";
import ManageInventoryView from "@/views/inventory/ManageInventoryView.vue";
import ImportDeviceListView from "@/views/inventory/ImportDeviceListView.vue";
import AssignDevicesView from "@/views/inventory/AssignDevicesView.vue";
import RecordTransactionView from "@/views/inventory/RecordTransactionView.vue";
import RecordInstallationDevices from "@/views/installation/RecordInstallationDevices.vue";

const routes = [
    {path: '', component: HelloWorld},
    {
        path: '/administration',
        children: [
            {path: '', redirect: "administration/manage-user"},
            {path: 'manage-user', component: ManageUserView},
            {path: 'manage-group', component: ManageGroupView},
        ]
    },
    {
        path: '/inventory',
        children: [
            {path: '', redirect: "/inventory/manage-inventory"},
            {path: 'manage-inventory', component: ManageInventoryView},
            {path: 'manage-device', component: ManageDeviceView},
            {path: 'import-device-list', component: ImportDeviceListView},
            {path: 'manage-transaction-type', component: ManageTransactionTypeView},
            {path: 'assign-devices', component: AssignDevicesView},
            {path: 'record-transaction', component: RecordTransactionView},
            // {path: 'record-installed-devices', component: AssignDevicesView}
        ]
    },
    {
        path: '/installation',
        children: [
            {path: '', redirect: "/installation/record-installation"},
            {path: 'record-installation', component: RecordInstallationDevices}
        ]
    },
    {path: '/taxpayer', component: HelloWorld},
]

export const router = createRouter({
        history: createWebHistory(), routes,
    }
)
