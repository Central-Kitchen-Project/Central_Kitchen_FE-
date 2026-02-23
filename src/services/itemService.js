import API from "./api";

const itemService = {
  GetAll: function (type = "", category = "") {
    return API.call().get(
      `Item?type=${type}&category=${category}`
    );
  },
};

export default itemService;