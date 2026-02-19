import React from 'react'
import './MasterAdmin.css'

function MasterAdmin() {
  return (
    <><div className="d-flex">
  {/* Sidebar */}
  <div className="sidebar">
    <div className="sidebar-header">
      <i className="fas fa-cog" /> Admin Dashboard
    </div>
    <div className="sidebar-menu">
      <div className="nav-link">
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
      <div className="nav-link active">
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
    <h3 className="section-title">Master Data Management</h3>
    <button className="btn-primary">
      <i className="fas fa-plus" /> Add Central Kitchen
    </button>
    <div className="card">
      <div className="card-body">
        <table>
          <thead>
            <tr>
              <th>Kitchen Name</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Central Kitchen #1</td>
              <td>Downtown, City A</td>
              <td>5000 units/day</td>
              <td>John Doe</td>
              <td>
                <span className="badge badge-success">Active</span>
              </td>
              <td>
                <i
                  className="fas fa-ellipsis-v"
                  style={{ cursor: "pointer" }}
                />
              </td>
            </tr>
            <tr>
              <td>Central Kitchen #2</td>
              <td>Midtown, City B</td>
              <td>3000 units/day</td>
              <td>Jane Smith</td>
              <td>
                <span className="badge badge-success">Active</span>
              </td>
              <td>
                <i
                  className="fas fa-ellipsis-v"
                  style={{ cursor: "pointer" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

    </>
  )
}

export default MasterAdmin