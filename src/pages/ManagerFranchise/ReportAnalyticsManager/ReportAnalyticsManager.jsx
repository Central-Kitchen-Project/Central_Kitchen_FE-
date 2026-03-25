import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetAll } from '../../../store/itemSlice'
import { fetchGetInventory } from '../../../store/inventorySlice'
import { fetchGetMaterialRequest } from '../../../store/materialSlice'
import { fetchAllUsers } from '../../../store/userSlice'
import PageHeader from '../../../components/common/PageHeader'

const ROLE_CENTRAL_KITCHEN = '4'
const ROLE_SUPPLY = '5'
/** Sentinel: aggregate material-request stats for every Central Kitchen user in scope. */
const CENTRAL_USER_ALL = '__all__'

const MATERIAL_CENTRAL_HANDLER_ID_KEYS = [
  'handledByUserId',
  'HandledByUserId',
  'approvedByUserId',
  'ApprovedByUserId',
  'acceptedByUserId',
  'AcceptedByUserId',
  'processedByUserId',
  'ProcessedByUserId',
  'centralKitchenUserId',
  'CentralKitchenUserId',
  'centralUserId',
  'CentralUserId',
  'updatedByUserId',
  'UpdatedByUserId',
  'lastModifiedByUserId',
  'LastModifiedByUserId',
]

const MATERIAL_CENTRAL_HANDLER_NAME_KEYS = [
  'handledByUsername',
  'HandledByUsername',
  'acceptedByUsername',
  'AcceptedByUsername',
  'approvedByUsername',
  'ApprovedByUsername',
]

function handlerIdFromValue(v) {
  if (v == null || v === '') return null
  if (typeof v === 'object') {
    const inner = v.id ?? v.Id ?? v.userId ?? v.UserId
    return inner != null ? String(inner) : null
  }
  return String(v)
}

function scopeHasCentralHandlerMetadata(scoped) {
  return scoped.some((r) => {
    for (const k of MATERIAL_CENTRAL_HANDLER_ID_KEYS) {
      const id = handlerIdFromValue(r[k])
      if (id) return true
    }
    for (const k of MATERIAL_CENTRAL_HANDLER_NAME_KEYS) {
      const n = String(r[k] || '').trim()
      if (n) return true
    }
    return false
  })
}

const TRACKABLE_ROLE_OPTIONS = [
  { value: ROLE_CENTRAL_KITCHEN, label: 'Central Kitchen' },
  { value: ROLE_SUPPLY, label: 'Supply Coordinator' },
]

function formatVnd(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString('en-US')} ₫`
}

function getMaterialRequestDisplayStatus(status) {
  switch (status) {
    case 'Approved':
    case 'Fulfilled':
    case 'Confirmed':
      return 'Confirmed'
    case 'Pending':
    case 'Processing':
      return 'Processing'
    default:
      return status || 'Unknown'
  }
}

function getMaterialStatusBadgeClass(status) {
  const display = getMaterialRequestDisplayStatus(status)
  if (display === 'Confirmed') return 'bg-green-50 text-green-600'
  if (display === 'Processing') return 'bg-blue-50 text-blue-700'
  return 'bg-slate-50 text-slate-500'
}

function isMaterialProcessingOrConfirmed(rawStatus) {
  const d = getMaterialRequestDisplayStatus(rawStatus)
  return d === 'Processing' || d === 'Confirmed'
}

function userRoleId(user) {
  const r = user?.roleId ?? user?.RoleId
  return r != null ? String(r) : ''
}

function userRowId(user) {
  const id = user?.id ?? user?.Id
  return id != null ? String(id) : ''
}

function userDisplayName(user) {
  return (
    user?.username ||
    user?.Username ||
    user?.email ||
    user?.Email ||
    (userRowId(user) ? `User #${userRowId(user)}` : 'User')
  )
}

function materialMatchesCentralUserFilter(mat, userIdStr, userRow) {
  if (!userIdStr || userIdStr === CENTRAL_USER_ALL) return true
  const uid = String(userIdStr)
  for (const k of MATERIAL_CENTRAL_HANDLER_ID_KEYS) {
    const id = handlerIdFromValue(mat[k])
    if (id && id === uid) return true
  }
  const udisp = String(userDisplayName(userRow) || '')
    .trim()
    .toLowerCase()
  if (!udisp) return false
  for (const k of MATERIAL_CENTRAL_HANDLER_NAME_KEYS) {
    const n = String(mat[k] || '')
      .trim()
      .toLowerCase()
    if (n && n === udisp) return true
  }
  return false
}

