import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetAll } from '../../../store/itemSlice'
import { fetchGetInventory } from '../../../store/inventorySlice'
import { fetchAllUsers } from '../../../store/userSlice'
import PageHeader from '../../../components/common/PageHeader'

const TRACKABLE_ROLE_OPTIONS = [
  { value: '4', label: 'Central Kitchen' },
  { value: '5', label: 'Supply Coordinator' },
]

function ReportAnalyticsManager() {
  const [activeReport, setActiveReport] = useState('cost')
  const [stockFilter, setStockFilter] = useState('All')
  const [stockPage, setStockPage] = useState(1)
  const [selectedRoleId, setSelectedRoleId] = useState('4')
  const [selectedUserId, setSelectedUserId] = useState('')
  const ITEMS_PER_PAGE = 6
  const dispatch = useDispatch()

  const listItems = useSelector((state) => state.ITEM.listItems) || []
  const itemsVersion = useSelector((state) => state.ITEM.itemsVersion ?? 0)
  const listInventory = useSelector((state) => state.INVENTORY.listInventory) || []
  const inventoryLoading = useSelector((state) => state.INVENTORY.loading)
  const users = useSelector((state) => state.USER?.users) || []
  const userLoading = useSelector((state) => state.USER?.loading)

  useEffect(() => {
    dispatch(fetchGetAll({ type: '', category: '' }))
    dispatch(fetchAllUsers())
  }, [dispatch, itemsVersion])

  const trackableUsers = useMemo(() => {
    const userList = Array.isArray(users) ? users : []

    return userList
      .filter((user) => ['4', '5'].includes(String(user?.roleId)))
      .sort((a, b) => {
        const nameA = String(a?.username || a?.email || a?.id || '').toLowerCase()
        const nameB = String(b?.username || b?.email || b?.id || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
  }, [users])

  const availableUsers = useMemo(
    () => trackableUsers.filter((user) => String(user?.roleId) === selectedRoleId),
    [trackableUsers, selectedRoleId]
  )

  useEffect(() => {
    if (!trackableUsers.length) return

    const hasRoleOption = trackableUsers.some((user) => String(user?.roleId) === selectedRoleId)
    if (!hasRoleOption) {
      setSelectedRoleId(String(trackableUsers[0].roleId))
    }
  }, [trackableUsers, selectedRoleId])

  useEffect(() => {
    if (!availableUsers.length) {
      setSelectedUserId('')
      return
    }

    const hasSelectedUser = availableUsers.some((user) => String(user?.id) === String(selectedUserId))
    if (!hasSelectedUser) {
      setSelectedUserId(String(availableUsers[0].id))
    }
  }, [availableUsers, selectedUserId])

  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchGetInventory(selectedUserId))
    }
  }, [dispatch, selectedUserId])

  useEffect(() => {
    setStockPage(1)
  }, [selectedUserId])

  const selectedUser = useMemo(
    () => availableUsers.find((user) => String(user?.id) === String(selectedUserId)) || null,
    [availableUsers, selectedUserId]
  )

  const selectedRoleLabel = useMemo(
    () => TRACKABLE_ROLE_OPTIONS.find((role) => role.value === selectedRoleId)?.label || 'Inventory User',
    [selectedRoleId]
  )

  const itemById = useMemo(() => {
    const map = {}
    const itemsArr = Array.isArray(listItems) ? listItems : []
    itemsArr.forEach((item) => {
      if (item?.id) map[item.id] = item
    })
    return map
  }, [listItems])

  const getInventoryStatus = (inventoryItem) => {
    const quantity = Number(inventoryItem?.quantity ?? 0)
    const minThreshold = Number(
      inventoryItem?.minThreshold ??
      inventoryItem?.item?.minThreshold ??
      inventoryItem?.item?.minimumThreshold ??
      10
    )
    const rawStatus = String(inventoryItem?.status || '').toLowerCase()

    if (rawStatus.includes('out')) return 'Out of Stock'
    if (rawStatus.includes('low')) return 'Low Stock'
    if (rawStatus.includes('in')) return 'In Stock'
    if (quantity <= 0) return 'Out of Stock'
    if (quantity <= minThreshold) return 'Low Stock'
    return 'In Stock'
  }

  const stockData = useMemo(() => {
    const inventoryArr = selectedUserId && !inventoryLoading && Array.isArray(listInventory)
      ? listInventory
      : []

    if (!inventoryArr.length) {
      return { totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0, stockItems: [] }
    }

    let inStock = 0
    let lowStock = 0
    let outOfStock = 0

    const stockItems = inventoryArr.map((inventoryItem, index) => {
      const itemId = inventoryItem?.item?.id || inventoryItem?.itemId
      const item = inventoryItem?.item || itemById[itemId] || {}
      const quantity = Number(inventoryItem?.quantity ?? 0)
      const price = Number(item?.price ?? inventoryItem?.price ?? 0)
      const status = getInventoryStatus(inventoryItem)

      if (status === 'Out of Stock') {
        outOfStock++
      } else if (status === 'Low Stock') {
        lowStock++
      } else {
        inStock++
      }

      return {
        id: inventoryItem?.id || itemId || index,
        name: item?.itemName || item?.name || inventoryItem?.itemName || `Item #${itemId ?? index + 1}`,
        quantity,
        unit: item?.unit || inventoryItem?.unit || '-',
        status,
        price,
        stockValue: quantity * price,
      }
    })

    stockItems.sort((a, b) => {
      const order = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 }
      return (order[a.status] ?? 4) - (order[b.status] ?? 4)
    })

    return { totalItems: inventoryArr.length, inStock, lowStock, outOfStock, stockItems }
  }, [inventoryLoading, listInventory, itemById, selectedUserId])

  // Cost Analysis — based on tracked inventory for the current user
  const costData = useMemo(() => {
    if (!stockData.stockItems.length) {
      return { totalInventoryValue: 0, avgCostPerUnit: 0, highValueItems: 0, totalSKUs: 0, topItems: [] }
    }

    const pricedItems = stockData.stockItems.filter((item) => item.price > 0)
    const totalInventoryValue = stockData.stockItems.reduce((sum, item) => sum + (item.stockValue || 0), 0)
    const avgCostPerUnit = pricedItems.length
      ? Math.round(pricedItems.reduce((sum, item) => sum + item.price, 0) / pricedItems.length)
      : 0
    const highValueItems = pricedItems.filter((item) => item.price > 100000).length
    const totalSKUs = stockData.totalItems
    const topItems = [...stockData.stockItems]
      .sort((a, b) => (b.stockValue || 0) - (a.stockValue || 0))
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        value: item.stockValue || 0,
        unit: item.unit || 'unit',
      }))

    return { totalInventoryValue, avgCostPerUnit, highValueItems, totalSKUs, topItems }
  }, [stockData])

  const totalStockValue = costData.totalInventoryValue
  const riskRatio = stockData.totalItems > 0 ? (stockData.outOfStock + stockData.lowStock) / stockData.totalItems : 0
  const riskLevel = riskRatio > 0.5 ? 'High' : riskRatio > 0.2 ? 'Medium' : 'Low'
  const riskColor = riskLevel === 'High' ? 'text-red-600' : riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'

  const trackedItems = stockData.totalItems
  const stockHealthPct = trackedItems > 0 ? Math.round((stockData.inStock / trackedItems) * 100) : 0

  const statusBadge = (status) => {
    switch (status) {
      case 'Out of Stock': return 'bg-red-100 text-red-700'
      case 'Low Stock': return 'bg-amber-100 text-amber-700'
      case 'In Stock': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Track inventory value and stock health by selected central kitchen or supply user."
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-start gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Inventory Tracking Scope</p>
              <p className="mt-1 text-sm text-slate-500">
                Choose a `Central Kitchen` or `Supply Coordinator` user to load inventory via their `userId`.
              </p>
            </div>
            <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </span>
                <select
                  value={selectedRoleId}
                  onChange={(event) => setSelectedRoleId(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {TRACKABLE_ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </span>
                <select
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  disabled={userLoading || !availableUsers.length}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {!availableUsers.length ? (
                    <option value="">
                      {userLoading ? 'Loading users...' : `No ${selectedRoleLabel.toLowerCase()} users`}
                    </option>
                  ) : (
                    availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username || user.email || `User #${user.id}`}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              Role: {selectedRoleLabel}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
              User: {selectedUser?.username || selectedUser?.email || (selectedUserId ? `#${selectedUserId}` : 'Not selected')}
            </span>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveReport('cost')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeReport === 'cost'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base align-middle mr-1.5">analytics</span>
            Cost Analysis
          </button>
          <button
            onClick={() => setActiveReport('waste')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeReport === 'waste'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base align-middle mr-1.5">inventory</span>
            Inventory Stock Report
          </button>
        </div>

        {/* Cost Analysis Report */}
        {activeReport === 'cost' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Material Cost Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Inventory Value Summary</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5 space-y-0">
                {[
                  { label: 'Total Stock Value', value: `${costData.totalInventoryValue.toLocaleString('vi-VN')}đ` },
                  { label: 'Average Unit Cost', value: `${costData.avgCostPerUnit.toLocaleString('vi-VN')}đ` },
                  { label: 'High-Value SKUs (>100k/unit)', value: costData.highValueItems },
                  { label: 'Tracked SKUs', value: costData.totalSKUs },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-lg font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Most Valuable Items */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Top 5 Highest Stock Value Items</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Item</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costData.topItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                            {item.name}
                          </div>
                        </td>
                        <td className="py-3 text-sm font-semibold text-slate-900 text-right">
                          {item.value.toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Stock Report */}
        {activeReport === 'waste' && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">Total Items</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stockData.totalItems}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">In Stock</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{stockData.inStock}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">warning</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">Low Stock</span>
                </div>
                <span className="text-2xl font-bold text-amber-600">{stockData.lowStock}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">error</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">Out of Stock</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stockData.outOfStock}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inventory Overview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Inventory Overview</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Total Stock Value</span>
                    <span className="text-lg font-bold text-slate-900">{totalStockValue.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Risk Level</span>
                    <span className={`text-lg font-bold ${riskColor}`}>{riskLevel}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-slate-500">Stock Health</span>
                    <span className={`text-lg font-bold ${stockHealthPct >= 70 ? 'text-emerald-600' : stockHealthPct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {stockHealthPct}%
                    </span>
                  </div>
                  {/* Stock health bar */}
                  {trackedItems > 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(stockData.inStock / trackedItems) * 100}%` }} />
                      <div className="bg-amber-400 h-full" style={{ width: `${(stockData.lowStock / trackedItems) * 100}%` }} />
                      <div className="bg-red-500 h-full" style={{ width: `${(stockData.outOfStock / trackedItems) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* All Inventory Items */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-800">Inventory Stock Details</h3>
                  <div className="flex items-center gap-2">
                    {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((f) => (
                      <button
                        key={f}
                        onClick={() => { setStockFilter(f); setStockPage(1) }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          stockFilter === f
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const filtered = stockFilter === 'All'
                    ? stockData.stockItems
                    : stockData.stockItems.filter((s) => s.status === stockFilter)
                  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
                  const safePage = Math.min(stockPage, totalPages)
                  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
                  return (
                    <>
                      <div className="overflow-x-auto flex-1">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Item</th>
                              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Qty</th>
                              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Unit</th>
                              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Price</th>
                              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventoryLoading ? (
                              <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                  <p className="mt-1">Loading inventory...</p>
                                </td>
                              </tr>
                            ) : paged.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">No items found</td>
                              </tr>
                            ) : (
                              paged.map((item) => (
                                <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                  <td className="px-5 py-3 text-sm font-medium text-slate-700">{item.name}</td>
                                  <td className={`px-5 py-3 text-sm font-bold text-right ${item.status === 'Out of Stock' ? 'text-red-600' : item.status === 'Low Stock' ? 'text-amber-600' : 'text-slate-900'}`}>
                                    {item.quantity}
                                  </td>
                                  <td className="px-5 py-3 text-sm text-slate-500 text-center">{item.unit}</td>
                                  <td className="px-5 py-3 text-sm text-slate-700 text-right">
                                    {item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : '-'}
                                  </td>
                                  <td className="px-5 py-3 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(item.status)}`}>
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination */}
                      {!inventoryLoading && filtered.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                              disabled={safePage <= 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-base">chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                onClick={() => setStockPage(p)}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                                  p === safePage
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                            <button
                              onClick={() => setStockPage((p) => Math.min(totalPages, p + 1))}
                              disabled={safePage >= totalPages}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportAnalyticsManager