import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetOrder } from '../../../store/orderSlice'
import './PurchaseOrderManager.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getTimeDiff(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function PurchaseOrderManager() {
  const dispatch = useDispatch()
  const orders = useSelector(state => state.ORDER.listOrders) || []

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateFilterFrom, setDateFilterFrom] = useState('')
  const [dateFilterTo, setDateFilterTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    dispatch(fetchGetOrder())
  }, [dispatch])

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase()
    switch (s) {
      case 'pending':
        return { label: 'Pending', cls: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' }
      case 'processing':
        return { label: 'Processing', cls: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500' }
      case 'completed':
        return { label: 'Completed', cls: 'bg-green-50 text-green-600 border-green-200', dot: 'bg-green-500' }
      case 'approved':
        return { label: 'Approved', cls: 'bg-purple-50 text-purple-600 border-purple-200', dot: 'bg-purple-500' }
      default:
        return { label: status || 'Unknown', cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
    }
  }

  const filteredOrders = orders.filter(order => {
    const itemNames = (order.orderLines || []).map(line => line.name?.toLowerCase() || '')
    const matchesSearch = !searchTerm || itemNames.some(name => name.includes(searchTerm.toLowerCase())) || order.username?.toLowerCase().includes(searchTerm.toLowerCase()) || String(order.id).includes(searchTerm)
    const orderStatus = order.status?.toLowerCase()
    const matchesStatus = selectedStatus === 'all' || orderStatus === selectedStatus
    const orderDateStr = order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : ''
    const matchesDate = (!dateFilterFrom || orderDateStr >= dateFilterFrom) && (!dateFilterTo || orderDateStr <= dateFilterTo)
    return matchesSearch && matchesStatus && matchesDate
  })

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status?.toLowerCase() === 'pending').length,
    processing: orders.filter((o) => o.status?.toLowerCase() === 'processing').length,
    completed: orders.filter((o) => o.status?.toLowerCase() === 'completed').length,
    approved: orders.filter((o) => o.status?.toLowerCase() === 'approved').length,
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pagedOrders = filteredOrders.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, dateFilterFrom, dateFilterTo])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Purchase Orders Tracking</h1>
        <p className="text-xs text-slate-500 mt-1">Monitor order status and distribution progress</p>
      </div>

      {/* Filters */}
      <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">calendar_month</span>
            <input
              type="date"
              placeholder="From"
              value={dateFilterFrom}
              onChange={(e) => setDateFilterFrom(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              placeholder="To"
              value={dateFilterTo}
              onChange={(e) => setDateFilterTo(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            {(dateFilterFrom || dateFilterTo) && (
              <button
                onClick={() => {
                  setDateFilterFrom('')
                  setDateFilterTo('')
                }}
                className="ml-2 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedStatus === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              selectedStatus === 'pending'
                ? 'border-red-500 bg-white text-red-600'
                : 'border-slate-300 bg-white text-slate-700 hover:text-red-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus('processing')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              selectedStatus === 'processing'
                ? 'border-blue-500 bg-white text-blue-600'
                : 'border-slate-300 bg-white text-slate-700 hover:text-blue-600'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              selectedStatus === 'completed'
                ? 'border-green-500 bg-white text-green-600'
                : 'border-slate-300 bg-white text-slate-700 hover:text-green-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setSelectedStatus('approved')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              selectedStatus === 'approved'
                ? 'border-purple-500 bg-white text-purple-600'
                : 'border-slate-300 bg-white text-slate-700 hover:text-purple-600'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Items</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
                        <p className="text-slate-500 text-lg">{orders.length === 0 ? 'Loading orders...' : 'No orders found'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedOrders.map((order) => {
                    const badge = getStatusBadge(order.status)
                    const lines = order.orderLines || []
                    const totalAmount = lines.reduce((sum, line) => sum + (line.price || 0) * (line.quantity || 0), 0)

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                        {/* Order ID */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-bold text-slate-800">#PO-{order.id}</span>
                            <span className="text-[10px] text-slate-400">{getTimeDiff(order.orderDate)}</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-md flex items-center justify-center text-[11px] font-black bg-blue-100 text-blue-700">
                              {(order.username || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{order.username}</p>
                              <p className="text-[10px] text-slate-400">{formatDate(order.orderDate)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4">
                          {lines.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No items</span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-slate-700">{lines[0].name} x{lines[0].quantity}</span>
                              {lines.length > 1 && (
                                <span className="text-xs text-slate-400">+{lines.length - 1} more item{lines.length > 2 ? 's' : ''}</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-slate-800">{totalAmount.toLocaleString('vi-VN')}đ</span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold ${badge.cls}`}>
                            <span className={`size-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredOrders.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">first_page</span>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="px-1 text-xs text-slate-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[28px] px-2 py-1 rounded text-xs font-bold transition-colors ${
                          p === safeCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">last_page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

export default PurchaseOrderManager
