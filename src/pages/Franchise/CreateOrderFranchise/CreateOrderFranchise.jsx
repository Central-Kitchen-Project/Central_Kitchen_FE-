import { Link } from 'react-router-dom'
import './CreateOrderFranchise.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchGetAll } from '../../../store/itemSlice';
import axios from 'axios';

function CreateOrderFranchise() {
  const data = useSelector(state => state.ITEM.listItems);
  const dispatch = useDispatch();

  // State quản lý items được chọn: { [itemId]: quantity }
  const [selectedItems, setSelectedItems] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleSubmitOrder = async () => {
    if (selectedList.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: 1,
        items: selectedList.map(({ itemId, quantity }) => ({ itemId, quantity })),
      };

      await axios.post('http://meinamfpt-001-site1.ltempurl.com/api/Order', payload, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      });

      showToast('success', 'Đặt hàng thành công! Đơn hàng đã được gửi đến bếp trung tâm.');
      setSelectedItems({});
    } catch (err) {
      showToast('error', `Đặt hàng thất bại! ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const ingredients = aggregatedIngredients();

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
        <div className="flex-1 flex flex-col overflow-hidden">
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
              />
            </div>
          </div>

          {/* Content */}
          <div className="content-area">
            {/* Products Section */}
            <div className="products-section">
              <div className="products-grid" id="productsGrid">
                {(!data || data.length === 0) && (
                  <div className="col-span-full text-center text-slate-400 py-10">
                    Đang tải sản phẩm...
                  </div>
                )}
                {data && data.map((item) => {
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

              {/* Selected Items */}
              <div className="summary-items" id="summaryItems">
                {selectedList.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-6">
                    Chưa có sản phẩm nào được chọn
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
                        <p className="text-xs text-slate-400 mt-1 ml-2 italic">Đang tải nguyên liệu...</p>
                      )}
                      {detail?.ingredients?.length > 0 && (
                        <div className="mt-2 ml-2 pl-2 border-l-2 border-amber-200">
                          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">Nguyên liệu</p>
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
                    Tổng nguyên liệu cần chuẩn bị
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

              <div className="summary-footer">
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
                onClick={handleSubmitOrder}
                disabled={loading || selectedList.length === 0}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  'Submit Order Request ➤'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateOrderFranchise;