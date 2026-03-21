import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetOrder } from '../../../store/orderSlice'
import { fetchGetInventory } from '../../../store/inventorySlice'
import { fetchGetAllFeedback } from '../../../store/feedbackSlice'
import './DashboardFranchise.css'
import PageHeader from '../../../components/common/PageHeader'

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000

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

function getOrderDisplayStatus(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'approved' || normalizedStatus === 'delivering' || normalizedStatus === 'delivery') {
    return 'delivery'
  }

  if (normalizedStatus === 'filled' || normalizedStatus === 'confirmed') {
    return 'confirmed'
  }

  if (normalizedStatus === 'cancelled by franchise' || normalizedStatus === 'cancelled') return 'cancelled'
  if (normalizedStatus === 'rejected') return 'rejected'

  return normalizedStatus || 'unknown'
}

function formatOrderStatusLabel(status) {
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

function getOrderDateValue(order) {
  const parsedDate = parseUTC(order?.orderDate || order?.createdAt || order?.date)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function getVietnamDayStart(date) {
  const shiftedTime = date.getTime() + VIETNAM_OFFSET_MS
  const shiftedDate = new Date(shiftedTime)
  const utcMidnight = Date.UTC(
    shiftedDate.getUTCFullYear(),
    shiftedDate.getUTCMonth(),
    shiftedDate.getUTCDate()
  )

  return new Date(utcMidnight - VIETNAM_OFFSET_MS)
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function formatChartDateLabel(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    day: 'numeric',
    month: 'numeric',
  }).format(date)
}

function formatChartWeekdayLabel(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIMEZONE,
    weekday: 'short',
  }).format(date)
}

