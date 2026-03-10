import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetAll } from '../../../store/itemSlice'
import axios from 'axios'

function MenuManagement() {
  const data = useSelector(state => state.ITEM.listItems)
  const dispatch = useDispatch()

  const [currentFilter, setCurrentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  // Cache item details (with ingredients) by id
  const [itemDetails, setItemDetails] = useState({})

  // Add Item modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [addForm, setAddForm] = useState({
    itemName: '',
    unit: '',
    itemType: '',
    description: '',
    price: '',
    category: '',
    ingredients: []
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    dispatch(fetchGetAll({ type: '', category: '' }))
  }, [dispatch])

  // Fetch item detail (with ingredients)
  const fetchItemDetail = async (itemId) => {
    if (itemDetails[itemId]) return itemDetails[itemId]
    try {
      const res = await axios.get(`http://meinamfpt-001-site1.ltempurl.com/api/Item/${itemId}`)
      const detail = res.data?.data
      if (detail) {
        setItemDetails(prev => ({ ...prev, [itemId]: detail }))
        return detail
      }
    } catch (err) {
      console.error('Failed to fetch item detail:', err)
    }
    return null
  }

  // Get unique types for filter tabs
  const itemTypes = [...new Set((data || []).map(item => item.type?.toLowerCase()).filter(Boolean))]

  // Get unique units from nguyen lieu items for dropdown
  const rawMaterialUnits = [...new Set(
    (data || [])
      .filter(item => item.type?.toLowerCase() === 'nguyen lieu')
      .map(item => item.unit?.toLowerCase())
      .filter(Boolean)
  )].sort()

  const filteredProducts = (data || []).filter(item => {
    if (currentFilter === 'all') return true
    return item.type?.toLowerCase() === currentFilter
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return (a.name || '').localeCompare(b.name || '')
      case 'name-desc': return (b.name || '').localeCompare(a.name || '')
      case 'price-asc': return (a.price || 0) - (b.price || 0)
      case 'price-desc': return (b.price || 0) - (a.price || 0)
      default: return 0
    }
  })

  const openDetailModal = async (product) => {
    setCurrentProduct(product)
    setLoadingDetail(true)
    setIngredients([])
    setShowDetailModal(true)
    const detail = await fetchItemDetail(product.id)
    setIngredients(detail?.ingredients || [])
    setLoadingDetail(false)
  }

  const closeModal = () => {
    setShowDetailModal(false)
    setCurrentProduct(null)
  }

  // Add Item
  const openAddModal = () => {
    setAddForm({ itemName: '', unit: '', itemType: itemTypes[0] || '', description: '', price: '', category: '', ingredients: [] })
    setShowAddModal(true)
  }

  const closeAddModal = () => {
    setShowAddModal(false)
  }

  const createItem = async () => {
    if (!addForm.itemName.trim() || !addForm.itemType.trim()) {
      setToast({ type: 'error', message: 'Item name and type are required' })
      setTimeout(() => setToast(null), 3000)
      return
    }
    setCreating(true)
    try {
      await axios.post('http://meinamfpt-001-site1.ltempurl.com/api/Item', {
        itemName: addForm.itemName,
        unit: addForm.unit,
        itemType: addForm.itemType,
        description: addForm.description,
        price: addForm.price ? Number(addForm.price) : null,
        category: addForm.category || null
      })
      setToast({ type: 'success', message: 'Item created successfully!' })
      setTimeout(() => setToast(null), 3000)
      setShowAddModal(false)
      dispatch(fetchGetAll({ type: '', category: '' }))
    } catch (err) {
      console.error('Failed to create item:', err)
      setToast({ type: 'error', message: 'Failed to create item. Please try again.' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Menu Management</h1>
        <p className="text-xs text-slate-500 mt-1">Manage items and menu categories</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          <button
            onClick={() => setCurrentFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              currentFilter === 'all'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            All ({(data || []).length})
          </button>
          {itemTypes.map(type => (
            <button
              key={type}
              onClick={() => setCurrentFilter(type)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border capitalize ${
                currentFilter === type
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {type} ({(data || []).filter(i => i.type?.toLowerCase() === type).length})
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="default">Sort by</option>
              <option value="name-asc">Name A → Z</option>
              <option value="name-desc">Name Z → A</option>
              <option value="price-asc">Price Low → High</option>
              <option value="price-desc">Price High → Low</option>
            </select>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Item
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(!data || data.length === 0) && (
          <div className="text-center text-slate-400 py-20">Loading items from API...</div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => openDetailModal(product)}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{product.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium capitalize">{product.type}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{product.unit}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="text-base font-bold text-blue-600">{product.price?.toLocaleString('vi-VN')}đ</span>
                  <span className="text-xs text-slate-400">/{product.unit}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openDetailModal(product); }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-semibold rounded-md transition-colors"
                  title="View details"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && currentProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Item Details</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Item name */}
              <div>
                <h4 className="text-base font-bold text-slate-900">{currentProduct.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{currentProduct.description}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{currentProduct.type}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Unit</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{currentProduct.unit}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Price</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{currentProduct.price?.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Category</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{currentProduct.category || '—'}</p>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">science</span>
                  Ingredients
                </h5>
                {loadingDetail ? (
                  <p className="text-sm text-slate-400 italic">Loading ingredients...</p>
                ) : ingredients.length === 0 ? (
                  <p className="text-sm text-slate-400">No ingredients data</p>
                ) : (
                  <div className="bg-slate-50 rounded-lg divide-y divide-slate-200">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-slate-700">{ing.name}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {ing.qty} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                disabled
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
                title="Waiting for backend PUT API"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeAddModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add New Item</h3>
              <button onClick={closeAddModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={addForm.itemName}
                  onChange={e => setAddForm({ ...addForm, itemName: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={addForm.itemType}
                    onChange={e => {
                      const newType = e.target.value
                      const isThanhPham = newType.toLowerCase() === 'thanh pham'
                      setAddForm({ ...addForm, itemType: newType, unit: isThanhPham ? 'pcs' : '' })
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {itemTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  {addForm.itemType?.toLowerCase() === 'thanh pham' ? (
                    <input
                      type="text"
                      value="pcs"
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={addForm.unit}
                      onChange={e => setAddForm({ ...addForm, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select unit</option>
                      {rawMaterialUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (VND)</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={addForm.category}
                    onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                    placeholder="Optional category"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Ingredients section — only for thanh pham */}
              {addForm.itemType?.toLowerCase() === 'thanh pham' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700">Ingredients</label>
                    <button
                      type="button"
                      onClick={() => setAddForm({ ...addForm, ingredients: [...addForm.ingredients, { itemId: '', qty: '' }] })}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      Add Ingredient
                    </button>
                  </div>
                  {addForm.ingredients.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No ingredients added yet. Click "Add Ingredient" to start.</p>
                  )}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {addForm.ingredients.map((ing, idx) => {
                      const selectedItem = (data || []).find(i => String(i.id) === String(ing.itemId))
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <select
                            value={ing.itemId}
                            onChange={e => {
                              const updated = [...addForm.ingredients]
                              updated[idx] = { ...updated[idx], itemId: e.target.value }
                              setAddForm({ ...addForm, ingredients: updated })
                            }}
                            className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select ingredient</option>
                            {(data || []).filter(i => i.type?.toLowerCase() === 'nguyen lieu').map(i => (
                              <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={ing.qty}
                            onChange={e => {
                              const updated = [...addForm.ingredients]
                              updated[idx] = { ...updated[idx], qty: e.target.value }
                              setAddForm({ ...addForm, ingredients: updated })
                            }}
                            placeholder="Qty"
                            className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-slate-400 w-8">{selectedItem?.unit || ''}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = addForm.ingredients.filter((_, i) => i !== idx)
                              setAddForm({ ...addForm, ingredients: updated })
                            }}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-3">
                    <p className="text-[11px] text-amber-600">
                      <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
                      Ingredients are saved separately by the backend after item creation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createItem}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement