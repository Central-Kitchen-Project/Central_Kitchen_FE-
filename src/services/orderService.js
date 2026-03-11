import API from "./api";

const orderService = {
  GetAll: function () {
    return API.call().get("Order");
  },
  GetById: function (id) {
    return API.call().get(`Order/${id}`);
  },
  Create: function (data) {
    return API.callWithToken().post("Order", data);
  },
  UpdateStatus: function (id, status) {
    return API.callWithToken().put(`Order/${id}/status`, { status });
  },
  Delete: function (id) {
    return API.callWithToken().delete(`Order/${id}`);
  },
};

export default orderService;