import React from 'react'
import './DashboardAdmin.css'

function DashboardAdmin() {
  return (
    <>
    <div className="d-flex">
  {/* Sidebar */}
  <div className="sidebar">
    <div className="sidebar-header">
      <i className="fas fa-cog" /> Admin Dashboard
    </div>
    <div className="sidebar-menu">
      <div className="nav-link active">
        <i className="fas fa-chart-line" />
        Dashboard
      </div>
      <div className="nav-link">
        <i className="fas fa-users" />
        User Management
      </div>
      <div className="nav-link">
        <i className="fas fa-lock" />
        RBAC Settings
      </div>
      <div className="nav-link">
        <i className="fas fa-sliders-h" />
        System Configuration
      </div>
      <div className="nav-link">
        <i className="fas fa-database" />
        Master Data
      </div>
    </div>
    <div className="sidebar-footer">
      <div className="avatar">AU</div>
      <div className="admin-info">
        <h6>Admin User</h6>
        <p>Admin User</p>
      </div>
    </div>
  </div>
  {/* Main Content */}
  <div className="main-content">
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-icon blue">
          <i className="fas fa-users" />
        </div>
        <div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">1,256</div>
          <div className="stat-subtitle">Active accounts</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon yellow">
          <i className="fas fa-utensils" />
        </div>
        <div>
          <div className="stat-label">Central Kitchens</div>
          <div className="stat-value">14</div>
          <div className="stat-subtitle">Active locations</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon green">
          <i className="fas fa-store" />
        </div>
        <div>
          <div className="stat-label">Franchise Stores</div>
          <div className="stat-value">68</div>
          <div className="stat-subtitle">Active stores</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon red">
          <i className="fas fa-exclamation-triangle" />
        </div>
        <div>
          <div className="stat-label">System Alerts</div>
          <div className="stat-value">5</div>
          <div className="stat-subtitle">Issues pending</div>
        </div>
      </div>
    </div>
    <div className="content-grid">
      <div className="card">
        <div className="card-header">
          Inventory Alerts <span>⋯</span>
        </div>
        <div className="card-body">
          <table>
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Category</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Mozzarella Blend (S/8)</strong>
                  <br />
                  <small style={{ color: "#9ca3af" }}>SKU: 4 8oz</small>
                </td>
                <td>Dairy &amp; Cheese</td>
                <td>
                  <span className="badge badge-warning">● Low Stock</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Takeaway Boxes - Medium</strong>
                  <br />
                  <small style={{ color: "#9ca3af" }}>SKU: + 19 etz</small>
                </td>
                <td>Packaging</td>
                <td>
                  <span className="badge badge-warning">● Low Stock</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>San Marzano Tomatoes</strong>
                  <br />
                  <small style={{ color: "#9ca3af" }}>SKU: + 1 etz</small>
                </td>
                <td>Produce</td>
                <td>
                  <span className="badge badge-danger">● Low Stock</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div
            style={{
              paddingTop: 16,
              borderTop: "1px solid var(--gray-200)",
              marginTop: 16
            }}
          >
            <a
              href="#"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 500
              }}
            >
              View Inventory
            </a>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          Purchase Requests <span>⋯</span>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                borderBottom: "1px solid var(--gray-200)",
                paddingBottom: 16
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8
                }}
              >
                <div>
                  <strong style={{ color: "var(--gray-900)" }}>
                    Order #5737
                  </strong>
                  <br />
                  <small style={{ color: "#9ca3af" }}>📦 Dairy Gold Ltd</small>
                </div>
                <span className="badge badge-warning">Pending Approval</span>
              </div>
              <small style={{ color: "#9ca3af" }}>
                📦 30L Whipping Cream Apr 28, 2024
              </small>
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <small style={{ color: "#9ca3af" }}>30L</small>
                <button
                  className="btn-primary"
                  style={{ marginLeft: 8, padding: "4px 12px" }}
                >
                  Restock ↻
                </button>
              </div>
            </div>
            <div
              style={{
                borderBottom: "1px solid var(--gray-200)",
                paddingBottom: 16
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8
                }}
              >
                <div>
                  <strong style={{ color: "var(--gray-900)" }}>
                    Order #5736
                  </strong>
                  <br />
                  <small style={{ color: "#9ca3af" }}>
                    📦 Global Grains Supply
                  </small>
                </div>
                <span className="badge badge-danger">Approval Needed</span>
              </div>
              <small style={{ color: "#9ca3af" }}>
                📦 500kg All-Purpose Flour Apr 28, 2024
              </small>
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <small style={{ color: "#9ca3af" }}>500kg</small>
                <button
                  className="btn-primary"
                  style={{ marginLeft: 8, padding: "4px 12px" }}
                >
                  Restock ↻
                </button>
              </div>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8
                }}
              >
                <div>
                  <strong style={{ color: "var(--gray-900)" }}>
                    Order #5735
                  </strong>
                  <br />
                  <small style={{ color: "#9ca3af" }}>
                    📦 Mediterranean Imports
                  </small>
                </div>
                <span className="badge badge-warning">Pending Approval</span>
              </div>
              <small style={{ color: "#9ca3af" }}>
                📦 50L Olive Oil Apr 24, 2024
              </small>
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <small style={{ color: "#9ca3af" }}>0</small>
                <button
                  className="btn-primary"
                  style={{ marginLeft: 8, padding: "4px 12px" }}
                >
                  Restock ↻
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="content-grid">
      <div className="card">
        <div className="card-header">
          System Overview <span>⋯</span>
        </div>
        <div className="card-body">
          <div className="system-grid">
            <div className="metric-item">
              <div className="metric-label">
                <i
                  className="fas fa-file-alt"
                  style={{ color: "var(--primary)" }}
                />{" "}
                Total Requests <small style={{ color: "#9ca3af" }}>Today</small>
              </div>
              <div className="metric-value">
                6,854{" "}
                <span style={{ color: "var(--success)", fontSize: 14 }}>
                  <i className="fas fa-arrow-up" />
                </span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                <i
                  className="fas fa-clock"
                  style={{ color: "var(--success)" }}
                />{" "}
                Avg Response Time{" "}
                <small style={{ color: "#9ca3af" }}>Today</small>
              </div>
              <div className="metric-value">
                132ms{" "}
                <span style={{ color: "var(--success)", fontSize: 14 }}>
                  <i className="fas fa-arrow-down" />
                </span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                <i
                  className="fas fa-chart-line"
                  style={{ color: "var(--success)" }}
                />{" "}
                Success Rate <small style={{ color: "#9ca3af" }}>Today</small>
              </div>
              <div className="metric-value">
                99.2%{" "}
                <span style={{ color: "var(--success)", fontSize: 14 }}>
                  <i className="fas fa-arrow-up" />
                </span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">
                <i
                  className="fas fa-exclamation-triangle"
                  style={{ color: "var(--danger)" }}
                />{" "}
                Failed Jobs <small style={{ color: "#9ca3af" }}>Last 24h</small>
              </div>
              <div className="metric-value">
                8{" "}
                <span style={{ color: "var(--danger)", fontSize: 14 }}>
                  <i className="fas fa-arrow-up" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          Quick Actions <span>⋯</span>
        </div>
        <div className="card-body">
          <div className="quick-grid">
            <div className="quick-btn">
              <div className="quick-icon blue">
                <i className="fas fa-users" />
              </div>
              <div className="quick-text">
                <h6>Manage Users</h6>
              </div>
            </div>
            <div className="quick-btn">
              <div className="quick-icon purple">
                <i className="fas fa-lock" />
              </div>
              <div className="quick-text">
                <h6>Configure Roles</h6>
              </div>
            </div>
            <div className="quick-btn">
              <div className="quick-icon orange">
                <i className="fas fa-sliders-h" />
              </div>
              <div className="quick-text">
                <h6>System Settings</h6>
              </div>
            </div>
            <div className="quick-btn">
              <div className="quick-icon emerald">
                <i className="fas fa-database" />
              </div>
              <div className="quick-text">
                <h6>Master Data</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    </>
  )
}

export default DashboardAdmin