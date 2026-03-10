import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetAll } from '../../store/itemSlice'
import { fetchGetOrder } from '../../store/orderSlice'
import './DashboardManager.css'

function DashboardManager() {
  const dispatch = useDispatch()
  const items = useSelector(state => state.ITEM.listItems) || []
  const orders = useSelector(state => state.ORDER.listOrders) || []

  useEffect(() => {
    dispatch(fetchGetAll({ type: '', category: '' }))
    dispatch(fetchGetOrder())
  }, [dispatch])

  // Stats
  const totalItems = items.length
  const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending').length
  // "Low stock" = Nguyen Lieu items (raw materials) — simple heuristic
  const lowStockItems = items.filter(i => i.type?.toLowerCase() === 'nguyen lieu').length

  // Weekly order chart — group orders from the last 7 days by day of week
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    // Get the Monday of the current week
    const dayOfWeek = now.getDay() // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)

    const weekOrders = days.map((label, idx) => {
      const dayStart = new Date(monday)
      dayStart.setDate(monday.getDate() + idx)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayStart.getDate() + 1)

      const dayOrders = orders.filter(o => {
        const d = new Date(o.orderDate)
        return d >= dayStart && d < dayEnd
      })

      return {
        label,
        total: dayOrders.length,
        completed: dayOrders.filter(o => o.status?.toLowerCase() === 'completed').length,
        pending: dayOrders.filter(o => o.status?.toLowerCase() === 'pending').length,
        approved: dayOrders.filter(o => o.status?.toLowerCase() === 'approved').length,
        processing: dayOrders.filter(o => o.status?.toLowerCase() === 'processing').length,
      }
    })
    return weekOrders
  }, [orders])

  const maxOrders = Math.max(...weeklyData.map(d => d.total), 1)

  // Key Metrics derived from orders
  const metrics = useMemo(() => {
    if (orders.length === 0) return { completionRate: 0, pendingRate: 0, avgItems: 0, totalRevenue: 0 }
    const completed = orders.filter(o => o.status?.toLowerCase() === 'completed').length
    const completionRate = ((completed / orders.length) * 100).toFixed(1)
    const pendingRate = ((orders.filter(o => o.status?.toLowerCase() === 'pending').length / orders.length) * 100).toFixed(1)
    const totalLines = orders.reduce((sum, o) => sum + (o.orderLines?.length || 0), 0)
    const avgItems = (totalLines / orders.length).toFixed(1)
    const totalRevenue = orders.reduce((sum, o) => {
      return sum + (o.orderLines || []).reduce((s, line) => s + (line.price || 0) * (line.quantity || 0), 0)
    }, 0)
    return { completionRate, pendingRate, avgItems, totalRevenue }
  }, [orders])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Monitor key metrics and order activity</p>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Inventory</span>
          <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            <span className="material-symbols-outlined text-lg">inventory_2</span>
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{totalItems}</span>
        <span className="text-[11px] text-slate-500">Total items</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
          <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{pendingOrders}</span>
        <span className="text-[11px] text-slate-500">Awaiting approval</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw Materials</span>
          <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
            <span className="material-symbols-outlined text-lg">science</span>
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{lowStockItems}</span>
        <span className="text-[11px] text-slate-500">Items</span>
      </div>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-2 gap-4">
      {/* Chart - Weekly Orders by Status */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Orders This Week</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500 inline-block" /> Completed</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-400 inline-block" /> Pending</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-purple-400 inline-block" /> Approved</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-400 inline-block" /> Processing</span>
          </div>
        </div>
        <div className="chart-container">
          {weeklyData.map((day) => (
            <div key={day.label} className="chart-bar">
              <div className="relative w-full flex flex-col justify-end" style={{ height: '100%' }}>
                {day.total > 0 ? (
                  <div className="flex flex-col-reverse w-full rounded-t-md overflow-hidden" style={{ height: `${(day.total / maxOrders) * 100}%` }}>
                    {day.completed > 0 && <div className="bg-green-500 w-full" style={{ height: `${(day.completed / day.total) * 100}%` }} title={`Completed: ${day.completed}`} />}
                    {day.processing > 0 && <div className="bg-blue-400 w-full" style={{ height: `${(day.processing / day.total) * 100}%` }} title={`Processing: ${day.processing}`} />}
                    {day.approved > 0 && <div className="bg-purple-400 w-full" style={{ height: `${(day.approved / day.total) * 100}%` }} title={`Approved: ${day.approved}`} />}
                    {day.pending > 0 && <div className="bg-red-400 w-full" style={{ height: `${(day.pending / day.total) * 100}%` }} title={`Pending: ${day.pending}`} />}
                  </div>
                ) : (
                  <div className="bg-slate-100 w-full rounded-t-md" style={{ height: '4px' }} />
                )}
              </div>
              <div className="bar-label">{day.label}</div>
              <div className="text-[9px] text-slate-400 font-bold">{day.total}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics - from real data */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Key Metrics</span>
          <span className="text-[10px] text-slate-400">{orders.length} total orders</span>
        </div>
        <div className="p-4 flex flex-col">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-xs text-slate-600 font-medium">Completion Rate</span>
            <span className="text-sm font-bold text-green-600">{metrics.completionRate}%</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-xs text-slate-600 font-medium">Pending Rate</span>
            <span className="text-sm font-bold text-red-600">{metrics.pendingRate}%</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-xs text-slate-600 font-medium">Avg Items per Order</span>
            <span className="text-sm font-bold text-slate-900">{metrics.avgItems}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-xs text-slate-600 font-medium">Total Revenue</span>
            <span className="text-sm font-bold text-blue-600">{metrics.totalRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  )
}

export default DashboardManager