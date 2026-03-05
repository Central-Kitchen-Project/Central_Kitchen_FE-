import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetAllFeedback, fetchCreateFeedback } from '../../../store/feedbackSlice'
import { fetchGetOrder } from '../../../store/orderSlice'
import './FeedbackFranchise.css'

function FeedbackFranchise() {
  const dispatch = useDispatch();
  const feedbacks = useSelector((state) => state.FEEDBACK.listFeedbacks);
  const loading = useSelector((state) => state.FEEDBACK.loading);
  const orders = useSelector((state) => state.ORDER.listOrders);

  const [category, setCategory] = useState('Quality');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  // Tạm thời ẩn filter status
  // const [filterStatus, setFilterStatus] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchGetAllFeedback());
    dispatch(fetchGetOrder());
  }, [dispatch]);

  // Lấy userId từ order được chọn
  const getSelectedUserId = () => {
    if (!orderId) return null;
    const order = orders?.find((o) => o.id === Number(orderId));
    return order?.userId || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Vui lòng nhập Subject và Description');
      return;
    }
    setSubmitting(true);
    try {
      const uid = getSelectedUserId() || 0;
      const body = {
        userId: uid,
        category,
        orderId: orderId ? Number(orderId) : null,
        subject,
        description,
      };
      console.log('POST /api/Feedback body:', body);
      await dispatch(fetchCreateFeedback(body)).unwrap();
      alert('Feedback đã được gửi thành công!');
      setCategory('Quality');
      setOrderId('');
      setSubject('');
      setDescription('');
      dispatch(fetchGetAllFeedback());
    } catch {
      alert('Gửi feedback thất bại, vui lòng thử lại.');
    }
    setSubmitting(false);
  };

  // Tạm thời ẩn filter status
  // const filteredFeedbacks = filterStatus === 'All'
  //   ? feedbacks
  //   : feedbacks?.filter((fb) => fb.status === filterStatus);
  const filteredFeedbacks = feedbacks;

  const statusColor = (status) => {
    switch (status) {
      case 'Resolved': return { text: 'text-green-600', bg: 'bg-green-600' };
      case 'UnderReview': return { text: 'text-blue-600', bg: 'bg-blue-600' };
      case 'Received': return { text: 'text-slate-500', bg: 'bg-slate-400' };
      default: return { text: 'text-amber-600', bg: 'bg-amber-500' };
    }
  };

  const categoryColor = (cat) => {
    switch (cat) {
      case 'Quality': return 'bg-amber-100 text-amber-700';
      case 'Delivery': return 'bg-orange-100 text-orange-700';
      case 'Packaging': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  return (
    <>
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900">
          Feedback &amp; Support
        </h2>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="text-xs font-medium">Downtown Branch</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="p-2 rounded-lg bg-slate-100 text-slate-600 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
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
              Order Reference ID{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              className="rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              id="order-id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">-- No order --</option>
              {orders?.filter((o) => o.status === 'Completed').map((order) => (
                <option key={order.id} value={order.id}>
                  #ORD-{order.id} — {order.status}
                </option>
              ))}
            </select>
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
              Detailed Description
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
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              type="button"
              onClick={() => { setCategory('Quality'); setOrderId(''); setSubject(''); setDescription(''); }}
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
          {/* Tạm thời ẩn filter status */}
          {/* <div className="flex items-center gap-2">
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
          </div> */}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
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
                {/* Tạm thời ẩn cột Status */}
                {/* <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : !filteredFeedbacks || filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No feedback found.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb) => {
                  // Tạm thời ẩn status
                  // const sc = statusColor(fb.status);
                  return (
                    <tr key={fb.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {fb.feedbackDate ? new Date(fb.feedbackDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
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
                      {/* Tạm thời ẩn cột Status */}
                      {/* <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 ${sc.text} text-xs font-bold uppercase`}>
                          <span className={`w-2 h-2 rounded-full ${sc.bg}`} />
                          {fb.status}
                        </span>
                      </td> */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Showing {filteredFeedbacks?.length || 0} of {feedbacks?.length || 0} reports
          </p>
        </div>
      </section>
    </div>
    </>
  )
}

export default FeedbackFranchise