import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from '../../../components/common/PageHeader'
import { fetchGetAllFeedback } from '../../../store/feedbackSlice'
import { fetchAllUsers } from '../../../store/userSlice'

const STATUS_OPTIONS = ['all', 'received', 'underreview', 'resolved']

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.$values)) return data.$values
  if (data && typeof data === 'object') {
    const firstArrayValue = Object.values(data).find(Array.isArray)
    if (firstArrayValue) return firstArrayValue
  }
  return []
}

const normalizeStatus = (status) => {
  const value = String(status || '').trim().toLowerCase()
  if (value === 'underreview' || value === 'under review') return 'underreview'
  if (value === 'received') return 'received'
  if (value === 'resolved') return 'resolved'
  return 'unknown'
}

const statusLabel = (status) => {
  const normalized = normalizeStatus(status)
  if (normalized === 'underreview') return 'Under Review'
  if (normalized === 'received') return 'Received'
  if (normalized === 'resolved') return 'Resolved'
  return status || 'Unknown'
}

const statusBadgeClass = (status) => {
  switch (normalizeStatus(status)) {
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'underreview':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'received':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

function FeedbackManager() {
  const dispatch = useDispatch()
  const { listFeedbacks, loading } = useSelector((state) => state.FEEDBACK || { listFeedbacks: [], loading: false })
  const { users } = useSelector((state) => state.USER || { users: [] })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
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

  const filteredFeedbacks = useMemo(() => {
    const sorted = [...feedbackList].sort(
      (a, b) => new Date(b.feedbackDate || 0) - new Date(a.feedbackDate || 0)
    )

    return sorted.filter((fb) => {
      const normalized = normalizeStatus(fb.status)
      const username = usernameByUserId[fb.userId] || ''
      const searchable = `${fb.id || ''} ${fb.orderId || fb.refId || ''} ${fb.subject || ''} ${fb.description || ''} ${username}`.toLowerCase()
      const matchesSearch = !searchTerm || searchable.includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || normalized === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [feedbackList, searchTerm, selectedStatus, usernameByUserId])

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pagedFeedbacks = filteredFeedbacks.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, feedbackList.length])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        title="Feedback Monitoring"
        subtitle="View all feedback from franchise stores in read-only mode."
      />

      <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search by order, subject, description, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status === 'underreview' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Order</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Username</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Rating</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">Loading feedback...</td>
                  </tr>
                ) : filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">No feedback found.</td>
                  </tr>
                ) : (
                  pagedFeedbacks.map((fb) => (
                    <tr key={fb.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {fb.feedbackDate ? new Date(fb.feedbackDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800 whitespace-nowrap">
                        #{fb.orderId || fb.refId || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                        {usernameByUserId[fb.userId] || `User #${fb.userId ?? 'N/A'}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">{fb.category || 'Other'}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 min-w-44">{fb.subject || 'No subject'}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 min-w-56">{fb.description || 'No description'}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{typeof fb.rating === 'number' ? `${fb.rating}/5` : 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded-lg text-[10px] font-bold ${statusBadgeClass(fb.status)}`}>
                          <span className="size-1.5 rounded-full bg-current" />
                          {statusLabel(fb.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredFeedbacks.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
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
    </div>
  )
}

export default FeedbackManager
