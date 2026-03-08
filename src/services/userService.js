import API from "./api";

const userService = {
  getAllUsers: function () {
    return API.callWithToken().get("User");
  },
  getUserById: function (id) {
    return API.callWithToken().get(`User/${id}`);
  },
  createUser: function (data) {
    return API.callWithToken().post("User", data);
  },
  updateUser: function (id, data) {
    return API.callWithToken().put(`User/${id}`, data);
  },
  deleteUser: function (id) {
    return API.callWithToken().delete(`User/${id}`);
  },
};

export default userService;
