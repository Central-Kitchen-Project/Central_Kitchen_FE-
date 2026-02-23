import API from "./api";

const materialService = {
  GetAll: function () {
    return API.call().get(`/MaterialRequest`);
  },
};

export default materialService;