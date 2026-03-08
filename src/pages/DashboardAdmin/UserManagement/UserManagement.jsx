import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, createUser, updateUser, deleteUser } from "../../../store/userSlice";

const ROLE_MAP = {
  1: "Admin",
  2: "Manager",
  3: "Central Kitchen",
  4: "Franchise",
  5: "Supplier",
};

const ROLE_COLORS = {
  1: "bg-red-50 text-red-700",
  2: "bg-violet-50 text-violet-700",
  3: "bg-blue-50 text-blue-700",
  4: "bg-emerald-50 text-emerald-700",
  5: "bg-amber-50 text-amber-700",
};

const EMPTY_FORM = { username: "", email: "", password: "", roleId: 4, phone: "", address: "" };

function UserManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.USER);

  const [userInfo, setUserInfo] = useState({ username: "Admin User", roleId: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("USER_INFO"));
      if (stored) setUserInfo(stored);
    } catch (e) {}
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("USER_INFO");
    navigate("/SignIn");
  };

  /* Filtering */
  const filtered = users.filter((u) => {
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
      phone: user.phone || "",
      address: user.address || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await dispatch(updateUser({ id: editingUser.id, data: payload })).unwrap();
      } else {
        await dispatch(createUser(form)).unwrap();
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
    try {
      await dispatch(deleteUser(id)).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — identical to DashboardAdmin */}
      <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shrink-0 shadow-sm">
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex items-center gap-3">
            <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 text-sm font-bold leading-tight uppercase tracking-wider">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">
                Management System
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 grow">
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              to="/DashboardAdmin"
            >
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-primary font-semibold"
              to="/UserManagement"
            >
              <span className="material-symbols-outlined text-[22px]">group</span>
              <span className="text-sm">User Management</span>
            </Link>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">lock</span>
              <span className="text-sm font-medium">RBAC Settings</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">tune</span>
              <span className="text-sm font-medium">System Configuration</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">database</span>
              <span className="text-sm font-medium">Master Data</span>
            </a>
          </nav>
          <div className="mt-auto border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="size-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold border border-slate-200">
                {userInfo.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-slate-900 text-xs font-bold truncate">{userInfo.username}</span>
                <span className="text-slate-500 text-[10px] font-medium">Administrator</span>
              </div>
              <span
                onClick={handleLogout}
                className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors"
                title="Logout"
              >
                logout
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
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
              <span className="text-2xl font-bold text-slate-900">{users.length}</span>
              <span className="text-[11px] text-slate-500">All accounts</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</span>
                <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {users.filter((u) => u.status === true || u.status === "Active").length}
              </span>
              <span className="text-[11px] text-slate-500">Active accounts</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admins</span>
                <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                  <span className="material-symbols-outlined text-base">shield_person</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {users.filter((u) => u.roleId === 1).length}
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
                {users.filter((u) => u.roleId === 4).length}
              </span>
              <span className="text-[11px] text-slate-500">Franchise accounts</span>
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {typeof error === "string" ? error : "An error occurred."}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">#</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Name</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Email</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Phone</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Role</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                        Loading users...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
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
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                              user.status === true || user.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            ● {user.status === true || user.status === "Active" ? "Active" : "Inactive"}
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
                Showing {filtered.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>
      </main>

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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
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
    </div>
  );
}

export default UserManagement;
