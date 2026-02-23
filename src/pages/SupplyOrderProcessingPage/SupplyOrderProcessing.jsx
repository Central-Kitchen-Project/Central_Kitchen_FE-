import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import "./SupplyOrderProcessing.css"
function SupplyOrderProcessing() {
  const navigate = useNavigate()
  const { handleLogout } = useOutletContext()
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [requestItems, setRequestItems] = useState([])

  const openAcceptModal = (orderId) => {
    setSelectedOrder(orderId)
    setAcceptModalOpen(true)
  }

  const confirmAccept = () => {
    setAcceptModalOpen(false)
    // redirect to an accept page (simple route)
    // strip leading '#' from order id so it becomes a proper path segment
    const cleanId = String(selectedOrder || '').replace(/^#/, '')
    navigate(`/SupplyOrderProcessing/accept/${encodeURIComponent(cleanId)}`)
  }

  const openRequestModal = (orderId, items = []) => {
    setSelectedOrder(orderId)
    // create a shallow copy with a qty field for inputs
    setRequestItems(items.map((i) => ({ ...i, requestQty: '' })))
    setRequestModalOpen(true)
  }

  const updateRequestQty = (index, value) => {
    setRequestItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], requestQty: value }
      return copy
    })
  }

  const submitRequest = () => {
    // In a real app you'd POST this to the server. For now just log and close.
    console.log('Request submitted for', selectedOrder, requestItems)
    setRequestModalOpen(false)
  }
  return (
    <>
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900">Order Processing</h2>
        <span className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className="material-symbols-outlined text-[18px]">
            list_alt
          </span>
          <span>32 Orders Active</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
        </div>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/50">
      <div className="flex border-b border-slate-200 gap-8">
        <button className="pb-4 text-sm font-bold tab-active">
          Incoming Orders (14)
        </button>
        <button className="pb-4 text-sm font-medium text-slate-500 hover:text-navy-charcoal transition-colors">
          Processing (12)
        </button>
        <button className="pb-4 text-sm font-medium text-slate-500 hover:text-navy-charcoal transition-colors">
          Ready for Dispatch (6)
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Search orders..."
              type="text"
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>{" "}
              Filter
            </button>
            <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>{" "}
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Source (Franchise)
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Items List
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                  Priority
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold text-navy-charcoal">
                      #ORD-9021
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Placed 10m ago
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-blue-100 flex items-center justify-center text-primary text-[10px] font-black">
                      D
                    </div>
                    <span className="text-sm font-bold text-navy-charcoal">
                      Downtown Cafe
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-slate-700">
                      500x Brioche Burger Buns
                    </span>
                    <span className="text-xs text-slate-500">
                      200x Potato Rolls, 50kg Beef
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-tight">
                    High
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openAcceptModal('#ORD-9021')} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                      Accept
                    </button>
                    <button onClick={() => openRequestModal('#ORD-9021', [
                      { name: 'Brioche Burger Buns', stock: '120 units' },
                      { name: 'Potato Rolls', stock: '15 units' },
                      { name: 'Fresh Beef', stock: '20kg' },
                    ])} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">
                      Request
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold text-navy-charcoal">
                      #ORD-9018
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Placed 25m ago
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-black">
                      A
                    </div>
                    <span className="text-sm font-bold text-navy-charcoal">
                      Airport Terminal 3
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700">
                    100L Secret Burger Sauce
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-tight">
                    Medium
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openAcceptModal('#ORD-9018')} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                      Accept
                    </button>
                    <button onClick={() => openRequestModal('#ORD-9018', [
                      { name: 'Secret Burger Sauce', stock: '100L' },
                    ])} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">
                      Request
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold text-navy-charcoal">
                      #ORD-8992
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Placed 1h ago
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-black">
                      E
                    </div>
                    <span className="text-sm font-bold text-navy-charcoal">
                      Eastside Mall
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700">
                    50kg Vintage Cheddar Slices
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-tight">
                    Low
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openAcceptModal('#ORD-8992')} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                      Accept
                    </button>
                    <button onClick={() => openRequestModal('#ORD-8992', [
                      { name: 'Vintage Cheddar Slices', stock: '50kg' },
                    ])} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">
                      Request
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold text-navy-charcoal">
                      #ORD-8988
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Placed 2h ago
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-purple-100 flex items-center justify-center text-purple-700 text-[10px] font-black">
                      W
                    </div>
                    <span className="text-sm font-bold text-navy-charcoal">
                      West End Hub
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700">
                    400x Truffle Mayo Sachet
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-tight">
                    Medium
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openAcceptModal('#ORD-8988')} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                      Accept
                    </button>
                    <button onClick={() => openRequestModal('#ORD-8988', [
                      { name: 'Truffle Mayo Sachet', stock: '400x' },
                    ])} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">
                      Request
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Showing 4 of 14 Incoming Orders
          </span>
          <div className="flex gap-2">
            <button
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 disabled:opacity-50"
              disabled=""
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">
              pending_actions
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Wait Time Avg.
            </p>
            <p className="text-xl font-bold text-navy-charcoal">18 mins</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="size-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[28px]">
              priority_high
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              High Priority
            </p>
            <p className="text-xl font-bold text-navy-charcoal">03 Orders</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="size-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[28px]">
              check_circle
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Capacity Status
            </p>
            <p className="text-xl font-bold text-navy-charcoal">
              Optimal (72%)
            </p>
          </div>
        </div>
      </div>
    </div>

  {/* Accept confirmation modal */}
  {acceptModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setAcceptModalOpen(false)} />
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-96 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Accept Order</h3>
            <p className="text-sm text-slate-500 mt-1">Are you sure you want to accept <span className="font-mono">{String(selectedOrder || '').replace(/^#/, '')}</span>? This will move the order to the Processing queue.</p>
          </div>
          <button onClick={() => setAcceptModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setAcceptModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm">Cancel</button>
          <button onClick={confirmAccept} className="px-4 py-2 rounded-lg bg-primary text-white text-sm shadow">Confirm Accept</button>
        </div>
      </div>
    </div>
  )}

  {/* Request items modal */}
  {requestModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setRequestModalOpen(false)} />
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-[680px] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined">add_shopping_cart</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Request Additional Materials</h3>
              <p className="text-sm text-slate-500 mt-1">Please specify quantities needed for order <span className="font-mono">{String(selectedOrder || '').replace(/^#/, '')}</span>.</p>
            </div>
          </div>
          <button onClick={() => setRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="mt-4 overflow-y-auto max-h-64 border rounded-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500">
                <th className="px-4 py-3">Material Name</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Request Qty</th>
              </tr>
            </thead>
            <tbody>
              {requestItems.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-3 text-sm">{it.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{it.stock}</td>
                  <td className="px-4 py-3">
                    <input value={it.requestQty} onChange={(e) => updateRequestQty(idx, e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 focus:ring-primary focus:border-primary" placeholder="Qty" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-amber-700 bg-amber-50 p-3 rounded mb-4">Requesting these materials will alert the inventory manager. Lead time for these items is approximately 45 minutes.</div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setRequestModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm">Cancel</button>
          <button onClick={submitRequest} className="px-4 py-2 rounded-lg bg-primary text-white text-sm">Submit Request</button>
        </div>
      </div>
    </div>
  )}

    </>
  )
}

export default SupplyOrderProcessing