import React from 'react'
import './DashboardManager.css'
function DashboardManager() {
  return (
    <>
    <div className="d-flex">
  {/* Sidebar */}
  <div className="sidebar">
    <div className="sidebar-header">
      <i className="fas fa-briefcase" /> Manager Dashboard
    </div>
    <div className="sidebar-menu">
      <div className="nav-link active">
        <i className="fas fa-chart-line" />
        Dashboard
      </div>
      <div className="nav-link">
        <i className="fas fa-boxes" />
        Inventory Management
      </div>
      <div className="nav-link">
        <i className="fas fa-clipboard-list" />
        Purchase Orders
      </div>
      <div className="nav-link">
        <i className="fas fa-industry" />
        Menu Management
      </div>
      <div className="nav-link">
        <i className="fas fa-chart-bar" />
        Reports &amp; Analytics
      </div>
    </div>
    <div className="sidebar-footer">
      <div className="avatar">M</div>
      <div className="admin-info">
        <h6>Manager</h6>
        <p>Central Kitchen #1</p>
      </div>
    </div>
  </div>
  {/* Main Content */}
  <div className="main-content">
    <h3 className="section-title">Dashboard Overview</h3>
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-icon green">
          <i className="fas fa-boxes" />
        </div>
        <div>
          <div className="stat-label">Current Inventory</div>
          <div className="stat-value">2,450</div>
          <div className="stat-subtitle">Total units</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon blue">
          <i className="fas fa-shopping-cart" />
        </div>
        <div>
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">12</div>
          <div className="stat-subtitle">Awaiting approval</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon yellow">
          <i className="fas fa-exclamation-circle" />
        </div>
        <div>
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">8</div>
          <div className="stat-subtitle">Need restock</div>
        </div>
      </div>
    </div>
    <div className="content-grid">
      <div className="card">
        <div className="card-header">
          Production Output (Weekly) <span>⋯</span>
        </div>
        <div className="chart-container">
          <div className="chart-bar">
            <div className="bar" style={{ height: "65%" }} />
            <div className="bar-label">Mon</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "85%" }} />
            <div className="bar-label">Tue</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "72%" }} />
            <div className="bar-label">Wed</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "90%" }} />
            <div className="bar-label">Thu</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "78%" }} />
            <div className="bar-label">Fri</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "60%" }} />
            <div className="bar-label">Sat</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "40%" }} />
            <div className="bar-label">Sun</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          Key Metrics <span>⋯</span>
        </div>
        <div className="card-body">
          <div className="metric-item">
            <div className="metric-label">Production Efficiency</div>
            <div className="metric-value">94.2%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Waste Rate</div>
            <div className="metric-value">3.1%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">On-Time Delivery</div>
            <div className="metric-value">98.5%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Inventory Turnover</div>
            <div className="metric-value">12.3x</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    </>
  )
}

export default DashboardManager