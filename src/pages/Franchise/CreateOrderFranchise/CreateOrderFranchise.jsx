import { Link, useNavigate } from 'react-router-dom'
import './CreateOrderFranchise.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchGetAll } from '../../../store/itemSlice';
import axios from 'axios';

function CreateOrderFranchise() {
  const data = useSelector(state => state.ITEM.listItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ username: 'User' });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('USER_INFO'));
      if (stored) setUserInfo(stored);
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('USER_INFO');
    navigate('/SignIn');
  };

  // State quản lý items được chọn: { [itemId]: quantity }
  const [selectedItems, setSelectedItems] = useState({});
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchGetAll({ type: "", category: "" }));
  }, [dispatch]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
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
    }
  };

  const selectedList = Object.entries(selectedItems).map(([id, quantity]) => {
    const item = data?.find(d => d.id === parseInt(id));
    return { itemId: parseInt(id), quantity, item };
  });

  const subtotal = selectedList.reduce((sum, { item, quantity }) => {
    return sum + (item?.price || 0) * quantity;
  }, 0);

  const PROCESSING_FEE = 5000;

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

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-green-500'
            : 'bg-red-500'
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
        {/* SideNavBar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#111418] text-base font-bold leading-tight">
                  Franchise Store
                </h1>
                <p className="text-[#617589] text-xs font-normal">
                  Management System
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 flex flex-col gap-2">
            <Link to="/DashboardFranchise" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer">
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Dashboard</p>
            </Link>
            <Link to="/CreateOrderFranchise" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">add_circle</span>
              <p className="text-sm font-semibold">Create Order</p>
            </Link>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer" href="#">
              <span className="material-symbols-outlined">local_shipping</span>
              <p className="text-sm font-medium">Order Tracking</p>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer" href="#">
              <span className="material-symbols-outlined">inventory_2</span>
              <p className="text-sm font-medium">Inventory</p>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer" href="#">
              <span className="material-symbols-outlined">chat_bubble</span>
              <p className="text-sm font-medium">Feedback</p>
            </a>
          </nav>
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArL6LMmhfprJJIgPL27X4ehzw6zA5F1MySky4vVwBMlBFgHHSivzWpg_tSlDUI1JJM0y0V8H90Ffp8HXmvbXEqLQQRNt0liR3iCy_7Y2DJ_vwk75Y7-2qkz9uNqYTRMkqjnwhT2jONosRlgFAwgweq9wyBV802U7O6LKWIs-e5c2qXlgfR-VdHGPOIDanpots-Tosr5nhVtIPPfk9LRwStw6_0C2yJ6e-q_kZnJw_psjZs_bNe-zH_X1xyPC0_z_PuAYFKVXJ5PPQ")'
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{userInfo.username}</p>
                <p className="text-xs text-slate-500 truncate">Franchise Store Staff</p>
              </div>
              <span onClick={handleLogout} className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors" title="Logout">
                logout
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="ml-64 flex-1 flex flex-col overflow-hidden">
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
              <div className="category-tabs">
                <button className="tab-btn active">All Products</button>
                <button className="tab-btn">Pizzas</button>
                <button className="tab-btn">Fried Chicken</button>
                <button className="tab-btn">Flour &amp; Baking</button>
                <button className="tab-btn">Dairy &amp; Cheese</button>
                <button className="tab-btn">Oils &amp; Sauces</button>
                <button className="tab-btn">Meat &amp; Spices</button>
              </div>

              {/* Products Grid từ API */}
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
                      {/* Header card */}
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

                      {/* Tags */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium capitalize">{item.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.unit}</span>
                      </div>

                      {/* Price */}
                      <p className="text-base font-bold text-primary">
                        {item.price.toLocaleString('vi-VN')}đ
                        <span className="text-xs font-normal text-slate-400">/{item.unit}</span>
                      </p>

                      {/* Quantity input khi được chọn */}
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

              <div className="summary-items" id="summaryItems">
                {selectedList.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-6">
                    Chưa có sản phẩm nào được chọn
                  </div>
                ) : (
                  selectedList.map(({ itemId, quantity, item }) => (
                    <div key={itemId} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{item?.name}</p>
                        <p className="text-xs text-slate-400">x{quantity} {item?.unit}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 ml-2">
                        {((item?.price || 0) * quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  ))
                )}
              </div>

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