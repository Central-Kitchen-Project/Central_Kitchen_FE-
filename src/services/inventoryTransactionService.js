import API from "./api";

const inventoryTransactionService = {
  /** @param {number|string|null|undefined} userId - query param theo Swagger GET /InventoryTransaction */
  GetAll: function (userId) {
    const config = {};
    if (userId != null && userId !== "") {
      const n = Number(userId);
      if (Number.isFinite(n) && n > 0) {
        config.params = { userId: n };
      }
    }
    return API.callWithToken().get(`/InventoryTransaction`, config);
  },
  GetById: function (id) {
    return API.callWithToken().get(`/InventoryTransaction/${id}`);
  },
};

export default inventoryTransactionService;
