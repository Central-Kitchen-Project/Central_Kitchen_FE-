import API from "./api";

const inventoryTransactionService = {
  GetAll: function () {
    return API.call().get(`/InventoryTransaction`);
  },
  GetById: function (id) {
    return API.call().get(`/InventoryTransaction/${id}`);
  },
};

export default inventoryTransactionService;
