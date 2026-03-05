import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './SupplyOrderProcessing.css'

function AcceptOrder() {
  const { orderId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // fallback: if orderId param is empty (because a '#' was used), read fragment
  const displayId = orderId || (location.hash ? location.hash.replace(/^#/, '') : '')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-2">Order Accepted</h2>
        <p className="text-slate-600 mb-4">Order <span className="font-mono">{displayId}</span> has been accepted and moved to Processing.</p>
        <div className="flex justify-center gap-2">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Back</button>
          <button onClick={() => navigate('/SupplyOrderProcessing')} className="px-4 py-2 rounded bg-primary text-white">Go to Orders</button>
        </div>
      </div>
    </div>
  )
}

export default AcceptOrder
