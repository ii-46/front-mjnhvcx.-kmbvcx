import {createI18n} from 'vue-i18n'

const messages = {
    en: {
        message: {
            hello: 'hello world',
        },
        ui: {
            login: "Login",
            username: "Username",
            password: "Password",
        },
        "assign-devices": "Assign Devices",
        "assigner": "Assigner",
        "receiver": "Receiver"
    },
}

export default createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
})
