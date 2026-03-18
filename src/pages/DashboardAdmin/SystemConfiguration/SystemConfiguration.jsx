import React, { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";

const DEFAULT_CONFIG = {
  weightUnit: "kg",
  volumeUnit: "L",
  orderLeadTime: 3,
  minStockAlert: 20,
  maxRetentionDays: 30,
  currency: "VND",
};

function SystemConfiguration() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setSaved(false);
  };

  return (
    <>
      {/* Header */}
      <PageHeader
        as="h2"
        title="System Configuration"
        subtitle="Configure operational defaults, measurement units, and platform rules."
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
        {/* Success */}
        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Configuration saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Two-column grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Units of Measure */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">straighten</span>
                  <span className="text-sm font-semibold text-slate-900">Units of Measure</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Configure measurement units used across the system</p>
              </div>
              <div className="p-4 flex flex-col gap-5">
                {/* Weight Units */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Weight Units</label>
                  <div className="flex gap-3">
                    {[
                      { value: "kg", label: "Kilograms (kg)" },
                      { value: "lbs", label: "Pounds (lbs)" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors flex-1 ${
                          config.weightUnit === opt.value
                            ? "border-primary bg-blue-50 text-primary"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="weightUnit"
                          value={opt.value}
                          checked={config.weightUnit === opt.value}
                          onChange={(e) => handleChange("weightUnit", e.target.value)}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-[18px]">
                          {config.weightUnit === opt.value ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Volume Units */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Volume Units</label>
                  <div className="flex gap-3">
                    {[
                      { value: "L", label: "Liters (L)" },
                      { value: "gal", label: "Gallons (gal)" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors flex-1 ${
                          config.volumeUnit === opt.value
                            ? "border-primary bg-blue-50 text-primary"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="volumeUnit"
                          value={opt.value}
                          checked={config.volumeUnit === opt.value}
                          onChange={(e) => handleChange("volumeUnit", e.target.value)}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-[18px]">
                          {config.volumeUnit === opt.value ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Parameters */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                  <span className="text-sm font-semibold text-slate-900">Operational Parameters</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Set key operational thresholds and defaults</p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Default Order Lead Time (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={config.orderLeadTime}
                    onChange={(e) => handleChange("orderLeadTime", Number(e.target.value))}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Minimum Stock Alert Level (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={config.minStockAlert}
                    onChange={(e) => handleChange("minStockAlert", Number(e.target.value))}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Max Inventory Retention Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={config.maxRetentionDays}
                    onChange={(e) => handleChange("maxRetentionDays", Number(e.target.value))}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Currency</label>
                  <select
                    value={config.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full"
                  >
                    <option value="VND">VND - Vietnamese Dong</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">redo</span>
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SystemConfiguration;
