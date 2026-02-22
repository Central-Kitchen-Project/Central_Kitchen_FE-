import React from 'react'
import { Link } from 'react-router-dom'
import './CreateOrderFranchise.css'

function CreateOrderFranchise() {
  // State để lưu số lượng items 
  const [itemCount, setItemCount] = React.useState(7)
  return (
    <>
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
          <p className="text-sm font-semibold text-slate-900 truncate">
            Alex Johnson
          </p>
          <p className="text-xs text-slate-500 truncate">Store Manager</p>
        </div>
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
          <button className="tab-btn active" onclick="filterByCategory('all')">
            All Products
          </button>
          <button className="tab-btn" onclick="filterByCategory('pizza')">
            Pizzas
          </button>
          <button className="tab-btn" onclick="filterByCategory('chicken')">
            Fried Chicken
          </button>
          <button className="tab-btn" onclick="filterByCategory('flour')">
            Flour &amp; Baking
          </button>
          <button className="tab-btn" onclick="filterByCategory('dairy')">
            Dairy &amp; Cheese
          </button>
          <button className="tab-btn" onclick="filterByCategory('oils')">
            Oils &amp; Sauces
          </button>
          <button className="tab-btn" onclick="filterByCategory('meat')">
            Meat &amp; Spices
          </button>
        </div>
        <div className="products-grid" id="productsGrid">
          {/* Products will be generated here */}
        </div>
      </div>
      {/* Order Summary */}
      <div className="order-summary">
        <div className="summary-title">Order Summary</div>
        <div className="summary-subtitle">
          Items to be requested from Central Kitchen
        </div>
        <div className="summary-items" id="summaryItems">
          {/* Items will be added here */}
        </div>
        <div className="summary-footer">
          <div className="summary-line">
            <span>Subtotal ({itemCount} items)</span>
            <span id="subtotal">$288.50</span>
          </div>
          <div className="summary-line">
            <span>Processing Fee</span>
            <span>$5.00</span>
          </div>
        </div>
        <div className="summary-total">
          <span>Estimated Cost</span>
          <span id="total">$293.50</span>
        </div>
        <button className="submit-btn" onclick="submitOrder()">
          Submit Order Request ➤
        </button>
      </div>
    </div>
  </div>
</div>

    </>
  )
}

export default CreateOrderFranchise