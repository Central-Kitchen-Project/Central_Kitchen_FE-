import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGetTransactions,
  clearInventoryTransactions,
} from '../../../store/inventoryTransactionSlice';
import { getStoredUserId } from '../../../utils/userInfo';
import { fetchGetOrder } from '../../../store/orderSlice';
import PageHeader from '../../../components/common/PageHeader';
import { extractApiMessage } from '../../../services/api';

function normalizeOrdersArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === 'object') return Object.values(data).find(Array.isArray) || [];
  return [];
}

/** Lấy order id từ transaction (để khớp với đơn franchise đã đặt). */
function getOrderIdFromTransactionRow(r) {
  const t = r.raw ?? r;
  const candidates = [
    t.orderId,
    t.OrderId,
    r.orderRef,
    t.referenceId,
    t.ReferenceId,
    t.order?.id,
    t.Order?.id,
  ];
  for (const c of candidates) {
    if (c === undefined || c === null || c === '') continue;
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Chỉ giao dịch thuộc đơn của franchise đăng nhập (order.userId) hoặc kho gắn userId.
 * Khi đã có danh sách đơn: ưu tiên khớp orderId ∈ đơn của user; không show đơn franchise khác.
 */
function belongsToCurrentFranchise(r, franchiseUserId, myOrderIdsSet) {
  if (franchiseUserId == null) return false;
  const uid = Number(franchiseUserId);
  if (!Number.isFinite(uid)) return false;

  const oid = getOrderIdFromTransactionRow(r);
  const inventoryMatch = String(r.userIdOnRow) === String(uid);

  if (oid != null) {
    return myOrderIdsSet.has(oid);
  }

  return inventoryMatch;
}

function getItemLabel(t) {
  if (t.itemName || t.ItemName) return t.itemName || t.ItemName;
  const inv = t.inventory || t.Inventory;
  const item = inv?.item || inv?.Item || t.item || t.Item;
  return (
    item?.itemName ||
    item?.ItemName ||
    t.materialName ||
    t.item?.itemName ||
    '—'
  );
}

function getSignedQuantity(t) {
  const q =
    t.quantity ??
    t.qty ??
    t.amount ??
    t.changeQuantity ??
    t.Quantity;
  if (q === undefined || q === null) return null;
  const n = Number(q);
  if (!Number.isFinite(n)) return null;
  const tx = String(t.txType || t.TxType || '').toLowerCase();
  if (tx.includes('out')) return -Math.abs(n);
  if (tx.includes('in')) return Math.abs(n);
  return n;
}

/** Franchise chỉ quản lý nhận hàng từ Supply — chỉ hiển thị nhập kho (stock in). */
function isInboundOnly(t) {
  const signed = getSignedQuantity(t);
  if (signed != null) return signed > 0;
  const tx = String(t.txType || t.TxType || '').toLowerCase();
  if (tx.includes('out')) return false;
  return tx.includes('in');
}

function isMaterialRequestRelated(t) {
  const ref = String(t.referenceType || t.ReferenceType || '').toLowerCase();
  const tx = String(t.txType || t.TxType || '').toLowerCase();
  const refCompact = ref.replace(/[\s_-]/g, '');
  if (refCompact.includes('materialrequest')) return true;
  if (tx.includes('materialrequest') || tx.includes('material_request')) return true;
  return false;
}

/**
 * Chỉ đơn Order (nhận hàng theo đơn đặt với Supply) — bỏ mọi giao dịch material request.
 */
function isOrderInboundOnly(t) {
  if (!isInboundOnly(t)) return false;
  if (isMaterialRequestRelated(t)) return false;

  const ref = String(t.referenceType || t.ReferenceType || '').toLowerCase();
  const tx = String(t.txType || t.TxType || '').toLowerCase();

  if (ref.includes('order')) return true;
  if (tx.includes('order_in') || /\border[_\s]?in\b/.test(tx)) return true;
  if (tx.includes('order') && tx.includes('in')) return true;

  const orderId = t.orderId ?? t.OrderId;
  if (orderId != null && String(orderId).trim() !== '') return true;

  return false;
}

const FRANCHISE_MOVEMENT = { label: 'Stock In (from Supply)', tone: 'emerald' };

function formatDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

const PAGE_SIZE = 10;

function FranchiseTransactionHistory() {
  const dispatch = useDispatch();
  const { listTransactions, loading, error } = useSelector((s) => s.INVENTORY_TRANSACTION || {});
  const { listOrders, loading: ordersLoading } = useSelector((s) => s.ORDER || {});

  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = getStoredUserId();
    setUserId(id);
    if (id == null) dispatch(clearInventoryTransactions());
    dispatch(fetchGetOrder());
    dispatch(fetchGetTransactions());
  }, [dispatch]);

  const myOrderIds = useMemo(() => {
    const uid = Number(userId);
    if (!Number.isFinite(uid)) return new Set();
    const orders = normalizeOrdersArray(listOrders);
    const ids = new Set();
    orders.forEach((o) => {
      if (o?.id != null && Number(o?.userId) === uid) {
        ids.add(Number(o.id));
      }
    });
    return ids;
  }, [listOrders, userId]);

  const rows = useMemo(() => {
    const list = Array.isArray(listTransactions) ? listTransactions : [];
    return list
      .filter((t) => isOrderInboundOnly(t))
      .map((t) => {
      const signed = getSignedQuantity(t);
      return {
        raw: t,
        id: t.id ?? t.Id,
        itemLabel: getItemLabel(t),
        unit: t.unit || t.Unit || '',
        signed,
        movement: FRANCHISE_MOVEMENT,
        date: t.createdAt || t.CreatedAt || t.transactionDate || t.date,
        referenceType: t.referenceType || t.ReferenceType || '',
        orderRef: t.orderId ?? t.OrderId ?? t.referenceId ?? t.ReferenceId,
        locationName: t.locationName || t.LocationName || '',
        note: t.note ?? t.Note ?? t.description ?? '',
        userIdOnRow:
          t.userId ??
          t.UserId ??
          t.inventoryUserId ??
          t.inventory?.userId ??
          t.Inventory?.userId,
      };
    });
  }, [listTransactions]);

  const filtered = useMemo(() => {
    let list = rows;

    if (userId == null) {
      list = [];
    } else if (ordersLoading) {
      list = [];
    } else {
      list = rows.filter((r) => belongsToCurrentFranchise(r, userId, myOrderIds));
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.itemLabel.toLowerCase().includes(q) ||
          String(r.note).toLowerCase().includes(q) ||
          String(r.orderRef ?? '').includes(q) ||
          String(r.locationName).toLowerCase().includes(q) ||
          String(r.raw?.txType ?? '').toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
  }, [rows, userId, myOrderIds, ordersLoading, search]);

  const totalPages = useMemo(() => {
    if (filtered.length === 0) return 0;
    return Math.ceil(filtered.length / PAGE_SIZE);
  }, [filtered.length]);

  useEffect(() => {
    setPage(1);
  }, [search, userId, ordersLoading]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const rangeLabel = useMemo(() => {
    if (filtered.length === 0) return null;
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, filtered.length);
    return { from, to, total: filtered.length };
  }, [filtered.length, page]);

  const errorMessage = error ? extractApiMessage(error, 'Failed to load transactions') : '';
  const isBusy = loading || ordersLoading;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <PageHeader
        as="h2"
        title="Stock History"
        subtitle="Stock in tied to your account only: receipts for orders you placed (other franchise accounts are not shown)."
      />
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-1 min-w-[240px] items-center gap-3 bg-slate-100 px-3 py-2 rounded-lg border border-transparent focus-within:border-primary/50 transition-all">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 placeholder:text-slate-500"
              placeholder="Search by item, order ref, note…"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Movement</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                {isBusy && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Loading your orders and stock history…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No order-related stock receipts from Supply yet.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r) => (
                    <tr key={r.id ?? `${r.date}-${r.itemLabel}-${r.orderRef}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700">
                          {r.movement.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {r.itemLabel}
                        {r.unit ? (
                          <span className="block text-xs font-normal text-slate-500">({r.unit})</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {r.signed == null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">
                            +{r.signed}
                            {r.unit ? <span className="text-slate-500 font-normal"> {r.unit}</span> : null}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.orderRef != null && r.orderRef !== '' ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-semibold">#{r.orderRef}</span>
                            {r.referenceType ? (
                              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                                {r.referenceType}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={r.locationName}>
                        {r.locationName || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rangeLabel ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3">
              <p className="text-sm text-slate-600">
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {rangeLabel.from}–{rangeLabel.to}
                </span>{' '}
                of <span className="font-semibold text-slate-800">{rangeLabel.total}</span>
              </p>
              {totalPages > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    Previous
                  </button>
                  <span className="text-sm tabular-nums text-slate-600 px-1">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default FranchiseTransactionHistory;
