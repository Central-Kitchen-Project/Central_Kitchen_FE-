import API from './api'

function extractArray(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.value)) return payload.value
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.$values)) return payload.$values
  const nested = payload.data?.value ?? payload.data?.data
  if (Array.isArray(nested)) return nested
  return []
}

function rowToUnitString(row) {
  if (row == null) return ''
  if (typeof row === 'string') return row.trim()
  const s =
    row.symbol ??
    row.code ??
    row.unitCode ??
    row.unit ??
    row.name ??
    row.unitName ??
    row.displayName ??
    row.label
  return String(s || '').trim()
}

/**
 * GET measurement units from API. Tries common backend route names.
 * @returns {Promise<string[]>}
 */
export async function fetchMeasurementUnits() {
  const paths = ['Unit', 'Units', 'MeasurementUnit', 'Item/units']
  for (const path of paths) {
    try {
      const res = await API.callWithToken().get(path)
      const payload = res?.data?.value ?? res?.data?.data ?? res?.data
      const arr = extractArray(payload)
      const units = [...new Set(arr.map(rowToUnitString).filter(Boolean))]
      if (units.length > 0) return units
    } catch {
      /* try next path */
    }
  }
  return []
}
