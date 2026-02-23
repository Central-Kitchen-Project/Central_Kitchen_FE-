import API from "./api"

const authService = {
    login: function (data) {
        return API.call().post('Auth/login', data)
    },
    register: function (data) {
        return API.call().post('Auth/register', data)
    },
    forgotPassword: function (data) {
        return API.call().post('Auth/forgot-password', data)
    },
    resetPassword: function (data) {
        return API.call().post('Auth/reset-password', data)
    },
}
export default authService;