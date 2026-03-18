import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetOrder } from '../../../store/orderSlice'
import { fetchGetMaterialRequest } from '../../../store/materialSlice'
import { fetchGetAll } from '../../../store/itemSlice'
import './DashboardSupplier.css'
import PageHeader from '../../../components/common/PageHeader'

function parseUTC(dateStr) {
  if (!dateStr) return new Date(NaN)
  let s = String(dateStr)
  if (!/Z|[+-]\d{2}:\d{2}$/.test(s)) s += 'Z'
  return new Date(s)
}

function normalizeCollection(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.$values)) return data.$values
  if (data && typeof data === 'object') {
    const arrayValue = Object.values(data).find(Array.isArray)
    if (arrayValue) return arrayValue

    const wrappedArrayValue = Object.values(data).find(value => Array.isArray(value?.$values))
    if (wrappedArrayValue?.$values) return wrappedArrayValue.$values
  }
  return []
}

function getOrderDisplayStatus(status, hasInventoryReady = false) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'approved' || normalizedStatus === 'delivery' || normalizedStatus === 'delivering') {
    return 'delivery'
  }

  if (normalizedStatus === 'processing' && hasInventoryReady) return 'confirmed'
  if (normalizedStatus === 'confirmed' || normalizedStatus === 'filled') return 'confirmed'
  if (normalizedStatus.includes('cancel')) return 'cancelled'
  if (normalizedStatus.includes('reject')) return 'rejected'

  return normalizedStatus || 'unknown'
}

function getMaterialRequestDisplayStatus(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'fulfilled' || normalizedStatus === 'confirmed' || normalizedStatus === 'approved') {
    return 'confirmed'
  }

  if (normalizedStatus === 'pending' || normalizedStatus === 'processing') {
    return 'processing'
  }

  if (normalizedStatus.includes('cancel') || normalizedStatus.includes('reject')) {
    return 'rejected'
  }

  return normalizedStatus || 'unknown'
}

function formatStatusLabel(status) {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'processing':
      return 'Processing'
    case 'confirmed':
      return 'Confirmed'
    case 'delivery':
      return 'Delivery'
    case 'completed':
      return 'Completed'
    case 'rejected':
      return 'Rejected'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status || 'Unknown'
  }
}

