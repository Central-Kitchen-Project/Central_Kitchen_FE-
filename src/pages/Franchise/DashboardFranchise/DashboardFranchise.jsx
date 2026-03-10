import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetOrder } from '../../../store/orderSlice'
import { fetchGetInventory } from '../../../store/inventorySlice'
import { fetchGetAllFeedback } from '../../../store/feedbackSlice'
import './DashboardFranchise.css'

function DashboardFranchise() {
  const dispatch = useDispatch()
  const orders = useSelector(state => state.ORDER.listOrders) || []
  const inventory = useSelector(state => state.INVENTORY.listInventory) || []
  const feedbacks = useSelector(state => state.FEEDBACK.listFeedbacks) || []

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
    if (!userInfo.id) return Array.isArray(orders) ? orders : []
    return (Array.isArray(orders) ? orders : []).filter(o => o.userId === userInfo.id)
  }, [orders, userInfo.id])

  // Order stats
  const totalOrders = myOrders.length
  const pendingOrders = myOrders.filter(o => o.status === 'Pending').length
  const approvedOrders = myOrders.filter(o => o.status === 'Approved').length
  const processingOrders = myOrders.filter(o => o.status === 'Processing').length
  const completedOrders = myOrders.filter(o => o.status === 'Completed').length

  // Inventory stats
  const inventoryArr = Array.isArray(inventory) ? inventory : []
  const lowStockItems = inventoryArr.filter(i => {
    const qty = i.quantity ?? 0
    const threshold = i.minThreshold ?? 10
    return qty > 0 && qty <= threshold
  })
  const outOfStockItems = inventoryArr.filter(i => (i.quantity ?? 0) <= 0)
  const alertItems = [...outOfStockItems, ...lowStockItems].slice(0, 5)

  // Feedback stats
  const feedbackArr = Array.isArray(feedbacks) ? feedbacks : []
  const totalFeedbacks = feedbackArr.length
  const pendingFeedbacks = feedbackArr.filter(f => f.status === 'Received' || f.status === 'UnderReview').length

  // Recent orders (last 6)
  const recentOrders = [...myOrders]
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 6)

  // Recent feedbacks (last 5)
  const recentFeedbacks = [...feedbackArr]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Order status distribution
  const statusDistribution = [
    { label: 'Pending', count: pendingOrders, color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'Approved', count: approvedOrders, color: 'bg-blue-500', text: 'text-blue-600' },
    { label: 'Processing', count: processingOrders, color: 'bg-purple-500', text: 'text-purple-600' },
    { label: 'Completed', count: completedOrders, color: 'bg-green-500', text: 'text-green-600' },
  ]

  // Weekly orders chart data
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - dayOfWeek)
    monday.setHours(0, 0, 0, 0)
    return days.map((label, idx) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + idx)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)
      const dayOrders = myOrders.filter(o => {
        const d = new Date(o.orderDate)
        return d >= date && d < nextDate
      })
      return {
        label,
        total: dayOrders.length,
        pending: dayOrders.filter(o => o.status === 'Pending').length,
        processing: dayOrders.filter(o => o.status === 'Processing' || o.status === 'Approved').length,
        completed: dayOrders.filter(o => o.status === 'Completed').length,
      }
    })
  }, [myOrders])

  const maxWeekly = Math.max(...weeklyData.map(d => d.total), 1)

  // Helpers
  const statusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700'
      case 'Approved': return 'bg-blue-100 text-blue-700'
      case 'Processing': return 'bg-purple-100 text-purple-700'
      case 'Completed': return 'bg-green-100 text-green-700'
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
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="py-5 px-8 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-bold text-slate-900">Franchise Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Welcome back, {userInfo.username || 'User'} — Overview of your store operations
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-slate-50/50">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6">
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
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
              <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                <span className="material-symbols-outlined text-xl">sync</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{approvedOrders + processingOrders}</span>
            <span className="text-sm text-slate-500">{approvedOrders} approved · {processingOrders} processing</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory</span>
              <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{inventoryArr.length}</span>
            <span className="text-sm text-slate-500">
              {lowStockItems.length > 0 || outOfStockItems.length > 0 ? (
                <span className="text-red-500 font-semibold">{lowStockItems.length + outOfStockItems.length} items need attention</span>
              ) : (
                'All items in stock'
              )}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feedbacks</span>
              <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{totalFeedbacks}</span>
            <span className="text-sm text-slate-500">{pendingFeedbacks} awaiting review</span>
          </div>
        </div>

        {/* Weekly Chart + Order Status Distribution */}
        <div className="grid grid-cols-3 gap-6">
          {/* Weekly Orders Chart */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Orders This Week</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-green-500 inline-block" /> Completed</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-500 inline-block" /> In Progress</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-400 inline-block" /> Pending</span>
              </div>
            </div>
            <div className="franchise-chart-container">
              {weeklyData.map((day) => (
                <div key={day.label} className="franchise-chart-bar">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '100%' }}>
                    {day.total > 0 ? (
                      <div className="flex flex-col-reverse w-full rounded-t-md overflow-hidden" style={{ height: `${(day.total / maxWeekly) * 100}%` }}>
                        {day.completed > 0 && <div className="bg-green-500 w-full" style={{ height: `${(day.completed / day.total) * 100}%` }} title={`Completed: ${day.completed}`} />}
                        {day.processing > 0 && <div className="bg-blue-500 w-full" style={{ height: `${(day.processing / day.total) * 100}%` }} title={`In Progress: ${day.processing}`} />}
                        {day.pending > 0 && <div className="bg-amber-400 w-full" style={{ height: `${(day.pending / day.total) * 100}%` }} title={`Pending: ${day.pending}`} />}
                      </div>
                    ) : (
                      <div className="bg-slate-100 w-full rounded-t-md" style={{ height: '4px' }} />
                    )}
                  </div>
                  <div className="franchise-bar-label">{day.label}</div>
                  <div className="text-[11px] text-slate-400 font-bold">{day.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Order Status</span>
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
                    const total = (order.orderLines || []).reduce((s, l) => s + (l.price || 0) * (l.quantity || 0), 0)
                    const totalQty = (order.orderLines || []).reduce((s, l) => s + (l.quantity || 0), 0)
                    const firstItem = order.orderLines?.[0]
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">#PO-{order.id}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {firstItem ? firstItem.name : 'No items'}
                            {(order.orderLines?.length || 0) > 1 && (
                              <span className="text-slate-400"> +{order.orderLines.length - 1} more</span>
                            )}
                          </span>
                          <p className="text-xs text-slate-400">{totalQty} items total</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{total.toLocaleString('vi-VN')}đ</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(order.orderDate)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom: Low Stock Alerts + Recent Feedbacks */}
        <div className="grid grid-cols-2 gap-6">
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