import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, fetchDashboardCount } from "../../../store/userSlice";

const PERMISSIONS = [
  "Dashboard",
  "User Management",
  "Order Management",
  "Inventory Management",
  "Production Management",
  "Reports & Analytics",
  "System Configuration",
  "Master Data",
];

const ROLE_DESCRIPTIONS = {
  Admin: "System administrator with full access to all modules and settings.",
  Manager: "Can manage inventory, production schedules, and view reports & analytics.",
  "Central Kitchen": "Receives and processes orders from franchise stores, manages materials and production.",
  Franchise: "Can create orders, track deliveries, view inventory and submit feedback.",
  "Supply Coordinator": "Aggregates orders, coordinates production and distribution, manages delivery schedules.",
};

const DEFAULT_ROLE_PERMISSIONS = {
  1: PERMISSIONS,
  2: ["Dashboard", "Inventory Management", "Production Management", "Reports & Analytics"],
  3: ["Dashboard", "Order Management", "Inventory Management"],
  4: ["Dashboard", "Order Management", "Inventory Management", "Production Management"],
  5: ["Dashboard", "Order Management", "Inventory Management", "Production Management"],
};

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

const EMPTY_FORM = { name: "", description: "", permissions: [] };

function RBACSettings() {
  const dispatch = useDispatch();
  const { users, dashboardCount, loading } = useSelector((state) => state.USER || { users: [], dashboardCount: null, loading: false });

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [expandedRole, setExpandedRole] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchDashboardCount());
  }, [dispatch]);

  const userList = Array.isArray(users) ? users : normalizeArray(users);

  // Derive roles from real user data
  const roles = useMemo(() => {
    const roleCounts = dashboardCount?.roleCounts
      ? normalizeArray(dashboardCount.roleCounts)
      : [];

    // Build a map of roleId -> { name, count } from users
    const roleMap = {};
    userList.forEach((u) => {
      if (u.roleId && !roleMap[u.roleId]) {
        roleMap[u.roleId] = { id: u.roleId, name: u.roleName || `Role ${u.roleId}`, usersCount: 0 };
      }
      if (u.roleId) roleMap[u.roleId].usersCount++;
    });

    // Merge with dashboard count data (more accurate)
    roleCounts.forEach((rc) => {
      if (roleMap[rc.roleId]) {
        roleMap[rc.roleId].usersCount = rc.count;
      } else {
        roleMap[rc.roleId] = { id: rc.roleId, name: rc.roleName || `Role ${rc.roleId}`, usersCount: rc.count };
      }
    });

    return Object.values(roleMap)
      .sort((a, b) => a.id - b.id)
      .map((r) => ({
        ...r,
        description: ROLE_DESCRIPTIONS[r.name] || "",
        editable: false,
      }));
  }, [userList, dashboardCount]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openCreate = () => {
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      description: role.description,
      permissions: rolePermissions[role.id] || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setForm(EMPTY_FORM);
  };

  const togglePermission = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRole) {
      setRolePermissions((prev) => ({ ...prev, [editingRole.id]: form.permissions }));
      showSuccess("Role permissions updated successfully!");
    } else {
      showSuccess("Role created successfully!");
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const role = roles.find((r) => r.id === id);
    if (role && !role.editable) return;
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    const updated = { ...rolePermissions };
    delete updated[id];
    setRolePermissions(updated);
    showSuccess("Role deleted successfully!");
  };

  const totalUsersAssigned = dashboardCount?.totalUsers ?? roles.reduce((a, r) => a + r.usersCount, 0);

  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
        <h2 className="text-lg font-bold text-slate-900">RBAC Settings</h2>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Roles</span>
              <div className="size-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                <span className="material-symbols-outlined text-base">shield</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{roles.length}</span>
            <span className="text-[11px] text-slate-500">Defined roles</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Permissions</span>
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-base">key</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{PERMISSIONS.length}</span>
            <span className="text-[11px] text-slate-500">Module permissions</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Users Assigned</span>
              <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined text-base">group</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalUsersAssigned}</span>
            <span className="text-[11px] text-slate-500">Across all roles</span>
          </div>
        </div>

        {/* Success */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Role Management</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Configure roles and their permissions</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Role
          </button>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Role Name</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Description</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Users</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Permissions</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Loading roles...</td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No roles found.</td>
                  </tr>
                ) : (
                roles.map((role) => (
                  <React.Fragment key={role.id}>
                    <tr className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-800">{role.name}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">{role.description}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {role.usersCount} users
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          {(rolePermissions[role.id] || []).length} permissions
                          <span className="material-symbols-outlined text-[14px]">
                            {expandedRole === role.id ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(role)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {role.editable !== false && (
                            <button
                              onClick={() => handleDelete(role.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRole === role.id && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 bg-slate-50">
                          <div className="flex flex-wrap gap-2">
                            {(rolePermissions[role.id] || []).map((perm) => (
                              <span
                                key={perm}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700"
                              >
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                {perm}
                              </span>
                            ))}
                            {(rolePermissions[role.id] || []).length === 0 && (
                              <span className="text-xs text-slate-400">No permissions assigned</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Showing {roles.length} roles
            </span>
          </div>
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingRole ? "Edit Role" : "Add New Role"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="e.g. Warehouse Staff"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  placeholder="Describe the role responsibilities..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        form.permissions.includes(perm)
                          ? "border-primary bg-blue-50 text-primary"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="sr-only"
                      />
                      <span className="material-symbols-outlined text-[16px]">
                        {form.permissions.includes(perm) ? "check_box" : "check_box_outline_blank"}
                      </span>
                      <span className="text-xs font-medium">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default RBACSettings;
