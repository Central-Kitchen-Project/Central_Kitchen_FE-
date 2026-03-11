import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

function ReportAnalyticsManager() {
  const { userInfo } = useOutletContext()
  const [activeReport, setActiveReport] = useState('cost')

  // Sample data — replace with real API later
  const costData = {
    totalInventoryValue: 1250000,
    avgCostPerUnit: 45000,
    highValueItems: 8,
    totalSKUs: 20,
    topItems: [
      { name: 'Bo Anchor', value: 320000, unit: 'kg' },
      { name: 'Socola den', value: 180000, unit: 'kg' },
      { name: 'Kem tuoi', value: 95000, unit: 'l' },
      { name: 'Vanilla', value: 80000, unit: 'ml' },
      { name: 'Banh ngot kem bo', value: 50000, unit: 'unit' },
    ],
  }

  const wasteData = {
    outOfStock: 2,
    lowStock: 5,
    estimatedLoss: 185000,
    riskLevel: 'Medium',
    criticalItems: [
      { name: 'Bot mi da dung', status: 'Low Stock', badge: 'warning' },
      { name: 'Duong trang', status: 'Low Stock', badge: 'warning' },
      { name: 'Trung ga tuoi', status: 'Out of Stock', badge: 'danger' },
      { name: 'Dau thuc vat', status: 'Low Stock', badge: 'warning' },
      { name: 'Muoi tinh', status: 'Out of Stock', badge: 'danger' },
    ],
  }

  const badgeClass = (type) => {
    switch (type) {
      case 'danger': return 'bg-red-100 text-red-700'
      case 'warning': return 'bg-amber-100 text-amber-700'
      case 'success': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">View cost analysis and waste reports</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Report Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveReport('cost')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeReport === 'cost'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base align-middle mr-1.5">analytics</span>
            Cost Analysis
          </button>
          <button
            onClick={() => setActiveReport('waste')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeReport === 'waste'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base align-middle mr-1.5">delete_sweep</span>
            Waste & Loss Report
          </button>
        </div>

        {/* Cost Analysis Report */}
        {activeReport === 'cost' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Material Cost Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Material Cost Breakdown</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5 space-y-0">
                {[
                  { label: 'Total Inventory Value', value: `${costData.totalInventoryValue.toLocaleString('vi-VN')}đ` },
                  { label: 'Average Cost per Unit', value: `${costData.avgCostPerUnit.toLocaleString('vi-VN')}đ` },
                  { label: 'High-Value Items (>100k)', value: costData.highValueItems },
                  { label: 'Total SKUs', value: costData.totalSKUs },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-lg font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Most Valuable Items */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Top 5 Most Valuable Items</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Item</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costData.topItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                            {item.name}
                          </div>
                        </td>
                        <td className="py-3 text-sm font-semibold text-slate-900 text-right">
                          {item.value.toLocaleString('vi-VN')}đ/{item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Waste & Loss Report */}
        {activeReport === 'waste' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Loss Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Loss Analysis</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5 space-y-0">
                {[
                  { label: 'Out of Stock Items', value: wasteData.outOfStock, color: 'text-red-600' },
                  { label: 'Low Stock Items', value: wasteData.lowStock, color: 'text-amber-600' },
                  { label: 'Estimated Loss Value', value: `${wasteData.estimatedLoss.toLocaleString('vi-VN')}đ`, color: 'text-slate-900' },
                  { label: 'Risk Level', value: wasteData.riskLevel, color: 'text-red-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Items Report */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Critical Items Report</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Item</th>
                      <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteData.criticalItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-sm text-slate-700">{item.name}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeClass(item.badge)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportAnalyticsManager