import API from "./api";

const inventoryService = {
  GetAll: function (userId) {
    return API.callWithToken().get(`Inventory?userId=${userId}`);
  },
  GetById: function (id, userId) {
    return API.callWithToken().get(`Inventory/${id}?userId=${userId}`);
  },
  UpdateStock: function (id, quantity, userId) {
    return API.callWithToken().put(`Inventory/${id}?userId=${userId}`, quantity, {
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default inventoryService;
