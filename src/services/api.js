import axios from 'axios';

const API = {
    call: function () {
        return axios.create({
            baseURL: 'http://meinamfpt-001-site1.ltempurl.com/api/',
    });
},
    callWithToken: function (token) {
        if (!token) token = localStorage.getItem('ACCESS_TOKEN');

        return axios.create({
            baseURL: 'http://meinamfpt-001-site1.ltempurl.com/api/',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
};
    export default API;