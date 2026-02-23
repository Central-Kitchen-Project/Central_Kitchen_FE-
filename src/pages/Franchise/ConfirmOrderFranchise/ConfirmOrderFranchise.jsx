import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './ConfirmOrderFranchise.css'

function ConfirmOrderFranchise() {
  const location = useLocation()
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState({ username: 'User' })

  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('USER_INFO')
    navigate('/SignIn')
  }

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('USER_INFO'))
      if (stored) setUserInfo(stored)
    } catch (e) {}
  }, [])
  
  // Get cart items passed from CreateOrder page
  const cartItems = location.state?.cartItems || []
  
  // Calculate counts
  const dishCount = cartItems.filter(item => item.type === 'dish').length
  const rawMaterialCount = cartItems.filter(item => item.type === 'raw' || item.type === 'material').length

  // Calculate summary values
  const totalNeeded = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalAvailable = cartItems.filter(item => item.confirmed).reduce((sum, item) => sum + (item.stockAvailable || 0), 0)
  const totalRequired = cartItems.reduce((sum, item) => Math.max(0, (item.quantity || 0) - (item.stockAvailable || 0)), 0)
  const totalCost = cartItems.reduce((sum, item) => sum + (item.cost || 0), 0)

  return (
    <>
    <div className="confirm-order-page container-main">
  {/* Sidebar */}
  <div className="sidebar">
    <div className="sidebar-header">
      <i className="fas fa-utensils" />
      <span>Central Kitchen</span>
    </div>
    <div className="sidebar-menu">
      <div className="nav-item">
        <i className="fas fa-chart-line" />
        Dashboard
      </div>
      <div className="nav-item active">
        <i className="fas fa-plus" />
        Create Order
      </div>
      <div className="nav-item">
        <i className="fas fa-clipboard-list" />
        Order Tracking
      </div>
      <div className="nav-item">
        <i className="fas fa-boxes" />
        Inventory
      </div>
      <div className="nav-item">
        <i className="fas fa-comments" />
        Feedback
      </div>
    </div>
    <div className="user-section" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
      <div className="user-avatar">{userInfo.username?.charAt(0).toUpperCase()}</div>
      <div className="user-info" style={{flex: 1, minWidth: 0}}>
        <h6>{userInfo.username}</h6>
        <p>Franchise Store Staff</p>
      </div>
      <span onClick={handleLogout} className="material-symbols-outlined" style={{color: '#94a3b8', fontSize: '18px', cursor: 'pointer'}} title="Logout" onMouseEnter={e => e.target.style.color='#ef4444'} onMouseLeave={e => e.target.style.color='#94a3b8'}>logout</span>
    </div>
  </div>
  {/* Main Content */}
  <div className="main-content">
    {/* Header */}
    <div className="header">
      <div className="breadcrumb-custom">
        <i className="fas fa-home" />
        <span>Downtown Branch &gt; Verify Ingredients</span>
      </div>
      <h1 className="header-title">
        Verify &amp; Confirm Ingredients for Order
      </h1>
    </div>
    {/* Content */}
    <div className="content-area">
      {/* Order Item Section */}
      <div className="order-item-section">
        <div className="item-header">
          <div className="item-title">
            <i className="fas fa-list" style={{ marginRight: '10px' }} />
            Ingredients Required for All Dishes &amp; Raw Materials
          </div>
          <div className="item-qty">Dishes: {dishCount} | Raw Materials: {rawMaterialCount}</div>
        </div>
        
        {/* Ingredients Table */}
        <table className="ingredients-table">
          <thead>
            <tr>
              <th>INGREDIENT</th>
              <th>SOURCE &amp; BREAKDOWN</th>
              <th>TOTAL NEEDED</th>
              <th>STOCK AVAILABLE</th>
              <th>STATUS</th>
              <th>NEED TO ORDER</th>
              <th>✓ CONFIRM</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => {
                const needToOrder = Math.max(0, (item.quantity || 0) - (item.stockAvailable || 0))
                const status = (item.stockAvailable || 0) >= (item.quantity || 0) ? 'available' : needToOrder > 0 ? 'insufficient' : 'low'
                return (
                  <tr key={index}>
                    <td className="ingredient-name">{item.name}</td>
                    <td>{item.source || ''}</td>
                    <td>{item.quantity} {item.unit || 'cup'}</td>
                    <td>{item.stockAvailable || 0} {item.unit || 'cup'}</td>
                    <td>
                      <span className={`status-badge status-${status}`}>
                        {status === 'available' ? '✓ Available' : status === 'insufficient' ? '✗ Insufficient' : '⚠ Low'}
                      </span>
                    </td>
                    <td>{needToOrder} {item.unit || 'cup'}</td>
                    <td className="checkbox-cell">
                      <input type="checkbox" />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  No ingredients to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h4 style={{ marginBottom: 16, fontWeight: 700 }}>
          Total Purchase Order Summary
        </h4>
        <div className="summary-row">
          <span>Total Ingredients Needed</span>
          <span>{totalNeeded.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Total Available (Checked)</span>
          <span>{totalAvailable.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Total Additional Purchase Required</span>
          <span>{totalRequired.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total Cost</span>
          <span>${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back to Order
        </button>
        <button className="btn btn-primary" onClick={() => alert('Order confirmed!')}>
          Confirm &amp; Deduct from Stock
        </button>
      </div>
      <p className="note-text" style={{ marginTop: 16, textAlign: "center" }}>
        ✓ Check the box to confirm ingredient availability and deduct from current stock<br />
        The "Need to Order" column shows what needs to be ordered from suppliers if stock is insufficient<br />
        Includes ingredients from all selected dishes PLUS any raw materials added separately
      </p>
    </div>
  </div>
</div>

    </>
  )
}

export default ConfirmOrderFranchise