import axios from 'axios';

const BASE_URL = '/api/';

const API = {
    call: function () {
        return axios.create({
            baseURL: BASE_URL,
    });
},
    callWithToken: function (token) {
        if (!token) token = localStorage.getItem('ACCESS_TOKEN');

        return axios.create({
            baseURL: BASE_URL,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
};
    export default API;