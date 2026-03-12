import API from "./api";

const roleService = {
  getAllRoles: function () {
    return API.callWithToken().get("Role");
  },
  getRoleById: function (id) {
    return API.callWithToken().get(`Role/${id}`);
  },
  createRole: function (data) {
    return API.callWithToken().post("Role", data);
  },
  updateRole: function (id, data) {
    return API.callWithToken().put(`Role/${id}`, data);
  },
  deleteRole: function (id) {
    return API.callWithToken().delete(`Role/${id}`);
  },
};

export default roleService;
