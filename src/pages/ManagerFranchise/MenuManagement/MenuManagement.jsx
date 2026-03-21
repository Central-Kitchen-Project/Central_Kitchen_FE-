import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetAll } from '../../../store/itemSlice'
import API from '../../../services/api'
import axios from 'axios'
import PageHeader from '../../../components/common/PageHeader'

const isInactiveItem = (item) => {
  if (!item || typeof item !== 'object') return false
  if (item.active === false || item.isActive === false || item.isAvailable === false) return true

  const status = String(item.status || '').toLowerCase()
  if (status === 'inactive' || status === 'disabled' || status === 'unavailable') return true

  return false
}

const getItemStatus = (item) => {
  if (isInactiveItem(item)) {
    return 'Inactive'
  }
  return 'Active'
}

function MenuManagement() {
  const data = useSelector(state => state.ITEM.listItems)
  const dispatch = useDispatch()

  const [currentFilter, setCurrentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [itemDetails, setItemDetails] = useState({})

  // Expanded rows (show ingredients inline)
  const [expandedRows, setExpandedRows] = useState({})
  const [rowIngredients, setRowIngredients] = useState({})
  const [loadingRow, setLoadingRow] = useState({})

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
  })

  // Add Ingredient modal
  const [showIngredientModal, setShowIngredientModal] = useState(false)
  const [ingredientTarget, setIngredientTarget] = useState(null)
  const [ingredientForm, setIngredientForm] = useState([])
  const [savingIngredients, setSavingIngredients] = useState(false)

  // Delete confirm
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [statusOverride, setStatusOverride] = useState({})

  const [toast, setToast] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  // Edit Item modal state and logic
  const [showEditModal, setShowEditModal] = useState(false)

  const [editForm, setEditForm] = useState({
    id: '',
    itemName: '',
    unit: '',
    itemType: '',
    description: '',
    price: '',
    category: ''
  })

  const openEditModal = (item) => {
    setEditForm({
      id: item.id,
      itemName: item.name || '',
      unit: item.unit || '',
      itemType: item.type || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || ''
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => setShowEditModal(false)

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const saveEditItem = async () => {
    if (!editForm.itemName.trim()) {
      showToast('error', 'Item name is required')
      return
    }

    const parsedPrice = Number(editForm.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      showToast('error', 'Price must be a valid number')
      return
    }

    try {
      // Read latest detail first to preserve backend-required fields that may not be present in table row data.
      const detailRes = await API.callWithToken().get(`Item/${editForm.id}`)
      const current = detailRes?.data?.data || {}

      const payload = {
        itemName: editForm.itemName.trim() || current.itemName || current.name || '',
        unit: (editForm.unit || current.unit || '').trim(),
        itemType: (editForm.itemType || current.itemType || current.type || '').trim(),
        description: (editForm.description ?? current.description ?? '').trim(),
        price: parsedPrice,
        category: (editForm.category || current.category || '').trim(),
        isAvailable: current.isAvailable !== false,
      }

      await API.callWithToken().put(`Item/${editForm.id}`, payload)
      showToast('success', 'Item updated successfully!')
      setShowEditModal(false)
      dispatch(fetchGetAll({ type: '', category: '' }))
    } catch (err) {
      console.error('Failed to update item:', err)
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors.join(', ') : null)

      showToast('error', apiMessage || 'Failed to update item. Please try again.')
    }
  }

  useEffect(() => {
    dispatch(fetchGetAll({ type: '', category: '' }))
  }, [dispatch])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch item detail (with ingredients)
  const fetchItemDetail = async (itemId) => {
    if (itemDetails[itemId]) return itemDetails[itemId]
    try {
      const res = await axios.get(`/api/Item/${itemId}`)
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

  // Get raw material items (for ingredient selection)
  const rawMaterials = (data || []).filter(item => {
    const t = item.type?.toLowerCase()
    return t === 'nguyen lieu' || t === 'raw material'
  })

  const rawMaterialUnits = [...new Set(rawMaterials.map(item => item.unit?.toLowerCase()).filter(Boolean))].sort()

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

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const isFinished = (item) => {
    const t = item.type?.toLowerCase()
    return t === 'thanh pham' || t === 'finished'
  }

  // Toggle expand row to show ingredients
  const toggleExpand = async (item) => {
    const id = item.id
    if (expandedRows[id]) {
      setExpandedRows(prev => ({ ...prev, [id]: false }))
      return
    }
    setExpandedRows(prev => ({ ...prev, [id]: true }))
    if (!rowIngredients[id]) {
      setLoadingRow(prev => ({ ...prev, [id]: true }))
      const detail = await fetchItemDetail(id)
      setRowIngredients(prev => ({ ...prev, [id]: detail?.ingredients || [] }))
      setLoadingRow(prev => ({ ...prev, [id]: false }))
    }
  }

  // Open detail modal
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

    // Hàm cập nhật form thêm mới
    const handleAddFormChange = (field, value) => {
      setAddForm(prev => ({ ...prev, [field]: value }))
    }
  // Add Item
  const openAddModal = () => {
    setAddForm({ itemName: '', unit: '', itemType: '', description: '', price: '', category: '' })
    setShowAddModal(true)
  }

  const closeAddModal = () => setShowAddModal(false)

  const isAddFormValid = (() => {
    const hasName = addForm.itemName.trim()
    const hasUnit = addForm.unit.trim()
    const hasType = addForm.itemType.trim()
    const hasDescription = addForm.description.trim()
    const hasCategory = addForm.category.trim()
    const hasPrice = String(addForm.price).trim() !== '' && !Number.isNaN(Number(addForm.price))

    return Boolean(hasName && hasUnit && hasType && hasDescription && hasCategory && hasPrice)
  })()

  const createItem = async () => {
    if (
      !addForm.itemName.trim() ||
      !addForm.unit.trim() ||
      !addForm.itemType.trim() ||
      !addForm.description.trim() ||
      !addForm.category.trim() ||
      String(addForm.price).trim() === '' ||
      Number.isNaN(Number(addForm.price))
    ) {
      showToast('error', 'All fields are required')
      return
    }
    setCreating(true)
    try {
      await axios.post('/api/Item', {
        itemName: addForm.itemName.trim(),
        unit: addForm.unit.trim(),
        itemType: addForm.itemType.trim(),
        description: addForm.description.trim(),
        price: Number(addForm.price),
        category: addForm.category.trim()
      })
      showToast('success', 'Item created successfully!')
      setShowAddModal(false)
      dispatch(fetchGetAll({ type: '', category: '' }))
    } catch (err) {
      console.error('Failed to create item:', err)
      showToast('error', 'Failed to create item. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  // Add Ingredient Modal
  const openIngredientModal = async (item) => {
    setIngredientTarget(item)
    setShowIngredientModal(true)
    // Load existing ingredients
    const detail = await fetchItemDetail(item.id)
    const existing = (detail?.ingredients || []).map(ing => {
      // Match ingredient name to raw material ID
      const matched = rawMaterials.find(rm => rm.name?.toLowerCase() === ing.name?.toLowerCase())
      return {
        itemId: ing.ingredientItemId || ing.itemId || (matched ? String(matched.id) : ''),
        qty: ing.qty || ing.quantity || '',
        name: ing.name || '',
      }
    })
    setIngredientForm(existing.length > 0 ? existing : [{ itemId: '', qty: '' }])
  }

  const closeIngredientModal = () => {
    setShowIngredientModal(false)
    setIngredientTarget(null)
    setIngredientForm([])
  }

  // Delete Item
  const openDeleteModal = (item) => {
    setDeleteTarget(item)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteTarget(null)
  }

  const deleteItem = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await API.callWithToken().delete(`Item/${deleteTarget.id}`)

      await dispatch(fetchGetAll({ type: '', category: '' }))
      setStatusOverride((prev) => {
        const next = { ...prev }
        delete next[deleteTarget.id]
        return next
      })

      showToast('success', `"${deleteTarget.name}" deleted successfully.`)
      closeDeleteModal()
    } catch (err) {
      console.error('Failed to delete item:', err)
      showToast('error', err.response?.data?.message || 'Failed to delete item. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const addIngredientRow = () => {
    setIngredientForm(prev => [...prev, { itemId: '', qty: '' }])
  }

  const removeIngredientRow = (idx) => {
    setIngredientForm(prev => prev.filter((_, i) => i !== idx))
  }

  const updateIngredientRow = (idx, field, value) => {
    setIngredientForm(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const saveIngredients = async () => {
    if (!ingredientTarget) return
    const validItems = ingredientForm.filter(r => r.itemId && r.qty)

    // Check if item already has ingredients (from cache before clearing)
    const cachedDetail = itemDetails[ingredientTarget.id]
    const hasExisting = cachedDetail?.ingredients && cachedDetail.ingredients.length > 0

    // If no existing ingredients and no new ones, block
    if (!hasExisting && validItems.length === 0) {
      showToast('error', 'Please add at least one ingredient with quantity')
      return
    }

    setSavingIngredients(true)
    try {
      const payload = {
        finishedItemId: ingredientTarget.id,
        ingredients: validItems.map(r => ({
          ingredientItemId: Number(r.itemId),
          quantity: Number(r.qty),
        }))
      }
      if (hasExisting) {
        await axios.put('/api/Item/update-ingredients', payload)
      } else {
        await axios.post('/api/Item/create-recipe', payload)
      }
      showToast('success', 'Ingredients saved successfully!')
      // Refresh cached detail
      setItemDetails(prev => { const copy = { ...prev }; delete copy[ingredientTarget.id]; return copy })
      setRowIngredients(prev => { const copy = { ...prev }; delete copy[ingredientTarget.id]; return copy })
      if (expandedRows[ingredientTarget.id]) {
        const detail = await fetchItemDetail(ingredientTarget.id)
        setRowIngredients(prev => ({ ...prev, [ingredientTarget.id]: detail?.ingredients || [] }))
      }
      closeIngredientModal()
    } catch (err) {
      console.error('Failed to save ingredients:', err)
      showToast('error', 'Failed to save ingredients. API may not be available yet.')
    } finally {
      setSavingIngredients(false)
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
      <PageHeader
        title="Menu Management"
        subtitle="Manage items, recipes, and ingredients for franchise operations."
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Filter & Actions */}
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          <button
            onClick={() => { setCurrentFilter('all'); setCurrentPage(1) }}
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
              onClick={() => { setCurrentFilter(type); setCurrentPage(1) }}
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

        {/* Items Table */}
        {data && data.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 w-8">#</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Item Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Unit</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Ingredients</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedProducts.map((product, idx) => {
                  const finished = isFinished(product)
                  const expanded = expandedRows[product.id]
                  const ings = rowIngredients[product.id] || []
                  const isLoadingIng = loadingRow[product.id]
                  const status = statusOverride[product.id] || getItemStatus(product)
                  return (
                    <>
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-xs text-slate-400">{(safePage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                        <td className="px-5 py-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-900">{product.name}</span>
                            {product.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{product.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                            finished ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {product.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 text-center">{product.unit}</td>
                        <td className="px-5 py-3 text-sm font-bold text-blue-600 text-right">
                          {product.price?.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isFinished(product) && (
                            <button
                              onClick={() => toggleExpand(product)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                                expanded
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {expanded ? 'expand_less' : 'expand_more'}
                              </span>
                              {expanded ? 'Hide' : 'View'}
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isFinished(product) && (
                              <button
                                onClick={() => openIngredientModal(product)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-semibold rounded-md transition-colors"
                                title="Manage ingredients"
                              >
                                <span className="material-symbols-outlined text-xs">science</span>
                                Ingredients
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 text-[11px] font-semibold rounded-md transition-colors"
                              title="Edit item"
                            >
                              <span className="material-symbols-outlined text-xs">edit</span>
                              Edit
                            </button>
                            <button
                              onClick={() => openDetailModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold rounded-md transition-colors"
                              title="View details"
                            >
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              Detail
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold rounded-md transition-colors"
                              title="Delete item"
                            >
                              <span className="material-symbols-outlined text-xs">delete</span>
                            </button>
                          </div>
                        </td>
                            {/* Edit Item Modal */}
                            {showEditModal && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                                <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                                  <h2 className="text-lg font-bold mb-4 text-yellow-700">Edit Item</h2>
                                  <div className="mb-3">
                                    <label className="block text-xs font-semibold mb-1">Name</label>
                                    <input
                                      type="text"
                                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                      value={editForm.itemName}
                                      onChange={e => handleEditChange('itemName', e.target.value)}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="block text-xs font-semibold mb-1">Description</label>
                                    <textarea
                                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                      value={editForm.description}
                                      onChange={e => handleEditChange('description', e.target.value)}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="block text-xs font-semibold mb-1">Unit</label>
                                    <input
                                      type="text"
                                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                      value={editForm.unit}
                                      onChange={e => handleEditChange('unit', e.target.value)}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="block text-xs font-semibold mb-1">Type</label>
                                    <input
                                      type="text"
                                      className="w-full border border-slate-200 bg-slate-100 text-slate-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                                      value={editForm.itemType}
                                      disabled
                                      readOnly
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="block text-xs font-semibold mb-1">Category</label>
                                    <input
                                      type="text"
                                      className="w-full border border-slate-200 bg-slate-100 text-slate-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                                      value={editForm.category}
                                      disabled
                                      readOnly
                                    />
                                  </div>
                                  <div className="mb-5">
                                    <label className="block text-xs font-semibold mb-1">Price</label>
                                    <input
                                      type="number"
                                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                      value={editForm.price}
                                      onChange={e => handleEditChange('price', e.target.value)}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={closeEditModal}
                                      className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={saveEditItem}
                                      className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                      </tr>
                      {/* Expanded Ingredients Row */}
                      {finished && expanded && (
                        <tr key={`${product.id}-ing`} className="bg-blue-50/30">
                          <td></td>
                          <td colSpan={6} className="px-5 py-3">
                            {isLoadingIng ? (
                              <p className="text-xs text-slate-400 italic">Loading ingredients...</p>
                            ) : ings.length === 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 italic">No ingredients added yet.</span>
                                <button
                                  onClick={() => openIngredientModal(product)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline"
                                >
                                  Add now
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {ings.map((ing, i) => (
                                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-700">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                                    <span className="font-medium">{ing.name}</span>
                                    <span className="text-slate-400">·</span>
                                    <span className="font-bold text-blue-600">{ing.qty} {ing.unit}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                        p === safePage ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && currentProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Item Details</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-base font-bold text-slate-900">{currentProduct.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{currentProduct.description}</p>
              </div>
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
              {isFinished(currentProduct) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm align-middle mr-1">science</span>
                      Ingredients
                    </h5>
                    <button
                      onClick={() => { closeModal(); openIngredientModal(currentProduct) }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Manage
                    </button>
                  </div>
                  {loadingDetail ? (
                    <p className="text-sm text-slate-400 italic">Loading ingredients...</p>
                  ) : ingredients.length === 0 ? (
                    <p className="text-sm text-slate-400">No ingredients added yet.</p>
                  ) : (
                    <div className="bg-slate-50 rounded-lg divide-y divide-slate-200">
                      {ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-slate-700">{ing.name}</span>
                          <span className="text-sm font-semibold text-slate-900">{ing.qty} {ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={closeModal} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeAddModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add New Item</h3>
              <button onClick={closeAddModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={addForm.itemName}
                  onChange={e => handleAddFormChange('itemName', e.target.value)}
                  placeholder="Enter item name"
                  required
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
                      const isTP = newType.toLowerCase() === 'thanh pham'
                      const isNL = newType.toLowerCase() === 'nguyen lieu' || newType.toLowerCase() === 'raw material'
                      handleAddFormChange('itemType', newType)
                      setAddForm(prev => ({
                        ...prev,
                        unit: isTP ? 'pcs' : prev.unit,
                        category: isNL ? 'nguyen lieu' : prev.category
                      }))
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {itemTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit *</label>
                  {addForm.itemType?.toLowerCase() === 'thanh pham' ? (
                    <input type="text" value="pcs" disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed" />
                  ) : (
                    <select
                      value={addForm.unit}
                      onChange={e => handleAddFormChange('unit', e.target.value)}
                      required
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  value={addForm.description}
                  onChange={e => handleAddFormChange('description', e.target.value)}
                  rows={2}
                  placeholder="Enter description"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (VND) *</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={e => handleAddFormChange('price', e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={addForm.category}
                    onChange={e => handleAddFormChange('category', e.target.value)}
                    placeholder="Enter category"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                All fields are required. You cannot create an item with empty values.
              </div>
              {addForm.itemType?.toLowerCase() === 'thanh pham' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-600">
                    <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
                    After creating, use the <strong>"Ingredients"</strong> button in the item list to add recipe ingredients.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={closeAddModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={createItem}
                disabled={creating || !isAddFormValid}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeDeleteModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-red-600">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Item</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-700">"{deleteTarget.name}"</span>?
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Manage Ingredients Modal */}
      {showIngredientModal && ingredientTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeIngredientModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manage Ingredients</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  For: <span className="font-semibold text-blue-600">{ingredientTarget.name}</span>
                </p>
              </div>
              <button onClick={closeIngredientModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ingredients List</label>
                <button
                  onClick={addIngredientRow}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Row
                </button>
              </div>
              {ingredientForm.length === 0 && (
                <p className="text-xs text-slate-400 italic">No ingredients. Click "Add Row" to start.</p>
              )}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ingredientForm.map((row, idx) => {
                  const selectedItem = rawMaterials.find(i => String(i.id) === String(row.itemId))
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</span>
                      <select
                        value={row.itemId}
                        onChange={e => updateIngredientRow(idx, 'itemId', e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select raw material</option>
                        {rawMaterials.map(i => (
                          <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={row.qty}
                        onChange={e => updateIngredientRow(idx, 'qty', e.target.value)}
                        placeholder="Qty"
                        className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <span className="text-[11px] text-slate-400 w-8 shrink-0">{selectedItem?.unit || ''}</span>
                      <button
                        onClick={() => removeIngredientRow(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={closeIngredientModal} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={saveIngredients}
                disabled={savingIngredients}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingIngredients ? 'Saving...' : 'Save Ingredients'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement