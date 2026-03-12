import axios from 'axios';

const BASE_URL = 'http://meinamfpt-001-site1.ltempurl.com/api';

const API = {
    call: function () {
        return axios.create({
            baseURL: BASE_URL,
    });
},
    callWithToken: function (token) {
        if (!token) {
            try {
                const stored = JSON.parse(localStorage.getItem('ACCESS_TOKEN'));
                token = stored?.token || stored;
            } catch {
                token = localStorage.getItem('ACCESS_TOKEN');
            }
        }

        return axios.create({
            baseURL: BASE_URL,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
};
    export default API;