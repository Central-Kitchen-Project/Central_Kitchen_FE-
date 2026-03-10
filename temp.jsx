import React, { useState, useEffect } from 'react'

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-slate-100 text-slate-600',
]

function getInitial(name) {
  return (name || '?')[0].toUpperCase()
}

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
  const [orders, setOrders] = useState([
    { id: 1, orderID: '#PO-2024-001', supplier: 'Fresh Produce Co.', customer: 'Supplier A', orderItems: ['Tomatoes', 'Lettuce'], totalItems: 2, total: 2450, status: 'completed', dueDate: '2026-01-20', orderDate: new Date('2026-01-18') },
    { id: 2, orderID: '#PO-2024-002', supplier: 'Dairy Imports Ltd', customer: 'Supplier B', orderItems: ['Milk', 'Cheese', 'Butter'], totalItems: 3, total: 1890, status: 'pending', dueDate: '2026-01-22', orderDate: new Date('2026-01-18') },
    { id: 3, orderID: '#PO-2024-003', supplier: 'Global Grains Supply', customer: 'Supplier C', orderItems: ['Rice', 'Wheat'], totalItems: 2, total: 890, status: 'processing', dueDate: '2026-01-18', orderDate: new Date('2026-01-17') }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [formData, setFormData] = useState({
    customer: '',
    supplier: '',
    items: '',
    total: '',
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const saved = localStorage.getItem('purchaseOrders')
    if (saved) {
      try {
        setOrders(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading orders:', e)
      }
    }
  }, [])

  const saveToLocalStorage = (updatedOrders) => {
    localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders))
  }

  const handleAddOrder = () => {
    if (!formData.customer.trim() || !formData.supplier.trim() || !formData.items || !formData.total) {
      alert('Please fill all required fields')
      return
    }

    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      orderID: `#PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      customer: formData.customer,
      supplier: formData.supplier,
      orderItems: [formData.items],
      totalItems: 1,
      total: parseFloat(formData.total),
      status: formData.status,
      dueDate: formData.dueDate,
      orderDate: new Date()
    }

    const updatedOrders = [...orders, newOrder]
    setOrders(updatedOrders)
    saveToLocalStorage(updatedOrders)
    resetForm()
    setShowAddModal(false)
  }

  const handleEditOrder = () => {
    if (!formData.customer.trim() || !formData.supplier.trim() || !formData.items || !formData.total) {
      alert('Please fill all required fields')
      return
    }

    const updatedOrders = orders.map(o =>
      o.id === editingOrder.id
        ? {
            ...o,
            customer: formData.customer,
            supplier: formData.supplier,
            orderItems: [formData.items],
            totalItems: 1,
            total: parseFloat(formData.total),
            status: formData.status,
            dueDate: formData.dueDate
          }
        : o
    )

    setOrders(updatedOrders)
    saveToLocalStorage(updatedOrders)
    resetForm()
    setShowEditModal(false)
    setEditingOrder(null)
  }

  const handleCompleteOrder = async (order) => {
    setLoadingId(order.id)
    try {
      const updatedOrders = orders.map(o =>
        o.id === order.id ? { ...o, status: 'completed' } : o
      )
      setOrders(updatedOrders)
      saveToLocalStorage(updatedOrders)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeleteOrder = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const updatedOrders = orders.filter(o => o.id !== id)
      setOrders(updatedOrders)
      saveToLocalStorage(updatedOrders)
    }
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (order) => {
    setEditingOrder(order)
    setFormData({
      customer: order.customer,
      supplier: order.supplier,
      items: order.orderItems[0] || '',
      total: order.total.toString(),
      status: order.status,
      dueDate: order.dueDate
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      customer: '',
      supplier: '',
      items: '',
      total: '',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0]
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', cls: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' }
      case 'processing':
        return { label: 'Processing', cls: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500' }
      case 'completed':
        return { label: 'Completed', cls: 'bg-green-50 text-green-600 border-green-200', dot: 'bg-green-500' }
      default:
        return { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Purchase Orders</h2>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Create Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <span className="material-symbols-outlined text-2xl text-slate-600">shopping_bag</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <span className="material-symbols-outlined text-2xl text-red-600">schedule</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Processing</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.processing}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="material-symbols-outlined text-2xl text-blue-600">sync</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="material-symbols-outlined text-2xl text-green-600">task_alt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Supplier</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Items</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
                        <p className="text-slate-500 text-lg">No purchase orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => {
                    const badge = getStatusBadge(order.status)
                    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                    const isCompleted = order.status === 'completed'

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                        {/* Order ID */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-bold text-slate-800">{order.orderID}</span>
                            <span className="text-[10px] text-slate-400">{getTimeDiff(order.orderDate)}</span>
                          </div>
                        </td>

                        {/* Supplier / Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`size-7 rounded-md flex items-center justify-center text-[11px] font-black ${avatarColor}`}>
                              {getInitial(order.customer)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{order.customer}</p>
                              <p className="text-[10px] text-slate-400">{formatDate(order.orderDate)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4">
                          {order.orderItems.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No items</span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-slate-700">{order.orderItems[0]}</span>
                              {order.totalItems > 1 && (
                                <span className="text-xs text-slate-400">+{order.totalItems - 1} more item{order.totalItems > 2 ? 's' : ''}</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-slate-800">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-tight ${badge.cls}`}>
                            <span className={`size-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'processing' ? (
                              <button
                                onClick={() => handleCompleteOrder(order)}
                                disabled={isCompleted || loadingId === order.id}
                                className="px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                {loadingId === order.id ? (
                                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                  </svg>
                                ) : (
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                )}
                                Complete
                              </button>
                            ) : isCompleted ? (
                              <button
                                disabled
                                className="px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 bg-green-50 text-green-600 border border-green-200 cursor-not-allowed opacity-60"
                              >
                                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                                Completed
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => openEditModal(order)}
                                  className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {orders.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
              Showing {orders.length} of {orders.length} orders
            </div>
          )}
        </div>
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Create Purchase Order</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Items</label>
                <input
                  type="text"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount ($)</label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrder}
                className="flex-1 px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Edit Purchase Order</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Items</label>
                <input
                  type="text"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount ($)</label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditOrder}
                className="flex-1 px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseOrderManager
