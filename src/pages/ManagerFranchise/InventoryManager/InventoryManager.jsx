import React, { useState, useEffect } from 'react'

function InventoryManager() {
  const [items, setItems] = useState([
    { id: 1, name: 'Mozzarella Blend', category: 'Dairy', unit: 'units', quantity: 450, minLevel: 200, price: 5.50, history: [] },
    { id: 2, name: 'Tomato Sauce', category: 'Condiments', unit: 'units', quantity: 180, minLevel: 200, price: 2.30, history: [] },
    { id: 3, name: 'Flour (All-Purpose)', category: 'Dry Goods', unit: 'kg', quantity: 850, minLevel: 500, price: 1.20, history: [] },
    { id: 4, name: 'Olive Oil', category: 'Oils', unit: 'liters', quantity: 45, minLevel: 100, price: 8.50, history: [] }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [filteredItems, setFilteredItems] = useState(items)
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: '',
    minLevel: '',
    price: ''
  })

  const [stockData, setStockData] = useState({
    action: 'add',
    quantity: '',
    reason: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('inventoryItems')
    if (saved) {
      const data = JSON.parse(saved)
      setItems(data)
      setFilteredItems(data)
    }
  }, [])

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [searchTerm, items])

  const saveToLocalStorage = (newItems) => {
    localStorage.setItem('inventoryItems', JSON.stringify(newItems))
  }

  const getStatusColor = (quantity, minLevel) => {
    if (quantity === 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    } else if (quantity < minLevel) {
      return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' }
    }
    return { status: 'In Stock', color: 'bg-emerald-100 text-emerald-700' }
  }

  const handleAddItem = () => {
    setFormData({ name: '', category: '', unit: '', quantity: '', minLevel: '', price: '' })
    setShowAddModal(true)
  }

  const handleSaveAdd = () => {
    if (!formData.name || !formData.category || !formData.unit) {
      alert('Please fill all required fields')
      return
    }

    const newItem = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      quantity: parseInt(formData.quantity) || 0,
      minLevel: parseInt(formData.minLevel) || 0,
      price: parseFloat(formData.price) || 0,
      history: []
    }

    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    saveToLocalStorage(updatedItems)
    setShowAddModal(false)
    alert('Item added successfully!')
  }

  const handleEditItem = (item) => {
    setCurrentItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minLevel: item.minLevel,
      price: item.price
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!formData.name || !formData.category || !formData.unit) {
      alert('Please fill all required fields')
      return
    }

    const updatedItems = items.map(item =>
      item.id === currentItem.id
        ? {
            ...item,
            name: formData.name,
            category: formData.category,
            unit: formData.unit,
            minLevel: parseInt(formData.minLevel) || 0,
            price: parseFloat(formData.price) || 0
          }
        : item
    )

    setItems(updatedItems)
    saveToLocalStorage(updatedItems)
    setShowEditModal(false)
    alert('Item updated successfully!')
  }

  const handleUpdateStock = (item) => {
    setCurrentItem(item)
    setStockData({ action: 'add', quantity: '', reason: '' })
    setShowStockModal(true)
  }

  const handleSaveStock = () => {
    const qty = parseInt(stockData.quantity)
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    const updatedItems = items.map(item => {
      if (item.id === currentItem.id) {
        let newQuantity = item.quantity
        if (stockData.action === 'add') {
          newQuantity += qty
        } else {
          if (item.quantity < qty) {
            alert('Not enough stock to remove!')
            return item
          }
          newQuantity -= qty
        }

        const historyEntry = {
          action: stockData.action === 'add' ? 'Add' : 'Remove',
          qty: qty,
          reason: stockData.reason || 'Manual update',
          date: new Date(),
          before: item.quantity,
          after: newQuantity
        }

        return {
          ...item,
          quantity: newQuantity,
          history: [...(item.history || []), historyEntry]
        }
      }
      return item
    })

    setItems(updatedItems)
    saveToLocalStorage(updatedItems)
    setShowStockModal(false)
    alert('Stock updated successfully!')
  }

  const handleViewHistory = (item) => {
    setCurrentItem(item)
    setShowHistoryModal(true)
  }

  const handleDeleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter(item => item.id !== id)
      setItems(updatedItems)
      saveToLocalStorage(updatedItems)
      alert('Item deleted successfully!')
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
        <h2 className="text-lg font-bold text-slate-900">Inventory Management</h2>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6">
            {/* Toolbar */}
            <div className="flex gap-4 mb-6 items-center">
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Item
              </button>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Minimum Level</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const { status, color } = getStatusColor(item.quantity, item.minLevel)
                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{item.minLevel} {item.unit}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => handleUpdateStock(item)}
                                className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1 transition-colors text-xs"
                              >
                                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                                Update
                              </button>
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1 transition-colors text-xs"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Edit
                              </button>
                              <button
                                onClick={() => handleViewHistory(item)}
                                className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1 transition-colors text-xs"
                              >
                                <span className="material-symbols-outlined text-[16px]">history</span>
                                History
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors text-xs"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add New Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Dairy, Oils"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Unit *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., units, kg, liters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Minimum Level</label>
                <input
                  type="number"
                  value={formData.minLevel}
                  onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Price per Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdd}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Item</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Minimum Level</label>
                <input
                  type="number"
                  value={formData.minLevel}
                  onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Price per Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Update Stock - {currentItem?.name}</h3>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Current Stock</label>
                <input
                  type="text"
                  disabled
                  value={`${currentItem?.quantity} ${currentItem?.unit}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Action</label>
                <select
                  value={stockData.action}
                  onChange={(e) => setStockData({ ...stockData, action: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="add">Add Stock</option>
                  <option value="subtract">Use/Remove Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Quantity</label>
                <input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Reason</label>
                <textarea
                  value={stockData.reason}
                  onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., New shipment, Daily usage"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">New Stock (Preview)</label>
                <input
                  type="text"
                  disabled
                  value={
                    stockData.action === 'add'
                      ? `${(currentItem?.quantity || 0) + (parseInt(stockData.quantity) || 0)} ${currentItem?.unit}`
                      : `${(currentItem?.quantity || 0) - (parseInt(stockData.quantity) || 0)} ${currentItem?.unit}`
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStock}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Stock History - {currentItem?.name}</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {currentItem?.history && currentItem?.history.length > 0 ? (
                <div className="space-y-4">
                  {currentItem.history.map((entry, idx) => (
                    <div key={idx} className="border-l-4 border-emerald-500 pl-4 py-2">
                      <div className="text-xs text-slate-500">
                        {new Date(entry.date).toLocaleString()}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {entry.action}: {entry.before !== undefined ? `${entry.before} → ${entry.after}` : entry.qty} {currentItem.unit}
                      </div>
                      <div className="text-sm text-slate-600">{entry.reason}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">No history records</div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryManager