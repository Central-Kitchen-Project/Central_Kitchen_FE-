import API from "./api";

const materialService = {
  GetAll: function () {
    return API.call().get(`/MaterialRequest`);
  },
  GetById: function (id) {
    return API.call().get(`MaterialRequest/${id}`);
  },
  GetByOrder: function (orderId) {
    return API.call().get(`MaterialRequest/order/${orderId}`);
  },
  GetOrderMaterials: function (orderId) {
    return API.callWithToken().get(`MaterialRequest/order/${orderId}/materials`);
  },
  Create: function (data) {
    return API.callWithToken().post(`MaterialRequest`, data);
  },
  UpdateStatus: function (id, status) {
    return API.callWithToken().put(`MaterialRequest/${id}/status`, { status });
  },
};

export default materialService;