function DashboardFranchise() {
  const dispatch = useDispatch()
  const orders = normalizeCollection(useSelector(state => state.ORDER.listOrders))
  const inventory = normalizeCollection(useSelector(state => state.INVENTORY.listInventory))
  const feedbacks = normalizeCollection(useSelector(state => state.FEEDBACK.listFeedbacks))

  const userInfo = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('USER_INFO')) || {} } catch { return {} }
  }, [])

  useEffect(() => {
    dispatch(fetchGetOrder())
    dispatch(fetchGetAllFeedback())
    if (userInfo.id) dispatch(fetchGetInventory(userInfo.id))
  }, [dispatch, userInfo.id])

  // Filter orders by current user
  const myOrders = useMemo(() => {
    if (!userInfo.id) return orders
    return orders.filter(o => o.userId === userInfo.id)
  }, [orders, userInfo.id])

  const myOrderIds = useMemo(
    () => new Set(myOrders.map(order => Number(order.id)).filter(Number.isFinite)),
    [myOrders]
  )

  const countOrdersByStatus = (status) =>
    myOrders.filter(order => getOrderDisplayStatus(order.status) === status).length

  const totalOrders = myOrders.length
  const pendingOrders = countOrdersByStatus('pending')
  const processingOrders = countOrdersByStatus('processing')
  const confirmedOrders = countOrdersByStatus('confirmed')
  const deliveryOrders = countOrdersByStatus('delivery')
  const completedOrders = countOrdersByStatus('completed')
  const rejectedOrders = countOrdersByStatus('rejected')
  const cancelledOrders = countOrdersByStatus('cancelled')

  // Inventory stats
  const inventoryArr = inventory
  const lowStockItems = inventoryArr.filter(i => {
    const qty = i.quantity ?? 0
    const threshold = i.minThreshold ?? 10
    return qty > 0 && qty <= threshold
  })
  const outOfStockItems = inventoryArr.filter(i => (i.quantity ?? 0) <= 0)
  const alertItems = [...outOfStockItems, ...lowStockItems].slice(0, 5)

  // Feedback stats
  const feedbackArr = useMemo(() => {
    if (!userInfo.id) return feedbacks

    return feedbacks.filter(feedback => {
      const feedbackOrderId = Number(feedback.orderId)
      const feedbackUserId = Number(feedback.userId ?? feedback.createdBy ?? feedback.customerId)

      if (Number.isFinite(feedbackOrderId) && myOrderIds.has(feedbackOrderId)) return true
      if (Number.isFinite(feedbackUserId) && feedbackUserId === Number(userInfo.id)) return true

      return false
    })
  }, [feedbacks, myOrderIds, userInfo.id])
  const totalFeedbacks = feedbackArr.length

  // Recent orders (last 6)
  const recentOrders = [...myOrders]
    .sort((a, b) => (getOrderDateValue(b)?.getTime() || 0) - (getOrderDateValue(a)?.getTime() || 0))
    .slice(0, 6)

  // Recent feedbacks (last 5)
  const recentFeedbacks = [...feedbackArr]
    .sort((a, b) => parseUTC(b.createdAt) - parseUTC(a.createdAt))
    .slice(0, 5)

  // Weekly orders chart data
  const weeklyData = useMemo(() => {
    const now = new Date()
    const anchorDate = getVietnamDayStart(now)
    const rangeStart = addDays(anchorDate, -6)

    return Array.from({ length: 7 }, (_, idx) => {
      const date = addDays(rangeStart, idx)
      const nextDate = addDays(date, 1)

      const dayOrders = myOrders.filter(o => {
        const d = getOrderDateValue(o)
        if (!d) return false
        return d >= date && d < nextDate
      })

      return {
        weekdayLabel: formatChartWeekdayLabel(date),
        dateLabel: formatChartDateLabel(date),
        total: dayOrders.length,
        pending: dayOrders.filter(o => getOrderDisplayStatus(o.status) === 'pending').length,
        processing: dayOrders.filter(o => getOrderDisplayStatus(o.status) === 'processing').length,
        confirmed: dayOrders.filter(o => getOrderDisplayStatus(o.status) === 'confirmed').length,
        delivery: dayOrders.filter(o => getOrderDisplayStatus(o.status) === 'delivery').length,
        completed: dayOrders.filter(o => getOrderDisplayStatus(o.status) === 'completed').length,
        rejected: dayOrders.filter(o => getOrderDisplayStatus(o.status) === 'rejected').length,
        cancelled: dayOrders.filter(o => getOrderDisplayStatus(o.status) === 'cancelled').length,
      }
    })
  }, [myOrders])

  const maxWeekly = Math.max(...weeklyData.map(d => d.total), 1)

  const statusDistribution = [
    { label: 'Pending', count: pendingOrders, color: 'bg-red-400', text: 'text-red-600' },
    { label: 'Processing', count: processingOrders, color: 'bg-blue-500', text: 'text-blue-600' },
    { label: 'Confirmed', count: confirmedOrders, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { label: 'Delivery', count: deliveryOrders, color: 'bg-violet-500', text: 'text-violet-600' },
    { label: 'Completed', count: completedOrders, color: 'bg-green-500', text: 'text-green-600' },
    { label: 'Rejected', count: rejectedOrders, color: 'bg-slate-500', text: 'text-slate-600' },
    { label: 'Cancelled', count: cancelledOrders, color: 'bg-rose-400', text: 'text-rose-600' },
  ]

  // Helpers
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

  const feedbackStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-700'
      case 'UnderReview': return 'bg-blue-100 text-blue-700'
      case 'Received': return 'bg-slate-200 text-slate-600'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return parseUTC(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <PageHeader
        title="Franchise Dashboard"
        subtitle={`Welcome back, ${userInfo.username || 'User'} - overview of your store operations.`}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-slate-50/50">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Orders</span>
              <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-xl">shopping_bag</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{totalOrders}</span>
            <span className="text-sm text-slate-500">{pendingOrders} pending · {completedOrders} completed</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processing Orders</span>
              <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-xl">sync</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{processingOrders}</span>
            <span className="text-sm text-slate-500">Kitchen is preparing your orders</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Orders</span>
              <div className="size-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                <span className="material-symbols-outlined text-xl">local_shipping</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{deliveryOrders}</span>
            <span className="text-sm text-slate-500">Orders on the way to your store</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Alerts</span>
              <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{lowStockItems.length + outOfStockItems.length}</span>
            <span className="text-sm text-slate-500">
              {lowStockItems.length > 0 || outOfStockItems.length > 0 ? 'Items need attention' : 'All items in stock'}
            </span>
          </div>
        </div>

        {/* Weekly Chart + Order Status Distribution */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Weekly Orders Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Orders Last 7 Days</span>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-green-500 inline-block" /> Completed</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500 inline-block" /> Confirmed</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-violet-500 inline-block" /> Delivery</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-500 inline-block" /> Processing</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-400 inline-block" /> Pending</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-slate-500 inline-block" /> Rejected</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-rose-400 inline-block" /> Cancelled</span>
              </div>
            </div>
            <div className="franchise-chart-container">
              {weeklyData.map((day) => (
                <div key={`${day.weekdayLabel}-${day.dateLabel}`} className="franchise-chart-bar">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '100%' }}>
                    {day.total > 0 ? (
                      <div className="flex flex-col-reverse w-full rounded-t-md overflow-hidden" style={{ height: `${(day.total / maxWeekly) * 100}%` }}>
                        {day.completed > 0 && <div className="bg-green-500 w-full" style={{ height: `${(day.completed / day.total) * 100}%` }} title={`Completed: ${day.completed}`} />}
                        {day.confirmed > 0 && <div className="bg-emerald-500 w-full" style={{ height: `${(day.confirmed / day.total) * 100}%` }} title={`Confirmed: ${day.confirmed}`} />}
                        {day.delivery > 0 && <div className="bg-violet-500 w-full" style={{ height: `${(day.delivery / day.total) * 100}%` }} title={`Delivery: ${day.delivery}`} />}
                        {day.processing > 0 && <div className="bg-blue-500 w-full" style={{ height: `${(day.processing / day.total) * 100}%` }} title={`Processing: ${day.processing}`} />}
                        {day.pending > 0 && <div className="bg-red-400 w-full" style={{ height: `${(day.pending / day.total) * 100}%` }} title={`Pending: ${day.pending}`} />}
                        {day.rejected > 0 && <div className="bg-slate-500 w-full" style={{ height: `${(day.rejected / day.total) * 100}%` }} title={`Rejected: ${day.rejected}`} />}
                        {day.cancelled > 0 && <div className="bg-rose-400 w-full" style={{ height: `${(day.cancelled / day.total) * 100}%` }} title={`Cancelled: ${day.cancelled}`} />}
                      </div>
                    ) : (
                      <div className="bg-slate-100 w-full rounded-t-md" style={{ height: '4px' }} />
                    )}
                  </div>
                  <div className="franchise-bar-label">{day.weekdayLabel}</div>
                  <div className="text-[11px] font-semibold text-slate-400">{day.dateLabel}</div>
                  <div className="text-[11px] text-slate-400 font-bold">{day.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Order Status</span>
              <span className="text-xs font-medium text-slate-400">All Orders</span>
            </div>
            <div className="p-6 flex flex-col gap-5">
              {statusDistribution.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{s.label}</span>
                    <span className={`text-sm font-bold ${s.text}`}>{s.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${s.color} h-2 rounded-full transition-all`}
                      style={{ width: totalOrders > 0 ? `${(s.count / totalOrders) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
              {totalOrders === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No orders yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
            <span className="text-base font-semibold text-slate-900">Recent Orders</span>
            <span className="text-xs text-slate-400">{totalOrders} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl">shopping_bag</span>
                        <span className="text-sm">No orders yet</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(order => {
                    const orderLines = normalizeCollection(order.orderLines)
                    const total = orderLines.reduce((s, l) => s + (l.price || 0) * (l.quantity || 0), 0)
                    const totalQty = orderLines.reduce((s, l) => s + (l.quantity || 0), 0)
                    const firstItem = orderLines[0]
                    const displayStatus = getOrderDisplayStatus(order.status)
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">#PO-{order.id}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {firstItem ? firstItem.name : 'No items'}
                            {orderLines.length > 1 && (
                              <span className="text-slate-400"> +{orderLines.length - 1} more</span>
                            )}
                          </span>
                          <p className="text-xs text-slate-400">{totalQty} items total</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{total.toLocaleString('vi-VN')}đ</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColor(displayStatus)}`}>
                            {formatOrderStatusLabel(displayStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(order.orderDate || order.createdAt || order.date)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom: Low Stock Alerts + Recent Feedbacks */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
              <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
              <span className="text-base font-semibold text-slate-900">Low Stock Alerts</span>
              {alertItems.length > 0 && (
                <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {lowStockItems.length + outOfStockItems.length}
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {alertItems.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-green-400">check_circle</span>
                    <span className="text-sm">All inventory items are well-stocked</span>
                  </div>
                </div>
              ) : (
                alertItems.map(item => {
                  const qty = item.quantity ?? 0
                  const isOut = qty <= 0
                  return (
                    <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {item.item?.itemName || item.itemName || `Item #${item.id}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.item?.unit || item.unit || '-'}
                          {item.location?.locationName && ` · ${item.location.locationName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className={`text-sm font-bold ${isOut ? 'text-red-600' : 'text-orange-600'}`}>
                          {qty}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isOut ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-red-600 animate-pulse' : 'bg-orange-600'}`} />
                          {isOut ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Recent Feedbacks */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Recent Feedbacks</span>
              <span className="text-xs text-slate-400">{totalFeedbacks} total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {recentFeedbacks.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                    <span className="text-sm">No feedbacks yet</span>
                  </div>
                </div>
              ) : (
                recentFeedbacks.map(fb => (
                  <div key={fb.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{fb.subject || 'No subject'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${feedbackStatusColor(fb.status)}`}>
                          {fb.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(fb.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        fb.category === 'Quality' ? 'bg-amber-100 text-amber-700' :
                        fb.category === 'Delivery' ? 'bg-orange-100 text-orange-700' :
                        fb.category === 'Packaging' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {fb.category}
                      </span>
                      {fb.orderId && <span className="text-xs text-slate-400">Order #{fb.orderId}</span>}
                    </div>
                    {fb.description && (
                      <p className="text-xs text-slate-500 mt-1 truncate italic">"{fb.description}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardFranchise