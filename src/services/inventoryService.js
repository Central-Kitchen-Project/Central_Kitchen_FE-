import API from "./api";

const inventoryService = {
  GetAll: function (userId) {
    return API.call().get(`/Inventory?userId=${userId}`);
  },
  GetById: function (id, userId) {
    return API.call().get(`/Inventory/${id}?userId=${userId}`);
  },
  UpdateStock: function (id, quantity, userId) {
    return API.call().put(`/Inventory/${id}?userId=${userId}`, quantity, {
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default inventoryService;
