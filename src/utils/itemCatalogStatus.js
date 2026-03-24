/**
 * Catalog visibility — align with DB `is_active` as exposed by API.
 * Chỉ tin các field boolean từ BE (MapToDTO / JSON). Không suy ra inactive từ
 * isAvailable hay active cũ (dễ lệch khi bạn sửa tay trong SQL mà BE chưa đồng bộ).
 */
export const isInactiveItem = (item) => {
  if (!item || typeof item !== 'object') return false

  if (typeof item.isActive === 'boolean') return !item.isActive
  if (typeof item.IsActive === 'boolean') return !item.IsActive
  if (typeof item.is_active === 'boolean') return !item.is_active

  // API không gửi cờ nào → coi là đang hiển thị/được bán (tránh ẩn nhầm)
  return false
}