function getMeaningfulNote(note) {
  const normalizedNote = String(note || '').trim().replace(/^["']+|["']+$/g, '')

  if (!normalizedNote) return ''
  if (normalizedNote.toLowerCase() === 'string') return ''

  return normalizedNote
}

function DashboardSupplier() {
  const dispatch = useDispatch()
  const ordersRaw = useSelector(state => state.ORDER.listOrders)
  const materialsRaw = useSelector(state => state.MATERIAL.listMaterials)
  const orders = normalizeCollection(ordersRaw)
  const materials = normalizeCollection(materialsRaw)

  useEffect(() => {
    dispatch(fetchGetOrder())
    dispatch(fetchGetMaterialRequest())
    dispatch(fetchGetAll({ type: '', category: '' }))
  }, [dispatch])

  const readyOrderIds = useMemo(() => {
    const readyIds = materials
      .filter(req => getMaterialRequestDisplayStatus(req.status) === 'confirmed')
      .map(req => req.orderId)
      .filter(Boolean)

    return new Set(readyIds)
  }, [materials])

  const countOrdersByStatus = (status) =>
    orders.filter(order => getOrderDisplayStatus(order.status, readyOrderIds.has(order.id)) === status).length

  const totalOrders = orders.length
  const pendingOrders = countOrdersByStatus('pending')
  const processingOrders = countOrdersByStatus('processing')
  const confirmedOrders = countOrdersByStatus('confirmed')
  const deliveryOrders = countOrdersByStatus('delivery')

  const totalMaterialRequests = materials.length
  const processingMaterials = materials.filter(m => getMaterialRequestDisplayStatus(m.status) === 'processing').length
  const confirmedMaterials = materials.filter(m => getMaterialRequestDisplayStatus(m.status) === 'confirmed').length

  // Recent orders (last 5)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => parseUTC(b.orderDate) - parseUTC(a.orderDate))
      .slice(0, 5)
  }, [orders])

  // Recent material requests (last 5)
  const recentMaterials = useMemo(() => {
    return [...materials]
      .sort((a, b) => parseUTC(b.createdAt) - parseUTC(a.createdAt))
      .slice(0, 5)
  }, [materials])

  // Weekly order chart by current supply workflow statuses
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)

    return days.map((label, idx) => {
      const dayStart = new Date(monday)
      dayStart.setDate(monday.getDate() + idx)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayStart.getDate() + 1)

      const dayOrders = orders.filter(order => {
        const d = parseUTC(order.orderDate)
        return d >= dayStart && d < dayEnd
      })

      const countByStatus = status =>
        dayOrders.filter(order => getOrderDisplayStatus(order.status, readyOrderIds.has(order.id)) === status).length

      return {
        label,
        total: dayOrders.length,
        pending: countByStatus('pending'),
        processing: countByStatus('processing'),
        confirmed: countByStatus('confirmed'),
        delivery: countByStatus('delivery'),
        completed: countByStatus('completed'),
        rejected: countByStatus('rejected'),
        cancelled: countByStatus('cancelled'),
      }
    })
  }, [orders, readyOrderIds])

  const maxOrders = Math.max(...weeklyData.map(d => d.total), 1)

  // Top requested materials
  const topMaterials = useMemo(() => {
    const map = {}
    materials.forEach(m => {
      normalizeCollection(m.items).forEach(item => {
        const key = item.materialName || 'Unknown'
        if (!map[key]) map[key] = { name: key, unit: item.unit, totalQty: 0, count: 0 }
        map[key].totalQty += item.requestedQuantity || 0
        map[key].count += 1
      })
    })
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty).slice(0, 6)
  }, [materials])

  const statusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'confirmed': return 'bg-emerald-100 text-emerald-700'
      case 'delivery': return 'bg-violet-100 text-violet-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-slate-100 text-slate-700'
      case 'cancelled': return 'bg-rose-100 text-rose-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return parseUTC(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <PageHeader
        title="Supply Coordinator Dashboard"
        subtitle="Overview of orders, material requests, and logistics."
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 xl:p-8">
        <div className="flex flex-col gap-6 xl:gap-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4">
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{totalOrders}</span>
            <span className="text-sm text-slate-500 break-words">{pendingOrders} pending · {deliveryOrders} delivery</span>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-400">Material Requests</span>
              <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{totalMaterialRequests}</span>
            <span className="text-sm text-slate-500 break-words">{processingMaterials} processing · {confirmedMaterials} confirmed</span>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed Orders</span>
              <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined text-xl">verified</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{confirmedOrders}</span>
            <span className="text-sm text-slate-500 break-words">Inventory ready for dispatch</span>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-400">Processing Orders</span>
              <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-xl">sync</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{processingOrders}</span>
            <span className="text-sm text-slate-500 break-words">Orders waiting on fulfillment</span>
          </div>
        </div>

        {/* Chart + Top Materials */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Weekly Orders Chart */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="dashboard-supplier-chart-header flex justify-between px-6 py-4 border-b border-slate-200">
              <span className="shrink-0 text-base font-semibold text-slate-900">Orders This Week</span>
              <div className="dashboard-supplier-chart-legend flex items-center gap-4 text-xs flex-wrap">
                <span className="dashboard-supplier-legend-item flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-400 inline-block" /> Pending</span>
                <span className="dashboard-supplier-legend-item flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-400 inline-block" /> Processing</span>
                <span className="dashboard-supplier-legend-item flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-400 inline-block" /> Confirmed</span>
                <span className="dashboard-supplier-legend-item flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-violet-400 inline-block" /> Delivery</span>
                <span className="dashboard-supplier-legend-item flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-green-500 inline-block" /> Completed</span>
                <span className="dashboard-supplier-legend-item flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-slate-500 inline-block" /> Rejected</span>
                <span className="dashboard-supplier-legend-item flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-rose-400 inline-block" /> Cancelled</span>
              </div>
            </div>
            <div className="chart-container">
              {weeklyData.map((day) => (
                <div key={day.label} className="chart-bar">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '100%' }}>
                    {day.total > 0 ? (
                      <div className="flex flex-col-reverse w-full rounded-t-md overflow-hidden" style={{ height: `${(day.total / maxOrders) * 100}%` }}>
                        {day.completed > 0 && <div className="bg-green-500 w-full" style={{ height: `${(day.completed / day.total) * 100}%` }} title={`Completed: ${day.completed}`} />}
                        {day.delivery > 0 && <div className="bg-violet-400 w-full" style={{ height: `${(day.delivery / day.total) * 100}%` }} title={`Delivery: ${day.delivery}`} />}
                        {day.confirmed > 0 && <div className="bg-emerald-400 w-full" style={{ height: `${(day.confirmed / day.total) * 100}%` }} title={`Confirmed: ${day.confirmed}`} />}
                        {day.rejected > 0 && <div className="bg-slate-500 w-full" style={{ height: `${(day.rejected / day.total) * 100}%` }} title={`Rejected: ${day.rejected}`} />}
                        {day.cancelled > 0 && <div className="bg-rose-400 w-full" style={{ height: `${(day.cancelled / day.total) * 100}%` }} title={`Cancelled: ${day.cancelled}`} />}
                        {day.processing > 0 && <div className="bg-blue-400 w-full" style={{ height: `${(day.processing / day.total) * 100}%` }} title={`Processing: ${day.processing}`} />}
                        {day.pending > 0 && <div className="bg-red-400 w-full" style={{ height: `${(day.pending / day.total) * 100}%` }} title={`Pending: ${day.pending}`} />}
                      </div>
                    ) : (
                      <div className="bg-slate-100 w-full rounded-t-md" style={{ height: '4px' }} />
                    )}
                  </div>
                  <div className="bar-label">{day.label}</div>
                  <div className="text-[11px] text-slate-400 font-bold">{day.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Requested Materials */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="dashboard-supplier-section-header flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Top Requested Materials</span>
              <span className="text-xs text-slate-400">{materials.length} total requests</span>
            </div>
            <div className="p-6">
              {topMaterials.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No data</p>
              ) : (
                <div className="space-y-4">
                  {topMaterials.map((mat, idx) => {
                    const maxQty = topMaterials[0]?.totalQty || 1
                    return (
                      <div key={idx} className="min-w-0">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-sm font-semibold text-slate-700">{mat.name}</span>
                          <span className="shrink-0 text-sm font-bold text-slate-900">{mat.totalQty.toLocaleString()} {mat.unit}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(mat.totalQty / maxQty) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 inline-block">{mat.count} requests</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders + Recent Material Requests */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Recent Orders */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="dashboard-supplier-section-header flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Recent Orders</span>
              <span className="text-xs text-slate-400">{orders.length} total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No orders yet</p>
              ) : (
                recentOrders.map(order => {
                  const total = (order.orderLines || []).reduce((s, l) => s + (l.price || 0) * (l.quantity || 0), 0)
                  const firstItem = order.orderLines?.[0]
                  const displayStatus = getOrderDisplayStatus(order.status, readyOrderIds.has(order.id))
                  const itemSummary = firstItem ? `${firstItem.name} x${firstItem.quantity}` : 'No items'
                  return (
                    <div key={order.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-sm font-bold text-slate-900">#PO-{order.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(displayStatus)}`}>
                            {formatStatusLabel(displayStatus)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500 truncate">{order.username}</p>
                        <p className="mt-1 text-xs text-slate-600 truncate">
                          {itemSummary}
                          {(order.orderLines?.length || 0) > 1 && ` +${order.orderLines.length - 1} more`}
                        </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-slate-900">{total.toLocaleString('vi-VN')}đ</p>
                          <p className="mt-1 text-xs text-slate-400">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Recent Material Requests */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="dashboard-supplier-section-header flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Recent Material Requests</span>
              <span className="text-xs text-slate-400">{materials.length} total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {recentMaterials.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No requests yet</p>
              ) : (
                recentMaterials.map(req => {
                  const note = getMeaningfulNote(req.note)

                  return (
                  <div key={req.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                        <span className="text-sm font-bold text-slate-900">#{req.id}</span>
                        <span className="text-xs text-slate-500">Order #{req.orderId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(getMaterialRequestDisplayStatus(req.status))}`}>
                          {formatStatusLabel(getMaterialRequestDisplayStatus(req.status))}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500 truncate">{req.requestedByUsername}</p>
                      <p className="mt-1 text-xs text-slate-600 truncate">
                        {normalizeCollection(req.items).map(i => `${i.materialName} (${i.requestedQuantity}${i.unit})`).join(', ')}
                      </p>
                      {note ? <p className="mt-1 truncate text-xs italic text-slate-400">{note}</p> : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-400">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSupplier