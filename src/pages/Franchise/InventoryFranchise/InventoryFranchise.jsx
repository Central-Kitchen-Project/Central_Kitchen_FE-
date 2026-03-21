import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetInventory } from '../../../store/inventorySlice'
import PageHeader from '../../../components/common/PageHeader'

function InventoryFranchise() {
  const dispatch = useDispatch();
  const { listInventory, loading, error } = useSelector((state) => state.INVENTORY);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('USER_INFO'));
    if (userInfo?.id) {
      dispatch(fetchGetInventory(userInfo.id));
    }
  }, [dispatch]);

  const getStatusInfo = (item) => {
    const qty = item.quantity ?? 0;
    const status = item.status?.toLowerCase?.() || '';
    if (status === 'out of stock' || qty <= 0) {
      return { label: 'Out of Stock', color: 'red' };
    }
    if (status === 'low stock' || (qty > 0 && qty <= (item.minThreshold ?? 10))) {
      return { label: 'Low Stock', color: 'orange' };
    }
    return { label: 'In Stock', color: 'green' };
  };

  const filteredInventory = (Array.isArray(listInventory) ? listInventory : []).filter((item) => {
    const name = (item.item?.itemName || item.itemName || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    if (statusFilter === 'All Status') return matchesSearch;
    const { label } = getStatusInfo(item);
    return matchesSearch && label === statusFilter;
  });

  return (
    <main className="flex-1">
    <PageHeader
      as="h2"
      title="Inventory Management"
      subtitle="Monitor franchise branch stock levels and ingredient availability."
      className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md dark:border-slate-800"
      titleClassName="dark:text-white"
      subtitleClassName="dark:text-slate-400"
    />
    <div className="p-8 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 min-w-[300px] items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-transparent focus-within:border-primary/50 transition-all">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-500"
            placeholder="Search inventory items..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {typeof error === 'string' ? error : 'Failed to load inventory data.'}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                      <span className="text-sm">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl">inventory_2</span>
                      <span className="text-sm">No inventory items found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStatusInfo(item);
                  const stockColorClass =
                    status.color === 'red' ? 'text-red-600' :
                    status.color === 'orange' ? 'text-orange-600' : 'text-green-600';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.item?.itemName || item.itemName || `Item #${item.id}`}
                          </span>
                          {item.location && (
                            <span className="text-xs text-slate-500">{item.location.locationName}</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold ${stockColorClass}`}>
                        {item.quantity ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {item.item?.unit || item.unit || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-${status.color}-100 text-${status.color}-700 dark:bg-${status.color}-900/30 dark:text-${status.color}-400`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${status.color}-600`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredInventory.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {filteredInventory.length} entries</p>
          </div>
        )}
      </div>
    </div>
    </main>
  )
}

export default InventoryFranchise