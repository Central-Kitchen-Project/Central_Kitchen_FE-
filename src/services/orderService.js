import API from "./api";

const orderService = {
  GetAll: function () {
    return API.call().get(`/Order`);
  },
};

export default orderService;