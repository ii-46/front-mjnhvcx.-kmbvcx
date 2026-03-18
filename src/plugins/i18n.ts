import {createI18n} from 'vue-i18n'

const messages = {
    en: {
        message: {
            hello: 'hello world',
        },
        ui: {
            login: "Login",
            username: "Username",
            password: "Password"
        }
    },
    lo: {
        message: {
            hello: 'こんにちは、世界',
        },
        ui: {
            login: "ເຂົ້າສູ່ລະຍົບ",
            username: "ຂື່ຜູ້ໃຊ້",
            password: "ລະຫັດຜ່ານ"
        }
    },
}

export default createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
})
