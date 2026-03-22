import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from '../../../components/common/PageHeader'
import { fetchAllUsers } from '../../../store/userSlice'
import {
  fetchGetAllFeedback,
  fetchUpdateFeedbackStatus,
} from '../../../store/feedbackSlice'

const STATUS_OPTIONS = ['All', 'Received', 'UnderReview', 'Resolved']

const normalizeStatus = (status) => {
  const value = String(status || '').trim().toLowerCase()
  if (value === 'underreview' || value === 'under review') return 'UnderReview'
  if (value === 'received') return 'Received'
  if (value === 'resolved') return 'Resolved'
  return status || 'Unknown'
}

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.$values)) return data.$values
  if (data && typeof data === 'object') {
    const firstArrayValue = Object.values(data).find(Array.isArray)
    if (firstArrayValue) return firstArrayValue
  }
  return []
}

const statusBadgeClass = (status) => {
  switch (normalizeStatus(status)) {
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-700'
    case 'UnderReview':
      return 'bg-blue-50 text-blue-700'
    case 'Received':
      return 'bg-amber-50 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function FeedbackManagement() {
  const dispatch = useDispatch()
  const { listFeedbacks, loading } = useSelector((state) => state.FEEDBACK)
  const { users } = useSelector((state) => state.USER || { users: [] })
  const [statusFilter, setStatusFilter] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    dispatch(fetchGetAllFeedback())
    dispatch(fetchAllUsers())
  }, [dispatch])

  const feedbackList = useMemo(() => normalizeArray(listFeedbacks), [listFeedbacks])
  const userList = useMemo(() => normalizeArray(users), [users])
  const usernameByUserId = useMemo(() => {
    return userList.reduce((acc, user) => {
      if (user?.id != null) {
        acc[user.id] = user.username || user.email || `User #${user.id}`
      }
      return acc
    }, {})
  }, [userList])

  const stats = useMemo(() => {
    const total = feedbackList.length
    const received = feedbackList.filter((f) => normalizeStatus(f.status) === 'Received').length
    const underReview = feedbackList.filter((f) => normalizeStatus(f.status) === 'UnderReview').length
    const resolved = feedbackList.filter((f) => normalizeStatus(f.status) === 'Resolved').length

    return { total, received, underReview, resolved }
  }, [feedbackList])

  const filteredFeedbacks = useMemo(() => {
    const sorted = [...feedbackList].sort(
      (a, b) => new Date(b.feedbackDate || 0) - new Date(a.feedbackDate || 0)
    )

    if (statusFilter === 'All') return sorted
    return sorted.filter((item) => normalizeStatus(item.status) === statusFilter)
  }, [feedbackList, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pagedFeedbacks = filteredFeedbacks.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, feedbackList.length])

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      setUpdatingId(id)
      await dispatch(fetchUpdateFeedbackStatus({ id, status: nextStatus })).unwrap()
      dispatch(fetchGetAllFeedback())
    } catch (error) {
      alert(error || 'Cannot update feedback status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <PageHeader
        as="h2"
        title="Feedback Management"
        subtitle="Track, review, and resolve franchise feedback across the system."
      />

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Feedback</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Received</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{stats.received}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Under Review</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats.underReview}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.resolved}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 min-h-[420px]">
          <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Feedback List</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs rounded-md border-slate-200"
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item === 'All' ? 'All Statuses' : item === 'UnderReview' ? 'Under Review' : item}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-slate-400">
                Showing {filteredFeedbacks.length} of {feedbackList.length} feedbacks
              </span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-200">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Order</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Username</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Category</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Subject</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Description</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Rating</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Status</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center text-sm text-slate-400 py-10">
                      Loading feedback...
                    </td>
                  </tr>
                ) : filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-sm text-slate-400 py-10">
                      No feedback found.
                    </td>
                  </tr>
                ) : (
                  pagedFeedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="p-3 text-xs text-slate-600 whitespace-nowrap">
                        {fb.feedbackDate ? new Date(fb.feedbackDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 text-xs text-slate-700 font-semibold whitespace-nowrap">
                        {fb.orderId || fb.refId ? `#${fb.orderId || fb.refId}` : 'N/A'}
                      </td>
                      <td className="p-3 text-xs text-slate-700 whitespace-nowrap">
                        {usernameByUserId[fb.userId] || `User #${fb.userId ?? 'N/A'}`}
                      </td>
                      <td className="p-3 text-xs text-slate-700">{fb.category || 'Other'}</td>
                      <td className="p-3 text-xs text-slate-700 min-w-56">{fb.subject || 'No subject'}</td>
                      <td className="p-3 text-xs text-slate-700 min-w-72">{fb.description || 'No description'}</td>
                      <td className="p-3 text-xs text-slate-700">{typeof fb.rating === 'number' ? `${fb.rating}/5` : 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadgeClass(
                            fb.status
                          )}`}
                        >
                          {normalizeStatus(fb.status) === 'UnderReview' ? 'Under Review' : normalizeStatus(fb.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={normalizeStatus(fb.status) === 'Unknown' ? 'Received' : normalizeStatus(fb.status)}
                            onChange={(e) => handleStatusUpdate(fb.id, e.target.value)}
                            disabled={updatingId === fb.id}
                            className="text-xs rounded-md border-slate-200 disabled:bg-slate-100"
                          >
                            <option value="Received">Received</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredFeedbacks.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Showing {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, filteredFeedbacks.length)} of {filteredFeedbacks.length} feedbacks
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">first_page</span>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="px-1 text-xs text-slate-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[28px] px-2 py-1 rounded text-xs font-bold transition-colors ${
                          p === safeCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">last_page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default FeedbackManagement
