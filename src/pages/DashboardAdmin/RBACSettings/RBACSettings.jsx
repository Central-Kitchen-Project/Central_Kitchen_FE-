import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRoles, createRole, updateRole, deleteRole } from "../../../store/roleSlice";
import { fetchDashboardCount } from "../../../store/userSlice";
import PageHeader from "../../../components/common/PageHeader";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

const EMPTY_FORM = { roleName: "", description: "" };

function RBACSettings() {
  const dispatch = useDispatch();
  const { roles: roleList, loading: rolesLoading } = useSelector(
    (state) => state.ROLE || { roles: [], loading: false, error: null }
  );
  const { dashboardCount } = useSelector(
    (state) => state.USER || { dashboardCount: null }
  );

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchAllRoles());
    dispatch(fetchDashboardCount());
  }, [dispatch]);

  const roles = useMemo(() => {
    const roleCounts = dashboardCount?.roleCounts
      ? normalizeArray(dashboardCount.roleCounts)
      : [];
    const countMap = {};
    roleCounts.forEach((rc) => {
      countMap[rc.roleId] = rc.count;
    });

    return roleList.map((r) => ({
      ...r,
      usersCount: countMap[r.id] ?? 0,
    }));
  }, [roleList, dashboardCount]);

  // Filtering
  const filtered = roles.filter((r) => {
    const name = (r.roleName ?? r.name ?? "").toLowerCase();
    const desc = (r.description ?? "").toLowerCase();
    return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRoles = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
      roleName: role.roleName ?? role.name ?? "",
      description: role.description ?? "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRole) {
        await dispatch(updateRole({ id: editingRole.id, data: form })).unwrap();
        showSuccess("Role updated successfully!");
      } else {
        await dispatch(createRole(form)).unwrap();
        showSuccess("Role created successfully!");
      }
      dispatch(fetchAllRoles());
      closeModal();
    } catch {
      showSuccess("Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await dispatch(deleteRole(id)).unwrap();
      showSuccess("Role deleted successfully!");
    } catch {
      showSuccess("Failed to delete role.");
    }
  };

  const totalUsersAssigned = dashboardCount?.totalUsers ?? roles.reduce((a, r) => a + (r.usersCount || 0), 0);

  const displayName = (role) => role.roleName ?? role.name ?? "";

  return (
    <>
      {/* Header */}
      <PageHeader
        as="h2"
        title="RBAC Settings"
        subtitle="Manage system roles and control access permissions by responsibility."
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Users Assigned</span>
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
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
          <div className="relative">
            <span className="material-symbols-outlined text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
            />
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
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-200">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">#</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Role Name</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Description</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Users</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rolesLoading && roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Loading roles...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No roles found.</td>
                  </tr>
                ) : (
                pagedRoles.map((role, idx) => (
                  <tr key={role.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-500">{(safeCurrentPage - 1) * pageSize + idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-800">{displayName(role)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">{role.description || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {role.usersCount} users
                      </span>
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
                        <button
                          onClick={() => handleDelete(role.id)}
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
          {/* Footer with pagination */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 shrink-0">
              <p className="text-sm text-slate-600">
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, filtered.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-800">{filtered.length}</span> roles
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="First page"
                >
                  <span className="material-symbols-outlined text-sm">first_page</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dot-${i}`} className="px-1 text-sm text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[2rem] rounded-lg border border-transparent px-2 py-1.5 text-sm font-semibold transition-colors ${
                          p === safeCurrentPage
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Last page"
                >
                  <span className="material-symbols-outlined text-sm">last_page</span>
                </button>
              </div>
            </div>
          )}
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
                  value={form.roleName}
                  onChange={(e) => setForm({ ...form, roleName: e.target.value })}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="e.g. Warehouse Staff"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  placeholder="Describe the role responsibilities..."
                />
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
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingRole ? "Update Role" : "Create Role"}
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
