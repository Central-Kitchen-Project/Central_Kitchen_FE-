

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetOrder } from '../../../store/orderSlice';
import { fetchGetInventory } from '../../../store/inventorySlice';
import { fetchGetMaterialRequest } from '../../../store/materialSlice';
import './DashboardCentral.css';
import PageHeader from '../../../components/common/PageHeader';
import { getStoredUserId } from '../../../utils/userInfo';

function getMaterialRequestDisplayStatus(status) {
  switch (status) {
    case 'Approved':
    case 'Fulfilled':
    case 'Confirmed':
      return 'Confirmed';
    case 'Pending':
    case 'Processing':
      return 'Processing';
    default:
      return status || 'Unknown';
  }
}

function getMaterialStatusBadgeClass(status) {
  const display = getMaterialRequestDisplayStatus(status);
  if (display === 'Confirmed') return 'bg-green-50 text-green-600';
  if (display === 'Processing') return 'bg-amber-50 text-amber-600';
  return 'bg-slate-50 text-slate-500';
}

function DashboardCentral() {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setUserId(getStoredUserId());
  }, []);

  // Lấy dữ liệu từ redux (đúng tên state trong store/index.js)
  const ordersRaw = useSelector(state => state.ORDER?.listOrders);
  const ordersLoading = useSelector(state => state.ORDER?.loading);
  const inventoryRaw = useSelector(state => state.INVENTORY?.listInventory);
  const inventoryLoading = useSelector(state => state.INVENTORY?.loading);
  const materialsRaw = useSelector(state => state.MATERIAL?.listMaterials);

  // Ép kiểu về mảng an toàn
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];
  const inventory = Array.isArray(inventoryRaw) ? inventoryRaw : [];
  const materials = Array.isArray(materialsRaw) ? materialsRaw : [];

  // Gọi API khi mount
  useEffect(() => {
    dispatch(fetchGetOrder());
    if (userId != null) dispatch(fetchGetInventory(userId));
    dispatch(fetchGetMaterialRequest());
  }, [dispatch, userId]);

  // Số liệu cơ bản
  // Lấy số liệu theo material requests (giống Material Tracking/Order Aggregation)
  const totalRequests = materials.length;
  const pendingAggregation = materials.filter(r => getMaterialRequestDisplayStatus(r.status) === 'Processing').length;
  const fulfilledRequests = materials.filter(r => getMaterialRequestDisplayStatus(r.status) === 'Confirmed').length;

  // 3 order aggregation mới nhất (pending material requests, flatten từng item)
  const processingAggregations = Array.isArray(materials)
    ? materials
        .filter((req) => getMaterialRequestDisplayStatus(req.status) === 'Processing' && Array.isArray(req.items) && req.items.length > 0)
        .flatMap((req) => req.items.map((item) => ({
            requestId: req.id,
            materialName: item.materialName,
            requestedQuantity: item.requestedQuantity,
            unit: item.unit,
            requestedBy: req.requestedByUsername || req.requestedBy || '-',
            status: getMaterialRequestDisplayStatus(req.status),
            note: req.note,
            createdAt: req.createdAt,
          })))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3)
    : [];
  // 3 material request mới nhất
  const latestMaterials = Array.isArray(materials)
    ? [...materials].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)).slice(0, 3)
    : [];

  if (ordersLoading || inventoryLoading) {
    return <div className="p-8 text-center text-lg">Loading dashboard...</div>;
  }

  return (
    <>
    <PageHeader
      as="h2"
      title="Dashboard"
      subtitle="Central kitchen dashboard overview."
    />
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-slate-50/50">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
              <span className="material-symbols-outlined text-[24px] text-slate-600">assignment</span>
            </span>
            <div>
              <div className="text-2xl font-bold text-navy-charcoal">{totalRequests}</div>
              <div className="text-sm text-slate-500 font-medium mt-1">Total Requests</div>
            </div>
          </div>
        </div>
        {/* Processing Requests */}
        <div className="bg-white p-5 rounded-xl border border-blue-50 shadow-soft flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
              <span className="material-symbols-outlined text-[24px] text-blue-500">autorenew</span>
            </span>
            <div>
              <div className="text-2xl font-bold text-navy-charcoal">{pendingAggregation}</div>
              <div className="text-sm text-yellow-700 font-medium mt-1">Processing Aggregation</div>
            </div>
          </div>
        </div>
        {/* Confirmed Requests */}
        <div className="bg-white p-5 rounded-xl border border-green-50 shadow-soft flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
              <span className="material-symbols-outlined text-[24px] text-green-500">task_alt</span>
            </span>
            <div>
              <div className="text-2xl font-bold text-navy-charcoal">{fulfilledRequests}</div>
              <div className="text-sm text-green-700 font-medium mt-1">Confirmed Requests</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-xl border border-slate-200 shadow-soft">
        <h3 className="text-xs font-bold mr-4 text-slate-400 uppercase tracking-widest">
          Quick Actions
        </h3>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
          onClick={() => window.location.href = '/OrderAggregation'}
        >
          <span className="material-symbols-outlined text-[18px]">list_alt</span>
          Order Aggregation
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-navy-charcoal text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm"
          onClick={() => window.location.href = '/MaterialTracking'}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          Material Tracking
        </button>
      </div>

      {/* Latest Order Aggregation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6 mt-4 max-w-5xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-bold text-navy-charcoal uppercase tracking-wider">Latest Order Aggregation</h3>
          <a href="/OrderAggregation" className="text-primary text-sm font-bold hover:underline">View all</a>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
              <th className="px-4 py-2">#ID</th>
              <th className="px-4 py-2">Material Name</th>
              <th className="px-4 py-2">Requested Qty</th>
              <th className="px-4 py-2">Requested By</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
            {processingAggregations.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-2 text-center text-slate-400">No processing aggregation</td></tr>
            ) : (
              processingAggregations.map((item, idx) => {
                const displayStatus = getMaterialRequestDisplayStatus(item.status);

                return (
                  <tr key={item.requestId + '-' + item.materialName + '-' + idx}>
                    <td className="px-4 py-2 font-mono">#{item.requestId}</td>
                    <td className="px-4 py-2 font-bold">{item.materialName}</td>
                    <td className="px-4 py-2">{item.requestedQuantity} {item.unit}</td>
                    <td className="px-4 py-2">{item.requestedBy}</td>
                    <td className="px-4 py-2">
                      <span className={`${getMaterialStatusBadgeClass(item.status)} px-2 py-1 rounded-full text-xs font-bold`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 italic text-slate-500">{item.note || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Latest Material Requests */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6 mt-4 max-w-5xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-bold text-navy-charcoal uppercase tracking-wider">Latest Material Requests</h3>
          <a href="/MaterialTracking" className="text-primary text-sm font-bold hover:underline">View all</a>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
              <th className="px-4 py-2">Request ID</th>
              <th className="px-4 py-2">Order Ref</th>
              <th className="px-4 py-2">Requested By</th>
              <th className="px-4 py-2">Materials</th>
              <th className="px-4 py-2">Note</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
            {latestMaterials.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-2 text-center text-slate-400">No requests</td></tr>
            ) : (
              latestMaterials.map((mat, idx) => (
                <tr key={mat.id || idx}>
                  <td className="px-4 py-2 font-mono">{mat.code || mat.id || '-'}</td>
                  <td className="px-4 py-2">{mat.orderId ? `#ORD-${mat.orderId}` : '-'}</td>
                  <td className="px-4 py-2">{mat.requestedByUsername || mat.requestedBy || '-'}</td>
                  <td className="px-4 py-2">
                    {(mat.items && mat.items.length > 0)
                      ? `${mat.items[0].requestedQuantity} ${mat.items[0].unit} ${mat.items[0].materialName}` + (mat.items.length > 1 ? ` +${mat.items.length - 1} more` : '')
                      : '-'}
                  </td>
                  <td className="px-4 py-2 italic text-slate-500">{mat.note || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={
                      getMaterialRequestDisplayStatus(mat.status) === 'Confirmed' ? 'bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-bold' :
                      getMaterialRequestDisplayStatus(mat.status) === 'Processing' ? 'bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-xs font-bold' :
                      'bg-slate-50 text-slate-500 px-2 py-1 rounded-full text-xs font-bold'
                    }>
                      {getMaterialRequestDisplayStatus(mat.status) || '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* ĐÃ LƯỢC BỎ: bảng production plan, bảng nguyên liệu sắp hết hạn, chỉ giữ số liệu tổng quan */}
    </div>

    </>
  )
}

export default DashboardCentral