import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetOrder } from '../../../store/orderSlice'
import { fetchGetMaterialRequest } from '../../../store/materialSlice'
import { fetchGetAll } from '../../../store/itemSlice'
import './DashboardSupplier.css'

function DashboardSupplier() {
  const dispatch = useDispatch()
  const orders = useSelector(state => state.ORDER.listOrders) || []
  const materials = useSelector(state => state.MATERIAL.listMaterials) || []
  const items = useSelector(state => state.ITEM.listItems) || []

  useEffect(() => {
    dispatch(fetchGetOrder())
    dispatch(fetchGetMaterialRequest())
    dispatch(fetchGetAll({ type: '', category: '' }))
  }, [dispatch])

  // Stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending').length
  const processingOrders = orders.filter(o => o.status?.toLowerCase() === 'processing').length
  const completedOrders = orders.filter(o => o.status?.toLowerCase() === 'completed').length

  const totalMaterialRequests = materials.length
  const pendingMaterials = materials.filter(m => m.status?.toLowerCase() === 'pending').length
  const fulfilledMaterials = materials.filter(m => m.status?.toLowerCase() === 'fulfilled').length

  // Recent orders (last 5)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5)
  }, [orders])

  // Recent material requests (last 5)
  const recentMaterials = useMemo(() => {
    return [...materials]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [materials])

  // Weekly material requests chart
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

      const dayReqs = materials.filter(m => {
        const d = new Date(m.createdAt)
        return d >= dayStart && d < dayEnd
      })

      return {
        label,
        total: dayReqs.length,
        fulfilled: dayReqs.filter(m => m.status?.toLowerCase() === 'fulfilled').length,
        pending: dayReqs.filter(m => m.status?.toLowerCase() === 'pending').length,
        approved: dayReqs.filter(m => m.status?.toLowerCase() === 'approved').length,
      }
    })
  }, [materials])

  const maxReqs = Math.max(...weeklyData.map(d => d.total), 1)

  // Top requested materials
  const topMaterials = useMemo(() => {
    const map = {}
    materials.forEach(m => {
      (m.items || []).forEach(item => {
        const key = item.materialName || 'Unknown'
        if (!map[key]) map[key] = { name: key, unit: item.unit, totalQty: 0, count: 0 }
        map[key].totalQty += item.requestedQuantity || 0
        map[key].count += 1
      })
    })
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty).slice(0, 6)
  }, [materials])

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-red-100 text-red-700'
      case 'approved': return 'bg-purple-100 text-purple-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'fulfilled': return 'bg-green-100 text-green-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Supply Coordinator Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Overview of orders, material requests and logistics</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-slate-50/50">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{totalOrders}</span>
            <span className="text-sm text-slate-500">{pendingOrders} pending · {completedOrders} completed</span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Material Requests</span>
              <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{totalMaterialRequests}</span>
            <span className="text-sm text-slate-500">{pendingMaterials} pending · {fulfilledMaterials} fulfilled</span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processing</span>
              <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <span className="material-symbols-outlined text-xl">sync</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{processingOrders}</span>
            <span className="text-sm text-slate-500">Orders in progress</span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Items</span>
              <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined text-xl">category</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-slate-900">{items.length}</span>
            <span className="text-sm text-slate-500">
              {items.filter(i => i.type?.toLowerCase() === 'nguyen lieu').length} raw · {items.filter(i => i.type?.toLowerCase() === 'thanh pham').length} finished
            </span>
          </div>
        </div>

        {/* Chart + Top Materials */}
        <div className="grid grid-cols-2 gap-6">
          {/* Weekly Material Requests Chart */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Material Requests This Week</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-green-500 inline-block" /> Fulfilled</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-400 inline-block" /> Pending</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-purple-400 inline-block" /> Approved</span>
              </div>
            </div>
            <div className="chart-container">
              {weeklyData.map((day) => (
                <div key={day.label} className="chart-bar">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '100%' }}>
                    {day.total > 0 ? (
                      <div className="flex flex-col-reverse w-full rounded-t-md overflow-hidden" style={{ height: `${(day.total / maxReqs) * 100}%` }}>
                        {day.fulfilled > 0 && <div className="bg-green-500 w-full" style={{ height: `${(day.fulfilled / day.total) * 100}%` }} title={`Fulfilled: ${day.fulfilled}`} />}
                        {day.approved > 0 && <div className="bg-purple-400 w-full" style={{ height: `${(day.approved / day.total) * 100}%` }} title={`Approved: ${day.approved}`} />}
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
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
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
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-semibold text-slate-700">{mat.name}</span>
                          <span className="text-sm font-bold text-slate-900">{mat.totalQty.toLocaleString()} {mat.unit}</span>
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
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
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
                  return (
                    <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-slate-900">#PO-{order.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {order.username} · {firstItem ? `${firstItem.name} x${firstItem.quantity}` : 'No items'}
                          {(order.orderLines?.length || 0) > 1 && ` +${order.orderLines.length - 1} more`}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-bold text-slate-900">{total.toLocaleString('vi-VN')}đ</p>
                        <p className="text-xs text-slate-400">{formatDate(order.orderDate)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Recent Material Requests */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-900">Recent Material Requests</span>
              <span className="text-xs text-slate-400">{materials.length} total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {recentMaterials.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No requests yet</p>
              ) : (
                recentMaterials.map(req => (
                  <div key={req.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-slate-900">#{req.id}</span>
                        <span className="text-xs text-slate-500">Order #{req.orderId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(req.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-xs text-slate-500">{req.requestedByUsername} ·</span>
                      <span className="text-xs text-slate-600 font-medium truncate">
                        {(req.items || []).map(i => `${i.materialName} (${i.requestedQuantity}${i.unit})`).join(', ')}
                      </span>
                    </div>
                    {req.note && <p className="text-xs text-slate-400 mt-1 italic truncate">"{req.note}"</p>}
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

export default DashboardSupplier