import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers, fetchDashboardCount } from '../../store/userSlice'
import { fetchGetOrder } from '../../store/orderSlice'
import './DashboardAdmin.css'

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === 'object') return Object.values(data).find(Array.isArray) || [];
  return [];
};

const ROLE_MAP = { 1: 'Admin', 2: 'Manager', 3: 'Franchise Store', 4: 'Central Kitchen', 5: 'Supply Coordinator' };

const STATUS_COLORS = {
  Pending: 'bg-amber-50 text-amber-700',
  Processing: 'bg-blue-50 text-blue-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-700',
  Approved: 'bg-emerald-50 text-emerald-700',
};

function DashboardAdmin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { users, dashboardCount } = useSelector((state) => state.USER)
  const { listOrders } = useSelector((state) => state.ORDER || { listOrders: [] })

  const userList = normalizeArray(users)
  const orderList = normalizeArray(listOrders)

  useEffect(() => {
    dispatch(fetchAllUsers())
    dispatch(fetchDashboardCount())
    dispatch(fetchGetOrder())
  }, [dispatch])

  // Derive stats from dashboardCount.roleCounts array
  const getRoleCount = (roleId) => {
    const roleCounts = dashboardCount?.roleCounts || [];
    const found = (Array.isArray(roleCounts) ? roleCounts : roleCounts.$values || []).find(r => r.roleId === roleId);
    return found?.count ?? 0;
  };
  const totalUsers = dashboardCount?.totalUsers ?? userList.length
  const totalCentralKitchen = getRoleCount(4) || userList.filter(u => u.roleId === 4).length
  const totalFranchise = getRoleCount(3) || userList.filter(u => u.roleId === 3).length
  const totalSupplyCoordinator = getRoleCount(5) || userList.filter(u => u.roleId === 5).length
  const totalOrders = orderList.length

  // Recent orders (last 5)
  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.createdAt || b.orderDate || 0) - new Date(a.createdAt || a.orderDate || 0))
    .slice(0, 5)

  // Recent users (last 5)
  const recentUsers = [...userList]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5)

  return (
    <>
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
      <h2 className="text-lg font-bold text-slate-900">Admin Dashboard</h2>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
    {/* Stats Row - 5 columns */}
    <div className="grid grid-cols-5 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
            <i className="fas fa-users text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{totalUsers}</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Central Kitchen</span>
          <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
            <i className="fas fa-utensils text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{totalCentralKitchen}</span>
        <span className="text-[11px] text-slate-500">Staff members</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Franchise Staff</span>
          <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            <i className="fas fa-store text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{totalFranchise}</span>
        <span className="text-[11px] text-slate-500">Store staff</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supply Coordinator</span>
          <div className="size-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
            <i className="fas fa-truck text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{totalSupplyCoordinator}</span>
        <span className="text-[11px] text-slate-500">Coordinators</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
            <i className="fas fa-shopping-cart text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">{totalOrders}</span>
        <span className="text-[11px] text-slate-500">All time</span>
      </div>
    </div>

    {/* Content Grid - 2 columns */}
    <div className="grid grid-cols-2 gap-4">
      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Recent Orders</span>
          <Link to="/OrderManagement" className="text-xs font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="p-4">
          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No orders found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Order #</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-2">
                      <span className="text-xs font-semibold text-slate-800">#{order.id}</span>
                    </td>
                    <td className="py-2.5 text-xs text-slate-600">
                      {order.createdAt || order.orderDate ? new Date(order.createdAt || order.orderDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        ● {order.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Recent Users</span>
          <Link to="/UserManagement" className="text-xs font-medium text-primary hover:underline">Manage →</Link>
        </div>
        <div className="p-4">
          {recentUsers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No users found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Name</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Email</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-slate-600">{user.email}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {ROLE_MAP[user.roleId] || `Role ${user.roleId}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>

    {/* Bottom Grid - System Overview + Quick Actions */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">System Overview</span>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-3 border-b border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-users text-primary text-[10px]" />
              <span>Total Users</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{totalUsers}</span>
          </div>
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-shopping-cart text-emerald-500 text-[10px]" />
              <span>Total Orders</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{totalOrders}</span>
          </div>
          <div className="p-3 border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-utensils text-amber-500 text-[10px]" />
              <span>Kitchen Staff</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{totalCentralKitchen}</span>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-store text-violet-500 text-[10px]" />
              <span>Franchise Staff</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{totalFranchise}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Quick Actions</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <Link to="/UserManagement" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <i className="fas fa-users text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Manage Users</span>
          </Link>
          <Link to="/RBACSettings" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
              <i className="fas fa-lock text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Configure Roles</span>
          </Link>
          <Link to="/SystemConfiguration" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <i className="fas fa-sliders-h text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">System Settings</span>
          </Link>
          <Link to="/MasterAdmin" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <i className="fas fa-database text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Master Data</span>
          </Link>
        </div>
      </div>
    </div>
    </div>
    </>
  )
}

export default DashboardAdmin