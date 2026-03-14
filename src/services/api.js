import axios from 'axios';

const BASE_URL = 'http://meinamfpt-001-site1.ltempurl.com/api';

const getMessageFromPayload = (payload) => {
    if (!payload) return "";
    if (typeof payload === 'string') return payload;

    return (
        payload.message ||
        payload.notification ||
        payload.title ||
        payload.data?.message ||
        payload.data?.notification ||
        payload.data?.title ||
        payload.error ||
        ""
    );
};

export const extractApiMessage = (payload, fallback = "") => {
    return getMessageFromPayload(payload) || fallback;
};

export const extractApiErrorMessage = (error, fallback = 'Có lỗi xảy ra') => {
    return (
        getMessageFromPayload(error?.response?.data) ||
        getMessageFromPayload(error?.data) ||
        error?.message ||
        fallback
    );
};

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