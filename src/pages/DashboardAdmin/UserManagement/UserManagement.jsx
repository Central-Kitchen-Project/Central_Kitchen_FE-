import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, createUser, updateUser, deleteUser, clearUserError } from "../../../store/userSlice";

const ROLE_MAP = {
  1: "Admin",
  2: "Manager",
  3: "Franchise Store",
  4: "Central Kitchen",
  5: "Supply Coordinator",
};

const ROLE_COLORS = {
  1: "bg-red-50 text-red-700",
  2: "bg-violet-50 text-violet-700",
  3: "bg-blue-50 text-blue-700",
  4: "bg-emerald-50 text-emerald-700",
  5: "bg-amber-50 text-amber-700",
};

const EMPTY_FORM = { username: "", email: "", password: "", roleId: 4 };

function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.USER);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  /* Filtering */
  const userList = Array.isArray(users) ? users : [];
  const filtered = userList.filter((u) => {
    const matchSearch =
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? String(u.roleId) === roleFilter : true;
    return matchSearch && matchRole;
  });

  /* Modal helpers */
  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username || "",
      email: user.email || "",
      password: "",
      roleId: user.roleId || 4,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    dispatch(clearUserError());
    try {
      if (editingUser) {
        const payload = {
          username: form.username,
          email: form.email,
          roleId: form.roleId,
          password: form.password || null,
        };
        await dispatch(updateUser({ id: editingUser.id, data: payload })).unwrap();
        showSuccess("User updated successfully!");
      } else {
        await dispatch(createUser({
          username: form.username,
          password: form.password,
          email: form.email,
          roleId: form.roleId,
        })).unwrap();
        showSuccess("User created successfully!");
      }
      closeModal();
      dispatch(fetchAllUsers());
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    dispatch(clearUserError());
    try {
      await dispatch(deleteUser(id)).unwrap();
      showSuccess("User deleted successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Main Content */}
      {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
          <h2 className="text-lg font-bold text-slate-900">User Management</h2>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <span className="material-symbols-outlined text-base">group</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">{userList.length}</span>
              <span className="text-[11px] text-slate-500">All accounts</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admins</span>
                <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                  <span className="material-symbols-outlined text-base">shield_person</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {userList.filter((u) => u.roleId === 1).length}
              </span>
              <span className="text-[11px] text-slate-500">Admin accounts</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Franchise</span>
                <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined text-base">storefront</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {userList.filter((u) => u.roleId === 3).length}
              </span>
              <span className="text-[11px] text-slate-500">Franchise accounts</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supply Coordinator</span>
                <div className="size-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                  <span className="material-symbols-outlined text-base">local_shipping</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {userList.filter((u) => u.roleId === 5).length}
              </span>
              <span className="text-[11px] text-slate-500">Coordinator accounts</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">All Roles</option>
                {Object.entries(ROLE_MAP).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add New User
            </button>
          </div>

          {/* Success */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {successMsg}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">#</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Name</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Email</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Phone</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Role</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                        Loading users...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 text-xs text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {(user.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-slate-800">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{user.email}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{user.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${ROLE_COLORS[user.roleId] || "bg-slate-100 text-slate-600"}`}>
                            {ROLE_MAP[user.roleId] || `Role ${user.roleId}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(user)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer info */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Showing {filtered.length} of {userList.length} users
              </span>
            </div>
          </div>
        </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {editingUser ? "New Password (optional)" : "Password"}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                  <select
                    value={form.roleId}
                    onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    {Object.entries(ROLE_MAP).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
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
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserManagement;
