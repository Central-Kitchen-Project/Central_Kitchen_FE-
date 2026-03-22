import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchGetAllFeedback, fetchCreateFeedback } from '../../../store/feedbackSlice'
import { fetchGetOrder } from '../../../store/orderSlice'
import './FeedbackFranchise.css'

function FeedbackFranchise() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const feedbacks = useSelector((state) => state.FEEDBACK.listFeedbacks);
  const loading = useSelector((state) => state.FEEDBACK.loading);
  const orders = useSelector((state) => state.ORDER.listOrders);

  const [category, setCategory] = useState('Quality');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(null); // 1-5 or null
  const [filterStatus, setFilterStatus] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const lockedOrderId = searchParams.get('orderId');
  const isLockedToOrder = Boolean(lockedOrderId);

  useEffect(() => {
    dispatch(fetchGetAllFeedback());
    dispatch(fetchGetOrder());
  }, [dispatch]);

  // Preselect orderId from OrderTracking navigation (?orderId=123)
  useEffect(() => {
    if (lockedOrderId) setOrderId(String(lockedOrderId));
  }, [lockedOrderId]);

  // Lấy userId từ order được chọn
  const getSelectedUserId = () => {
    if (!orderId) return null;
    const order = orders?.find((o) => o.id === Number(orderId));
    return order?.userId || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId) {
      alert('Missing Order ID. Please go back to the Order Tracking page and click Feedback from a Completed order.');
      return;
    }
    if (!subject.trim()) {
      alert('Please enter a subject.');
      return;
    }
    setSubmitting(true);
    try {
      const uid = getSelectedUserId() || 0;
      const body = {
        userId: uid,
        category,
        orderId: orderId ? Number(orderId) : null,
        subject: subject.trim(),
        description: description.trim() ? description.trim() : null,
        rating: typeof rating === 'number' ? rating : null,
      };
      console.log('POST /api/Feedback body:', body);
      await dispatch(fetchCreateFeedback(body)).unwrap();
      alert('Feedback has been submitted successfully!');
      setCategory('Quality');
      setSubject('');
      setDescription('');
      setRating(null);
      dispatch(fetchGetAllFeedback());
    } catch {
      alert('Failed to submit feedback, please try again.');
    }
    setSubmitting(false);
  };

  const normalizeStatus = (status) => {
    const value = String(status || '').trim().toLowerCase();
    if (value === 'underreview' || value === 'under review') return 'UnderReview';
    if (value === 'received') return 'Received';
    if (value === 'resolved') return 'Resolved';
    return null;
  };

  const statusLabel = (status) => {
    const n = normalizeStatus(status);
    if (n === 'UnderReview') return 'Under Review';
    if (n === 'Received') return 'Received';
    if (n === 'Resolved') return 'Resolved';
    return status ? String(status) : '—';
  };

  const statusBadgeClass = (status) => {
    switch (normalizeStatus(status)) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UnderReview':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Received':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  /** Giống DashboardFranchise: chỉ feedback của user đăng nhập hoặc gắn đơn của user */
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('USER_INFO')) || {};
    } catch {
      return {};
    }
  }, []);

  const myOrderIds = useMemo(() => {
    const uid = Number(userInfo?.id);
    if (!Number.isFinite(uid)) return new Set();
    const arr = Array.isArray(orders) ? orders : [];
    return new Set(
      arr
        .filter((o) => Number(o?.userId) === uid)
        .map((o) => Number(o.id))
        .filter(Number.isFinite)
    );
  }, [orders, userInfo?.id]);

  const myFeedbacks = useMemo(() => {
    const list = Array.isArray(feedbacks) ? feedbacks : [];
    const uid = Number(userInfo?.id);
    if (!Number.isFinite(uid)) return list;

    return list.filter((fb) => {
      const feedbackOrderId = Number(fb.orderId);
      const feedbackUserId = Number(fb.userId ?? fb.createdBy ?? fb.customerId);
      if (Number.isFinite(feedbackOrderId) && myOrderIds.has(feedbackOrderId)) return true;
      if (Number.isFinite(feedbackUserId) && feedbackUserId === uid) return true;
      return false;
    });
  }, [feedbacks, myOrderIds, userInfo?.id]);

  const filteredFeedbacks = useMemo(() => {
    if (filterStatus === 'All') return myFeedbacks;
    return myFeedbacks.filter((fb) => normalizeStatus(fb.status) === filterStatus);
  }, [myFeedbacks, filterStatus]);

  // Reset to page 1 when danh sách sau lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [myFeedbacks?.length, filterStatus]);

  const categoryColor = (cat) => {
    switch (cat) {
      case 'Quality': return 'bg-amber-100 text-amber-700';
      case 'Delivery': return 'bg-orange-100 text-orange-700';
      case 'Packaging': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil((filteredFeedbacks?.length || 0) / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedFeedbacks = filteredFeedbacks?.slice(startIdx, endIdx) || [];

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  return (
    <>
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900">
          Feedback &amp; Support
        </h2>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="text-xs font-medium">Downtown Branch</span>
        </div>
      </div>
    </header>
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Submit New Feedback
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provide details about your issue or suggestion for the central
            kitchen.
          </p>
        </div>
        <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="category"
            >
              Category
            </label>
            <select
              className="rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Quality">Quality Issues</option>
              <option value="Delivery">Delivery Issues</option>
              <option value="Packaging">Packaging Issues</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="order-id"
            >
              Order Reference ID <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="order-id"
                className="flex-1 rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary disabled:bg-slate-50 disabled:text-slate-500"
                value={orderId ? `#ORD-${orderId}` : ''}
                readOnly
                disabled={!orderId || isLockedToOrder}
                placeholder="Order ID will be filled from Order Tracking"
              />
              {!isLockedToOrder && (
                <input
                  className="w-40 rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
                  inputMode="numeric"
                  placeholder="Enter ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.replace(/[^\d]/g, ''))}
                />
              )}
            </div>
            {isLockedToOrder && (
              <p className="text-xs text-slate-400">
                Order ID is prefilled from Order Tracking (cannot be changed).
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="subject"
            >
              Subject
            </label>
            <input
              className="rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              id="subject"
              placeholder="Summarize the issue"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="description"
            >
              Detailed Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              className="rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              id="description"
              placeholder="Please provide specific details..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Rating <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((v) => {
                  const active = (rating || 0) >= v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRating(v)}
                      className={`p-2 rounded transition-colors ${
                        active ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'
                      }`}
                      aria-label={`Rate ${v} star${v > 1 ? 's' : ''}`}
                      title={`${v}/5`}
                    >
                      <span className="material-symbols-outlined text-[36px]">star</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-slate-500">
                {typeof rating === 'number' ? `${rating}/5` : 'No rating'}
              </span>
              {typeof rating === 'number' && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              type="button"
              onClick={() => { setCategory('Quality'); setSubject(''); setDescription(''); setRating(null); if (!isLockedToOrder) setOrderId(''); }}
            >
              Cancel
            </button>
            <button
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors font-semibold text-sm disabled:opacity-50"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </section>
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">
            Past Feedback History
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <select
              className="text-xs border-slate-200 rounded px-2 py-1"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Resolved">Resolved</option>
              <option value="UnderReview">Under Review</option>
              <option value="Received">Received</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ref ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : !filteredFeedbacks || filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No feedback found.
                  </td>
                </tr>
              ) : (
                paginatedFeedbacks.map((fb) => {
                  return (
                    <tr key={fb.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {fb.feedbackDate ? new Date(fb.feedbackDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {typeof fb.rating === 'number' ? (
                          <div className="flex items-center gap-1 text-amber-500">
                            <span className="text-sm font-bold">{fb.rating}</span>
                            <span className="text-xs text-slate-400">/5</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColor(fb.category)}`}>
                          {fb.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {fb.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary font-medium">
                        {fb.refId ? `${fb.refId}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass(fb.status)}`}
                        >
                          {statusLabel(fb.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Showing {paginatedFeedbacks.length > 0 ? startIdx + 1 : 0} to {Math.min(endIdx, filteredFeedbacks?.length || 0)} of {filteredFeedbacks?.length || 0} reports
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

export default FeedbackFranchise