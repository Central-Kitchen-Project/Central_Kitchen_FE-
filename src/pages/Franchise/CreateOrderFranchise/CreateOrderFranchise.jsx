import { Link, useNavigate } from 'react-router-dom'
import './CreateOrderFranchise.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchGetAll } from '../../../store/itemSlice';
import axios from 'axios';

function normalizeCollection(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (data && typeof data === 'object') {
    const arrayValue = Object.values(data).find(Array.isArray);
    if (arrayValue) return arrayValue;

    const wrappedArrayValue = Object.values(data).find((value) => Array.isArray(value?.$values));
    if (wrappedArrayValue?.$values) return wrappedArrayValue.$values;
  }
  return [];
}

function CreateOrderFranchise() {
  const data = useSelector(state => state.ITEM.listItems);
  const dispatch = useDispatch();

  // Get logged-in user info from localStorage
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('USER_INFO')) || {};
    } catch {
      return {};
    }
  })();

  // State quản lý items được chọn: { [itemId]: quantity }
  const [selectedItems, setSelectedItems] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Cache chi tiết item (có ingredients) theo id
  const [itemDetails, setItemDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  useEffect(() => {
    dispatch(fetchGetAll({ type: "", category: "" }));
  }, [dispatch]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch chi tiết item khi được chọn lần đầu
  const fetchItemDetail = async (itemId) => {
    if (itemDetails[itemId] || loadingDetails[itemId]) return;
    setLoadingDetails(prev => ({ ...prev, [itemId]: true }));
    try {
      const res = await axios.get(`http://meinamfpt-001-site1.ltempurl.com/api/Item/${itemId}`);
      const detail = res.data?.data;
      if (detail) {
        setItemDetails(prev => ({ ...prev, [itemId]: detail }));
      }
    } catch (err) {
      console.error('Failed to fetch item detail:', err);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleQuantityChange = (itemId, value) => {
    const qty = parseInt(value);
    if (qty <= 0 || isNaN(qty)) {
      const updated = { ...selectedItems };
      delete updated[itemId];
      setSelectedItems(updated);
    } else {
      setSelectedItems(prev => ({ ...prev, [itemId]: qty }));
    }
  };

  const toggleSelect = (itemId) => {
    if (selectedItems[itemId]) {
      const updated = { ...selectedItems };
      delete updated[itemId];
      setSelectedItems(updated);
    } else {
      setSelectedItems(prev => ({ ...prev, [itemId]: 1 }));
      fetchItemDetail(itemId);
    }
  };

  const selectedList = Object.entries(selectedItems).map(([id, quantity]) => {
    const item = data?.find(d => d.id === parseInt(id));
    const detail = itemDetails[parseInt(id)];
    return { itemId: parseInt(id), quantity, item, detail };
  });

  const subtotal = selectedList.reduce((sum, { item, quantity }) => {
    return sum + (item?.price || 0) * quantity;
  }, 0);

  const PROCESSING_FEE = 5000;

  const normalizeStockKey = (value) => String(value || '').trim().toLowerCase();

  const getIngredientRequiredPerItem = (ingredient) => {
    const raw = ingredient?.qty ?? ingredient?.quantity ?? ingredient?.requiredQuantity ?? 0;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 0;
  };

  const getIngredientName = (ingredient) => {
    return ingredient?.name || ingredient?.materialName || ingredient?.ingredientName || ingredient?.itemName || '';
  };

  const buildInventoryStockLookup = (inventoryItems) => {
    const lookup = {};
    (inventoryItems || []).forEach((inv) => {
      const name = inv?.itemName || inv?.name || inv?.item?.itemName || inv?.item?.name;
      const key = normalizeStockKey(name);
      if (!key) return;
      const qty = Number(inv?.quantity ?? inv?.currentStock ?? inv?.stock ?? 0);
      if (!Number.isFinite(qty)) return;
      lookup[key] = (lookup[key] || 0) + qty;
    });
    return lookup;
  };

  // Tổng hợp nguyên liệu từ tất cả items được chọn
  const aggregatedIngredients = () => {
    const map = {}; // key: "name|unit"
    selectedList.forEach(({ detail, quantity }) => {
      if (!detail?.ingredients?.length) return;
      detail.ingredients.forEach(ing => {
        const key = `${ing.name}|${ing.unit}`;
        if (!map[key]) {
          map[key] = { name: ing.name, unit: ing.unit, qty: 0 };
        }
        map[key].qty += ing.qty * quantity;
      });
    });
    return Object.values(map);
  };

  const handleClickSubmit = () => {
    if (selectedList.length === 0) {
      showToast('error', 'Please select at least one product!');
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmitOrder = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      if (!userInfo?.id) {
        showToast('error', 'User session not found. Please login again.');
        return;
      }

      // Ensure details (with ingredients) are available for selected items.
      const missingDetailIds = selectedList
        .map(({ itemId, detail }) => (detail ? null : itemId))
        .filter(Boolean);

      let fetchedDetails = {};
      if (missingDetailIds.length > 0) {
        const detailEntries = await Promise.all(
          missingDetailIds.map(async (itemId) => {
            try {
              const res = await axios.get(`http://meinamfpt-001-site1.ltempurl.com/api/Item/${itemId}`);
              return [itemId, res.data?.data || null];
            } catch {
              return [itemId, null];
            }
          })
        );
        fetchedDetails = Object.fromEntries(detailEntries.filter(([, detail]) => !!detail));
        if (Object.keys(fetchedDetails).length > 0) {
          setItemDetails((prev) => ({ ...prev, ...fetchedDetails }));
        }
      }

      const detailByItemId = { ...itemDetails, ...fetchedDetails };

      // Load franchise inventory to determine shortage quantities.
      const inventoryRes = await axios.get(
        `http://meinamfpt-001-site1.ltempurl.com/api/Inventory?userId=${userInfo.id}`,
        { headers: { accept: '*/*' } }
      );
      const inventoryItems = normalizeCollection(inventoryRes.data?.value ?? inventoryRes.data?.data ?? inventoryRes.data);
      const stockLookup = buildInventoryStockLookup(inventoryItems);

      // Simulate local production first, then submit only shortage quantity to central.
      const shortageOrderItems = [];
      selectedList.forEach(({ itemId, quantity }) => {
        const detail = detailByItemId[itemId];
        const ingredients = detail?.ingredients || [];

        // If recipe is missing, keep current behavior and send full quantity.
        if (!ingredients.length) {
          shortageOrderItems.push({ itemId, quantity });
          return;
        }

        let maxProducible = Number(quantity) || 0;
        ingredients.forEach((ingredient) => {
          const key = normalizeStockKey(getIngredientName(ingredient));
          const requiredPerItem = getIngredientRequiredPerItem(ingredient);
          if (!key || requiredPerItem <= 0) return;
          const stock = stockLookup[key] || 0;
          const canProduceByThisIngredient = Math.floor(stock / requiredPerItem);
          maxProducible = Math.min(maxProducible, canProduceByThisIngredient);
        });

        const producibleQty = Math.max(0, Math.min(Number(quantity) || 0, maxProducible));
        const shortageQty = (Number(quantity) || 0) - producibleQty;

        // Deduct locally producible quantity from simulated stock for subsequent items.
        if (producibleQty > 0) {
          ingredients.forEach((ingredient) => {
            const key = normalizeStockKey(getIngredientName(ingredient));
            const requiredPerItem = getIngredientRequiredPerItem(ingredient);
            if (!key || requiredPerItem <= 0) return;
            const used = producibleQty * requiredPerItem;
            stockLookup[key] = Math.max(0, (stockLookup[key] || 0) - used);
          });
        }

        if (shortageQty > 0) {
          shortageOrderItems.push({ itemId, quantity: shortageQty });
        }
      });

      if (shortageOrderItems.length === 0) {
        showToast('success', 'Inventory is enough for all selected products. No central order was sent.');
        setSelectedItems({});
        return;
      }

      const payload = {
        userId: userInfo.id,
        items: shortageOrderItems,
      };

      await axios.post('http://meinamfpt-001-site1.ltempurl.com/api/Order', payload, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      });

      showToast('success', 'Order placed successfully! Your order has been sent to Central Kitchen.');
      setSelectedItems({});
    } catch (err) {
      showToast('error', `Order failed! ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const ingredients = aggregatedIngredients();

  // Filter & search logic
  const filteredData = (data || []).filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type?.toLowerCase() === activeFilter;
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get unique types for filter tabs
  const itemTypes = [...new Set((data || []).map(item => item.type?.toLowerCase()).filter(Boolean))];

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-75 hover:opacity-100">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <div className="create-order-page flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ height: '100vh' }}>
          {/* Header */}
          <div className="header">
            <div>
              <div className="breadcrumb-custom">
                <i className="fas fa-home" />
                <span>Downtown Branch &gt; Product Order</span>
              </div>
              <div className="header-title">Create New Order</div>
            </div>
            <div className="header-right">
              <input
                type="text"
                className="search-box"
                placeholder="Search products, SKUs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <div className="content-area">
            {/* Products Section */}
            <div className="products-section">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-4 flex-wrap shrink-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    activeFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  All ({(data || []).length})
                </button>
                {itemTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 capitalize ${
                      activeFilter === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type} ({(data || []).filter(i => i.type?.toLowerCase() === type).length})
                  </button>
                ))}
              </div>

              <div className="products-grid" id="productsGrid">
                {(!data || data.length === 0) && (
                  <div className="col-span-full text-center text-slate-400 py-10">
                    Loading products...
                  </div>
                )}
                {data && data.length > 0 && filteredData.length === 0 && (
                  <div className="col-span-full text-center text-slate-400 py-10">
                    No matching products found
                  </div>
                )}
                {filteredData.map((item) => {
                  const isSelected = !!selectedItems[item.id];
                  const qty = selectedItems[item.id] || 0;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border-2 p-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleSelect(item.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">{item.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-primary border-primary' : 'border-slate-300'
                        }`}>
                          {isSelected && (
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium capitalize">{item.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.unit}</span>
                      </div>

                      <p className="text-base font-bold text-primary">
                        {item.price.toLocaleString('vi-VN')}đ
                        <span className="text-xs font-normal text-slate-400">/{item.unit}</span>
                      </p>

                      {isSelected && (
                        <div
                          className="flex items-center gap-2 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg leading-none"
                            onClick={() => handleQuantityChange(item.id, qty - 1)}
                          >−</button>
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-12 text-center border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <button
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg leading-none"
                            onClick={() => handleQuantityChange(item.id, qty + 1)}
                          >+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-title">Order Summary</div>
              <div className="summary-subtitle">
                Items to be requested from Central Kitchen
              </div>

              {/* Scrollable area: items + ingredients */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* Selected Items */}
                <div className="summary-items" id="summaryItems">
                  {selectedList.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-6">
                      No items selected
                    </div>
                  ) : (
                    selectedList.map(({ itemId, quantity, item, detail }) => (
                      <div key={itemId} className="py-2 border-b border-slate-100 last:border-0">
                        {/* Item row */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{item?.name}</p>
                            <p className="text-xs text-slate-400">x{quantity} {item?.unit}</p>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 ml-2">
                            {((item?.price || 0) * quantity).toLocaleString('vi-VN')}đ
                          </p>
                        </div>

                        {/* Ingredients của item này */}
                        {loadingDetails[itemId] && (
                          <p className="text-xs text-slate-400 mt-1 ml-2 italic">Loading ingredients...</p>
                        )}
                        {detail?.ingredients?.length > 0 && (
                          <div className="mt-2 ml-2 pl-2 border-l-2 border-amber-200">
                            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">Ingredients</p>
                            {detail.ingredients.map((ing, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-slate-500 py-0.5">
                                <span>{ing.name}</span>
                                <span className="font-medium text-slate-600 ml-2">
                                  {(ing.qty * quantity % 1 === 0
                                    ? ing.qty * quantity
                                    : parseFloat((ing.qty * quantity).toFixed(3))
                                  )} {ing.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Tổng hợp toàn bộ nguyên liệu (nếu có nhiều món) */}
                {ingredients.length > 0 && selectedList.length > 1 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-2">
                      Total Ingredients Required
                    </p>
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-600 py-0.5">
                        <span>{ing.name}</span>
                        <span className="font-semibold text-amber-700 ml-2">
                          {(ing.qty % 1 === 0 ? ing.qty : parseFloat(ing.qty.toFixed(3)))} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fixed footer area - always visible */}
              <div className="summary-footer shrink-0 pt-3">
                <div className="summary-line">
                  <span>Subtotal ({selectedList.length} items)</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="summary-line">
                  <span>Processing Fee</span>
                  <span>{PROCESSING_FEE.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="summary-total">
                <span>Estimated Cost</span>
                <span>{(subtotal + PROCESSING_FEE).toLocaleString('vi-VN')}đ</span>
              </div>

              <button
                className="submit-btn flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleClickSubmit}
                disabled={loading || selectedList.length === 0}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Order Request ➤'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header - centered icon + title */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="mx-auto size-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-blue-600">shopping_cart_checkout</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Order Submission</h3>
              <p className="text-sm text-slate-500 mt-1">Are you sure you want to submit this order?</p>
            </div>

            {/* Order Summary Box */}
            <div className="mx-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Items</span>
                <span className="font-semibold text-slate-900">{selectedList.length} products</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Processing Fee</span>
                <span className="font-semibold text-slate-900">{PROCESSING_FEE.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total</span>
                <span className="text-blue-600">{(subtotal + PROCESSING_FEE).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 px-6 py-5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOrder}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
              >
                Submit Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateOrderFranchise;