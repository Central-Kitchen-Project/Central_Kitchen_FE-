import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";

const TABS = ["Central Kitchens", "Franchise Stores"];

const INITIAL_KITCHENS = [
  { id: 1, name: "Central Kitchen #1", location: "Downtown, City A", capacity: "5000 units/day", manager: "John Doe", status: "Active" },
  { id: 2, name: "Central Kitchen #2", location: "Midtown, City B", capacity: "3000 units/day", manager: "Jane Smith", status: "Active" },
];

const INITIAL_STORES = [
  { id: 1, name: "Franchise Store #1", location: "District 1, HCM", manager: "Nguyen Van A", phone: "0901234567", status: "Active" },
  { id: 2, name: "Franchise Store #2", location: "District 7, HCM", manager: "Tran Thi B", phone: "0912345678", status: "Active" },
  { id: 3, name: "Franchise Store #3", location: "Cau Giay, Hanoi", manager: "Le Van C", phone: "0923456789", status: "Inactive" },
];

const EMPTY_KITCHEN = { name: "", location: "", capacity: "", manager: "" };
const EMPTY_STORE = { name: "", location: "", manager: "", phone: "" };

function MasterAdmin() {
  const [activeTab, setActiveTab] = useState(0);
  const [kitchens, setKitchens] = useState(INITIAL_KITCHENS);
  const [stores, setStores] = useState(INITIAL_STORES);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [kitchenForm, setKitchenForm] = useState(EMPTY_KITCHEN);
  const [storeForm, setStoreForm] = useState(EMPTY_STORE);
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  /* Kitchen CRUD */
  const openCreateKitchen = () => {
    setEditingItem(null);
    setKitchenForm(EMPTY_KITCHEN);
    setShowModal(true);
  };
  const openEditKitchen = (k) => {
    setEditingItem(k);
    setKitchenForm({ name: k.name, location: k.location, capacity: k.capacity, manager: k.manager });
    setShowModal(true);
  };
  const handleKitchenSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setKitchens((prev) => prev.map((k) => (k.id === editingItem.id ? { ...k, ...kitchenForm } : k)));
      showSuccess("Kitchen updated successfully!");
    } else {
      const newId = kitchens.length ? Math.max(...kitchens.map((k) => k.id)) + 1 : 1;
      setKitchens((prev) => [...prev, { id: newId, ...kitchenForm, status: "Active" }]);
      showSuccess("Kitchen created successfully!");
    }
    setShowModal(false);
  };
  const deleteKitchen = (id) => {
    if (!window.confirm("Delete this kitchen?")) return;
    setKitchens((prev) => prev.filter((k) => k.id !== id));
    showSuccess("Kitchen deleted.");
  };

  /* Store CRUD */
  const openCreateStore = () => {
    setEditingItem(null);
    setStoreForm(EMPTY_STORE);
    setShowModal(true);
  };
  const openEditStore = (s) => {
    setEditingItem(s);
    setStoreForm({ name: s.name, location: s.location, manager: s.manager, phone: s.phone });
    setShowModal(true);
  };
  const handleStoreSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setStores((prev) => prev.map((s) => (s.id === editingItem.id ? { ...s, ...storeForm } : s)));
      showSuccess("Store updated successfully!");
    } else {
      const newId = stores.length ? Math.max(...stores.map((s) => s.id)) + 1 : 1;
      setStores((prev) => [...prev, { id: newId, ...storeForm, status: "Active" }]);
      showSuccess("Store created successfully!");
    }
    setShowModal(false);
  };
  const deleteStore = (id) => {
    if (!window.confirm("Delete this store?")) return;
    setStores((prev) => prev.filter((s) => s.id !== id));
    showSuccess("Store deleted.");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <>
      {/* Header */}
      <PageHeader
        as="h2"
        title="Master Data Management"
        subtitle="Maintain central kitchen and franchise store records used across the system."
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Central Kitchens</span>
              <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-base">soup_kitchen</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{kitchens.length}</span>
            <span className="text-[11px] text-slate-500">Registered kitchens</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Franchise Stores</span>
              <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined text-base">storefront</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{stores.length}</span>
            <span className="text-[11px] text-slate-500">Registered stores</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Locations</span>
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-base">location_on</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {kitchens.filter((k) => k.status === "Active").length + stores.filter((s) => s.status === "Active").length}
            </span>
            <span className="text-[11px] text-slate-500">Currently operating</span>
          </div>
        </div>

        {/* Success */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* Tabs + Add Button */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <div className="flex gap-1">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === idx
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={activeTab === 0 ? openCreateKitchen : openCreateStore}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {activeTab === 0 ? "Add Kitchen" : "Add Store"}
          </button>
        </div>

        {/* Table: Central Kitchens */}
        {activeTab === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">#</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Kitchen Name</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Location</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Capacity</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Manager</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kitchens.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No kitchens found.</td></tr>
                  ) : (
                    kitchens.map((k, idx) => (
                      <tr key={k.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 text-xs text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800">{k.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{k.location}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{k.capacity}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{k.manager}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            k.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            ● {k.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditKitchen(k)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => deleteKitchen(k.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
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
            <div className="px-4 py-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Showing {kitchens.length} kitchens</span>
            </div>
          </div>
        )}

        {/* Table: Franchise Stores */}
        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">#</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Store Name</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Location</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Manager</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Phone</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No stores found.</td></tr>
                  ) : (
                    stores.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 text-xs text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800">{s.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{s.location}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{s.manager}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{s.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            ● {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditStore(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => deleteStore(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
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
            <div className="px-4 py-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Showing {stores.length} stores</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Kitchen */}
      {showModal && activeTab === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">{editingItem ? "Edit Kitchen" : "Add Central Kitchen"}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleKitchenSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kitchen Name</label>
                  <input type="text" required value={kitchenForm.name} onChange={(e) => setKitchenForm({ ...kitchenForm, name: e.target.value })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                  <input type="text" required value={kitchenForm.location} onChange={(e) => setKitchenForm({ ...kitchenForm, location: e.target.value })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Capacity</label>
                  <input type="text" required value={kitchenForm.capacity} onChange={(e) => setKitchenForm({ ...kitchenForm, capacity: e.target.value })} placeholder="e.g. 5000 units/day" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Manager</label>
                  <input type="text" required value={kitchenForm.manager} onChange={(e) => setKitchenForm({ ...kitchenForm, manager: e.target.value })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors">{editingItem ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Store */}
      {showModal && activeTab === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">{editingItem ? "Edit Store" : "Add Franchise Store"}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleStoreSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Store Name</label>
                  <input type="text" required value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                  <input type="text" required value={storeForm.location} onChange={(e) => setStoreForm({ ...storeForm, location: e.target.value })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Manager</label>
                  <input type="text" required value={storeForm.manager} onChange={(e) => setStoreForm({ ...storeForm, manager: e.target.value })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
                  <input type="text" required value={storeForm.phone} onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors">{editingItem ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MasterAdmin;