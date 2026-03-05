import API from "./api";

const feedbackService = {
  GetAll: function () {
    return API.callWithToken().get(`/Feedback`);
  },
  GetById: function (id) {
    return API.callWithToken().get(`/Feedback/${id}`);
  },
  GetByOrderId: function (orderId) {
    return API.callWithToken().get(`/Feedback/order/${orderId}`);
  },
  GetByStatus: function (status) {
    return API.callWithToken().get(`/Feedback/status/${status}`);
  },
  Create: function (data) {
    return API.callWithToken().post(`/Feedback`, data);
  },
  Delete: function (id) {
    return API.callWithToken().delete(`/Feedback/${id}`);
  },
  UpdateStatus: function (id, statusData) {
    return API.callWithToken().put(`/Feedback/${id}/status`, statusData);
  },
};

export default feedbackService;