/** Display label when BE exposes who accepted/handled the request; otherwise em dash. */
function getMaterialAcceptedByDisplay(mat) {
  if (!mat || typeof mat !== 'object') return '—'
  const keys = [
    ...MATERIAL_CENTRAL_HANDLER_NAME_KEYS,
    'acceptedByUsername',
    'AcceptedByUsername',
    'confirmedByUsername',
    'ConfirmedByUsername',
    'processedByUsername',
    'ProcessedByUsername',
    'acceptedBy',
    'AcceptedBy',
    'handledBy',
    'HandledBy',
  ]
  for (const k of keys) {
    const v = mat[k]
    if (v == null || v === '') continue
    if (typeof v === 'object') {
      const name =
        v.username ??
        v.Username ??
        v.name ??
        v.Name ??
        v.email ??
        v.Email
      if (name != null && String(name).trim() !== '') return String(name).trim()
      continue
    }
    const s = String(v).trim()
    if (s) return s
  }
  return '—'
}

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
  const listMaterials = useSelector((state) => state.MATERIAL?.listMaterials) || []
  const materialsLoading = useSelector((state) => state.MATERIAL?.loading)
  const users = useSelector((state) => state.USER?.users) || []
  const userLoading = useSelector((state) => state.USER?.loading)

  const isSupplyRole = selectedRoleId === ROLE_SUPPLY
  const isCentralRole = selectedRoleId === ROLE_CENTRAL_KITCHEN

  useEffect(() => {
    dispatch(fetchGetAll({ type: '', category: '' }))
    dispatch(fetchAllUsers())
  }, [dispatch, itemsVersion])

  const trackableUsers = useMemo(() => {
    const userList = Array.isArray(users) ? users : []

    return userList
      .filter((user) => ['4', '5'].includes(userRoleId(user)))
      .sort((a, b) => {
        const nameA = String(a?.username || a?.email || userRowId(a) || '').toLowerCase()
        const nameB = String(b?.username || b?.email || userRowId(b) || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
  }, [users])

  const availableUsers = useMemo(
    () => trackableUsers.filter((user) => userRoleId(user) === selectedRoleId),
    [trackableUsers, selectedRoleId]
  )

  useEffect(() => {
    if (!trackableUsers.length) return

    const hasRoleOption = trackableUsers.some((user) => userRoleId(user) === selectedRoleId)
    if (!hasRoleOption) {
      setSelectedRoleId(userRoleId(trackableUsers[0]))
    }
  }, [trackableUsers, selectedRoleId])

  useEffect(() => {
    if (!availableUsers.length) {
      setSelectedUserId('')
      return
    }

    const isAllCentral =
      isCentralRole && String(selectedUserId) === CENTRAL_USER_ALL
    const hasSelectedUser =
      isAllCentral ||
      availableUsers.some((user) => userRowId(user) === String(selectedUserId))
    if (!hasSelectedUser) {
      setSelectedUserId(userRowId(availableUsers[0]))
    }
  }, [availableUsers, selectedUserId, isCentralRole])

  useEffect(() => {
    if (!isSupplyRole || !selectedUserId || selectedUserId === CENTRAL_USER_ALL) return
    dispatch(fetchGetInventory(selectedUserId))
  }, [dispatch, isSupplyRole, selectedUserId])

  useEffect(() => {
    if (!isCentralRole || !selectedUserId) return
    dispatch(fetchGetMaterialRequest())
  }, [dispatch, isCentralRole, selectedUserId])

  useEffect(() => {
    setStockPage(1)
  }, [selectedUserId])

  const selectedUser = useMemo(
    () => availableUsers.find((user) => userRowId(user) === String(selectedUserId)) || null,
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
    const quantity = Number(
      inventoryItem?.quantity ?? inventoryItem?.Quantity ?? 0
    )
    const minThreshold = Number(
      inventoryItem?.minThreshold ??
      inventoryItem?.MinThreshold ??
      inventoryItem?.item?.minThreshold ??
      inventoryItem?.Item?.minThreshold ??
      inventoryItem?.item?.minimumThreshold ??
      inventoryItem?.Item?.minimumThreshold ??
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
    const inventoryArr =
      isSupplyRole &&
      selectedUserId &&
      selectedUserId !== CENTRAL_USER_ALL &&
      !inventoryLoading &&
      Array.isArray(listInventory)
        ? listInventory
        : []

    if (!inventoryArr.length) {
      return { totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0, stockItems: [] }
    }

    let inStock = 0
    let lowStock = 0
    let outOfStock = 0

    const stockItems = inventoryArr.map((inventoryItem, index) => {
      const nestedItem = inventoryItem?.item ?? inventoryItem?.Item ?? {}
      const itemId =
        nestedItem?.id ??
        nestedItem?.Id ??
        inventoryItem?.itemId ??
        inventoryItem?.ItemId
      const item = nestedItem && Object.keys(nestedItem).length ? nestedItem : itemById[itemId] || {}
      const quantity = Number(
        inventoryItem?.quantity ?? inventoryItem?.Quantity ?? 0
      )
      const price = Number(
        item?.price ?? item?.Price ?? inventoryItem?.price ?? inventoryItem?.Price ?? 0
      )
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
        name:
          item?.itemName ||
          item?.ItemName ||
          item?.name ||
          item?.Name ||
          inventoryItem?.itemName ||
          inventoryItem?.ItemName ||
          `Item #${itemId ?? index + 1}`,
        quantity,
        unit: item?.unit || item?.Unit || inventoryItem?.unit || inventoryItem?.Unit || '-',
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
  }, [inventoryLoading, listInventory, itemById, selectedUserId, isSupplyRole])

  const centralOps = useMemo(() => {
    const materials = Array.isArray(listMaterials) ? listMaterials : []
    const scoped = materials.filter((r) => isMaterialProcessingOrConfirmed(r.status))

    let working = scoped
    if (
      isCentralRole &&
      selectedUserId &&
      selectedUserId !== CENTRAL_USER_ALL &&
      scopeHasCentralHandlerMetadata(scoped)
    ) {
      working = scoped.filter((r) =>
        materialMatchesCentralUserFilter(r, selectedUserId, selectedUser)
      )
    }

    const processingCount = working.filter(
      (r) => getMaterialRequestDisplayStatus(r.status) === 'Processing'
    ).length
    const confirmedCount = working.filter(
      (r) => getMaterialRequestDisplayStatus(r.status) === 'Confirmed'
    ).length
    const totalScoped = working.length
    const confirmedPct =
      totalScoped > 0 ? Math.round((confirmedCount / totalScoped) * 100) : 0

    const latestMaterials = [...working]
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
      .slice(0, 8)

    return {
      totalScoped,
      processingCount,
      confirmedCount,
      confirmedPct,
      latestMaterials,
    }
  }, [listMaterials, isCentralRole, selectedUserId, selectedUser])

  // Cost Analysis — based on tracked inventory for the current user
  const costData = useMemo(() => {
    if (!stockData.stockItems.length) {
      return { totalInventoryValue: 0, avgCostPerUnit: 0, topItems: [] }
    }

    const pricedItems = stockData.stockItems.filter((item) => item.price > 0)
    const totalInventoryValue = stockData.stockItems.reduce((sum, item) => sum + (item.stockValue || 0), 0)
    const avgCostPerUnit = pricedItems.length
      ? Math.round(pricedItems.reduce((sum, item) => sum + item.price, 0) / pricedItems.length)
      : 0
    const topItems = [...stockData.stockItems]
      .sort((a, b) => (b.stockValue || 0) - (a.stockValue || 0))
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        value: item.stockValue || 0,
        unit: item.unit || 'unit',
      }))

    return { totalInventoryValue, avgCostPerUnit, topItems }
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

  const centralLoading = materialsLoading

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <PageHeader title="Reports & Analytics" subtitle="View reports and analytics." />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-start gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isCentralRole ? 'Material requests' : 'Inventory scope'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {isCentralRole
                  ? 'Only material requests in Processing or Confirmed are included; the percentage is Confirmed divided by the total in that scope.'
                  : 'Select a Supply Coordinator user to load their inventory.'}
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
                    <>
                      {isCentralRole ? (
                        <option value={CENTRAL_USER_ALL}>All</option>
                      ) : null}
                      {availableUsers.map((user) => (
                        <option key={userRowId(user)} value={userRowId(user)}>
                          {userDisplayName(user)}
                        </option>
                      ))}
                    </>
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
              User:{' '}
              {String(selectedUserId) === CENTRAL_USER_ALL
                ? 'All'
                : selectedUser
                  ? userDisplayName(selectedUser)
                  : selectedUserId
                    ? `#${selectedUserId}`
                    : 'Not selected'}
            </span>
          </div>
        </div>

        {isCentralRole ? (
          <div className="space-y-4 animate-fade-in">
            {!selectedUserId ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Select a Central Kitchen account to load material requests.
              </p>
            ) : centralLoading ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-slate-500">
                <span className="material-symbols-outlined mb-2 animate-spin text-3xl">progress_activity</span>
                <p className="text-sm">Loading material requests…</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
                  <div className="relative bg-gradient-to-b from-slate-50/90 via-white to-emerald-50/30 px-5 py-5 sm:px-6 sm:py-6">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          'radial-gradient(ellipse 70% 45% at 50% -15%, rgb(16 185 129 / 0.1), transparent)',
                      }}
                    />
                    <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Confirmed share of scoped requests
                      </p>
                      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
                        {centralOps.confirmedPct}
                        <span className="text-xl font-bold text-slate-400 sm:text-2xl">%</span>
                      </p>
                      <p className="mt-2 text-xs text-slate-600 sm:text-sm">
                        <span className="font-semibold text-emerald-700">{centralOps.confirmedCount}</span>
                        {' confirmed'}
                        <span className="mx-1.5 inline-block h-1 w-1 rounded-full bg-slate-300 align-middle" aria-hidden="true" />
                        <span className="font-semibold text-slate-800">{centralOps.totalScoped}</span>
                        {' total'}
                      </p>
                      <div className="mt-4 w-full">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90 shadow-inner ring-1 ring-slate-200/60">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm transition-all duration-700 ease-out"
                            style={{ width: `${Math.min(100, Math.max(0, centralOps.confirmedPct))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <span className="material-symbols-outlined text-[20px]">assignment</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-xl font-bold tabular-nums text-slate-900">{centralOps.totalScoped}</div>
                        <div className="text-xs font-medium text-slate-500">Total</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-xl font-bold tabular-nums text-slate-900">{centralOps.processingCount}</div>
                        <div className="text-xs font-semibold text-blue-700">Processing</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-xl font-bold tabular-nums text-slate-900">{centralOps.confirmedCount}</div>
                        <div className="text-xs font-medium text-emerald-800">Confirmed</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-bold text-slate-800">Recent material requests</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                          <th className="px-3 py-2">Code / ID</th>
                          <th className="px-3 py-2">Reference order</th>
                          <th className="px-3 py-2">Requested by</th>
                          <th className="px-3 py-2">Accepted by</th>
                          <th className="px-3 py-2">Materials</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {centralOps.latestMaterials.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                              No requests yet
                            </td>
                          </tr>
                        ) : (
                          centralOps.latestMaterials.map((mat, idx) => (
                            <tr key={mat.id || idx}>
                              <td className="px-3 py-2 font-mono">{mat.code || mat.id || '—'}</td>
                              <td className="px-3 py-2">{mat.orderId ? `#ORD-${mat.orderId}` : '—'}</td>
                              <td className="px-3 py-2">{mat.requestedByUsername || mat.requestedBy || '—'}</td>
                              <td className="px-3 py-2 text-slate-600">{getMaterialAcceptedByDisplay(mat)}</td>
                              <td className="px-3 py-2">
                                {mat.items?.length
                                  ? `${mat.items[0].requestedQuantity} ${mat.items[0].unit} ${mat.items[0].materialName}${
                                      mat.items.length > 1 ? ` +${mat.items.length - 1}` : ''
                                    }`
                                  : '—'}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getMaterialStatusBadgeClass(mat.status)}`}
                                >
                                  {getMaterialRequestDisplayStatus(mat.status)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
        <>
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
                  { label: 'Total Stock Value', value: formatVnd(costData.totalInventoryValue) },
                  { label: 'Average Unit Cost', value: formatVnd(costData.avgCostPerUnit) },
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
                          {formatVnd(item.value)}
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
                    <span className="text-lg font-bold text-slate-900">{formatVnd(totalStockValue)}</span>
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
                                    {item.price > 0 ? formatVnd(item.price) : '-'}
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
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
                          <p className="text-sm text-slate-600">
                            Showing{' '}
                            <span className="font-semibold text-slate-800">
                              {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                              {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-slate-800">{filtered.length}</span> items
                          </p>
                          {totalPages > 1 ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={safePage <= 1}
                                onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                                aria-label="Previous page"
                              >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                Previous
                              </button>
                              <span className="text-sm tabular-nums text-slate-600 px-1">
                                Page {safePage} / {totalPages}
                              </span>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={safePage >= totalPages}
                                onClick={() => setStockPage((p) => Math.min(totalPages, p + 1))}
                                aria-label="Next page"
                              >
                                Next
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}

export default ReportAnalyticsManager