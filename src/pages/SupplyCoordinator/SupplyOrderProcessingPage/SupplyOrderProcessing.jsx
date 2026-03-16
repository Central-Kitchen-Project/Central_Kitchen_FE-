import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SupplyOrderProcessing.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchGetOrder, updateOrderStatus, deleteOrder } from "../../../store/orderSlice";
import orderService from "../../../services/orderService";
import API, { extractApiErrorMessage, extractApiMessage } from "../../../services/api";
import inventoryService from "../../../services/inventoryService";

const BASE_URL = "http://meinamfpt-001-site1.ltempurl.com/api";

function getTimeDiff(dateStr) {
  if (!dateStr) return "";
  // Ensure UTC parsing: if no timezone info, treat as UTC
  let str = dateStr;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(str)) str += "Z";
  const diff = Math.floor((Date.now() - new Date(str).getTime()) / 60000);
  if (diff < 0) return "just now";
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function parseUTC(dateStr) {
  if (!dateStr) return null;
  let s = dateStr;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(s)) s += "Z";
  return new Date(s);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return parseUTC(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function normalizeCollection(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (data && typeof data === "object") {
    const arrayValue = Object.values(data).find(Array.isArray);
    if (arrayValue) return arrayValue;

    const wrappedArrayValue = Object.values(data).find((value) => Array.isArray(value?.$values));
    if (wrappedArrayValue?.$values) return wrappedArrayValue.$values;
  }
  return [];
}

function getLineIngredients(line) {
  return normalizeCollection(
    line?.ingredients ||
      line?.ingredient ||
      line?.recipeIngredients ||
      line?.itemIngredients ||
      line?.materials ||
      line?.materialsUsed ||
      line?.item?.ingredients
  );
}

function getIngredientName(ingredient, index) {
  return (
    ingredient?.name ||
    ingredient?.materialName ||
    ingredient?.ingredientName ||
    ingredient?.itemName ||
    `Ingredient ${index + 1}`
  );
}

function formatIngredientQuantity(ingredient) {
  const rawQuantity =
    ingredient?.qty ??
    ingredient?.quantity ??
    ingredient?.requiredQuantity ??
    ingredient?.amount ??
    ingredient?.requestedQuantity;

  if (rawQuantity === undefined || rawQuantity === null || rawQuantity === "") {
    return "";
  }

  const numericQuantity = Number(rawQuantity);
  const quantity = Number.isFinite(numericQuantity)
    ? (Number.isInteger(numericQuantity) ? numericQuantity : parseFloat(numericQuantity.toFixed(3)))
    : rawQuantity;
  const unit = ingredient?.unit || ingredient?.materialUnit || ingredient?.measurementUnit || "";

  return [quantity, unit].filter(Boolean).join(" ");
}

function getStatusBadge(status) {
  const normalizedStatus = normalizeOrderStatus(status);

  if (normalizedStatus === "Pending")
    return { label: "Pending", cls: "bg-red-50 text-red-600 border-red-100" };
  if (normalizedStatus === "Processing")
    return { label: "Processing", cls: "bg-blue-50 text-blue-600 border-blue-100" };
  if (status === "Filled")
    return { label: "Filled", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" };
  if (status === "Completed")
    return { label: "Completed", cls: "bg-green-50 text-green-600 border-green-100" };
  if (status === "Rejected")
    return { label: "Rejected", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return { label: status || "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-100" };
}

function getInitial(name) {
  return (name || "?")[0].toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-slate-100 text-slate-600",
];

function normalizeDisplayText(value) {
  if (!value) return "";

  return String(value)
    .replace(/\?\?/g, "u")
    .replace(/\?ê\?/g, "để")
    .replace(/duyê\?t/g, "duyệt")
    .replace(/l\?\?ng/g, "lượng")
    .replace(/s\?/g, "số")
    .replace(/Thi\?u/g, "Thiếu")
    .replace(/c\?n/g, "cần")
    .replace(/l\?i/g, "lại")
    .replace(/B\?t/g, "Bột")
    .replace(/\bmi\b/g, "mì")
    .replace(/Duong/g, "Đường")
    .replace(/Trung/g, "Trứng")
    .replace(/\bga\b/g, "gà")
    .replace(/Kem tuoi/g, "Kem tươi");
}

function normalizeMaterialKey(value) {
  return normalizeDisplayText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseMissingItem(detail) {
  const normalized = normalizeDisplayText(detail);
  const match = normalized.match(/Thiếu\s+(.+?):\s*cần\s*([\d.]+),\s*còn lại\s*([\d.]+)/i);

  if (!match) return null;

  const [, materialName, needed, remaining] = match;
  const quantityNeeded = Number(needed);
  const currentStock = Number(remaining);

  return {
    materialName: materialName.trim(),
    quantityNeeded: Number.isFinite(quantityNeeded) ? quantityNeeded : 0,
    currentStock: Number.isFinite(currentStock) ? currentStock : 0,
  };
}

function buildShortageLookup(missingItems) {
  return (missingItems || []).reduce((lookup, item) => {
    const parsed = parseMissingItem(item);

    if (parsed) {
      lookup[normalizeMaterialKey(parsed.materialName)] = parsed;
    }

    return lookup;
  }, {});
}

function buildShortageLookupFromMaterials(materials) {
  return normalizeCollection(materials).reduce((lookup, material) => {
    const quantityNeeded = getNeededQuantity(material);
    const currentStock = getCurrentStock(material);

    if (currentStock < quantityNeeded) {
      const materialName = normalizeDisplayText(material?.materialName || material?.name || "Unknown material");
      lookup[normalizeMaterialKey(materialName)] = {
        materialName,
        quantityNeeded,
        currentStock,
      };
    }

    return lookup;
  }, {});
}

function buildInventoryStatus(materials) {
  const shortageLookup = buildShortageLookupFromMaterials(materials);

  return {
    shortageLookup,
    shortageCount: Object.keys(shortageLookup).length,
    hasShortage: Object.keys(shortageLookup).length > 0,
  };
}

function buildOrderApprovalError(error) {
  const payload = error?.response?.data || error?.data || error;
  const missingItems = Array.isArray(payload?.missingItems) ? payload.missingItems : [];

  if (payload?.error === "OR40005") {
    return {
      message: "Không đủ số lượng trong kho để duyệt đơn.",
      details: missingItems.map((item) =>
        normalizeDisplayText(item).replace(/([\d]+)\.(\d+)/g, (_, int) => int)
      ),
    };
  }

  return {
    message: normalizeDisplayText(extractApiErrorMessage(error, "Lỗi không xác định")),
    details: [],
  };
}

function getNeededQuantity(material) {
  const rawQuantity =
    material?.quantityNeeded ??
    material?.quatityNeeded ??
    material?.quanityNeeded ??
    material?.requiredQuantity ??
    material?.quantity ??
    0;

  const parsed = Number(rawQuantity);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCurrentStock(material) {
  const parsed = Number(material?.currentStock ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMeasure(value) {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(3)));
}

function buildInventoryLookup(inventoryItems) {
  return normalizeCollection(inventoryItems).reduce(
    (lookup, item) => {
      const itemId = item?.item?.id ?? item?.itemId ?? item?.id;
      const itemName = item?.item?.itemName || item?.itemName || item?.name || "";
      const quantity = Number(item?.quantity ?? 0);

      if (itemId !== undefined && itemId !== null) {
        lookup.byId[String(itemId)] = Number.isFinite(quantity) ? quantity : 0;
      }

      if (itemName) {
        lookup.byName[normalizeMaterialKey(itemName)] = Number.isFinite(quantity) ? quantity : 0;
      }

      return lookup;
    },
    { byId: {}, byName: {} }
  );
}

function resolveInventoryStock(material, inventoryLookup) {
  const itemId = material?.itemId;
  const materialName = material?.materialName || material?.name || "";

  if (itemId !== undefined && itemId !== null && inventoryLookup.byId[String(itemId)] !== undefined) {
    return inventoryLookup.byId[String(itemId)];
  }

  const normalizedName = normalizeMaterialKey(materialName);
  if (normalizedName && inventoryLookup.byName[normalizedName] !== undefined) {
    return inventoryLookup.byName[normalizedName];
  }

  return getCurrentStock(material);
}

function buildRequestItem(material, shortageLookup = {}, inventoryLookup = { byId: {}, byName: {} }) {
  const quantityNeeded = getNeededQuantity(material);
  const currentStock = resolveInventoryStock(material, inventoryLookup);
  const backendCurrentStock = getCurrentStock(material);
  const shortageOverride = shortageLookup[normalizeMaterialKey(material?.materialName || material?.name || "")];
  const shortage = shortageOverride
    ? Math.max(shortageOverride.quantityNeeded - shortageOverride.currentStock, 0)
    : Math.max(quantityNeeded - backendCurrentStock, 0);

  return {
    itemId: material?.itemId,
    name: normalizeDisplayText(material?.materialName || material?.name || "Unknown material"),
    unit: material?.unit || "",
    quantityNeeded,
    currentStock,
    requestedQuantity: shortage,
  };
}

function SupplyOrderProcessing() {
  const data = useSelector((state) => state.ORDER.listOrders);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGetOrder());
  }, [dispatch]);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [orderShortages, setOrderShortages] = useState({});
  const [orderInventoryStatus, setOrderInventoryStatus] = useState({});
  const [userInventory, setUserInventory] = useState([]);

  const [requestItems, setRequestItems] = useState([]);
  const [requestNote, setRequestNote] = useState("");
  const [toast, setToast] = useState(null);
  const [loadingRequestItems, setLoadingRequestItems] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [loadingDeliveryId, setLoadingDeliveryId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [readyOrders, setReadyOrders] = useState({});
  const seenFulfilledRef = useRef(new Set());
  const fulfilledSyncInitializedRef = useRef(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const STATUS_TABS = ["All", "Pending", "Approved", "Processing", "Completed"];
  const inventoryLookup = useMemo(() => buildInventoryLookup(userInventory), [userInventory]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("USER_INFO") || "null");
    if (!userInfo?.id) return;

    let isCancelled = false;

    inventoryService
      .GetAll(userInfo.id)
      .then((response) => {
        if (isCancelled) return;
        const inventory = normalizeCollection(response.data?.value ?? response.data?.data ?? response.data);
        setUserInventory(inventory);
      })
      .catch(() => {
        if (isCancelled) return;
        setUserInventory([]);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const actionableOrders = (data || []).filter((order) => !["Completed", "Processing"].includes(order.status));
    const missingOrders = actionableOrders.filter((order) => !orderInventoryStatus[order.id]);

    if (missingOrders.length === 0) return;

    let isCancelled = false;

    setOrderInventoryStatus((prev) => {
      const next = { ...prev };
      missingOrders.forEach((order) => {
        next[order.id] = { isLoading: true, hasShortage: false, shortageLookup: {}, shortageCount: 0 };
      });
      return next;
    });

    Promise.all(
      missingOrders.map(async (order) => {
        try {
          const res = await API.callWithToken().get(`MaterialRequest/order/${order.id}/materials`);
          const materials = normalizeCollection(res.data?.data ?? res.data);
          return { orderId: order.id, isLoading: false, ...buildInventoryStatus(materials) };
        } catch {
          return { orderId: order.id, isLoading: false, hasShortage: false, shortageLookup: {}, shortageCount: 0 };
        }
      })
    ).then((results) => {
      if (isCancelled) return;

      setOrderInventoryStatus((prev) => {
        const next = { ...prev };
        results.forEach(({ orderId, ...status }) => {
          next[orderId] = status;
        });
        return next;
      });

      setOrderShortages((prev) => {
        const next = { ...prev };
        results.forEach(({ orderId, shortageLookup }) => {
          if (!next[orderId]) {
            next[orderId] = shortageLookup;
          }
        });
        return next;
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [data, orderInventoryStatus]);

  // Poll for fulfilled material requests on Processing orders
  useEffect(() => {
    const checkFulfillments = async () => {
      const processingOrderIds = new Set(
        (data || []).filter((o) => o.status === "Processing").map((o) => o.id)
      );
      if (processingOrderIds.size === 0) return;
      try {
        const res = await API.callWithToken().get("MaterialRequest");
        const requests = normalizeCollection(res.data?.data ?? res.data);
        const fulfilledForProcessing = requests.filter(
          (req) => processingOrderIds.has(req.orderId) && req.status === "Fulfilled"
        );

        // Keep the row badge state in sync with current fulfilled requests.
        if (fulfilledForProcessing.length > 0) {
          setReadyOrders((prev) => {
            const next = { ...prev };
            fulfilledForProcessing.forEach((req) => {
              next[req.orderId] = true;
            });
            return next;
          });
        }

        // First run only seeds known fulfilled requests, no toast.
        if (!fulfilledSyncInitializedRef.current) {
          fulfilledForProcessing.forEach((req) => seenFulfilledRef.current.add(req.id));
          fulfilledSyncInitializedRef.current = true;
          return;
        }

        const newlyFulfilled = [];
        requests.forEach((req) => {
          if (
            processingOrderIds.has(req.orderId) &&
            req.status === "Fulfilled" &&
            !seenFulfilledRef.current.has(req.id)
          ) {
            seenFulfilledRef.current.add(req.id);
            newlyFulfilled.push(req);
          }
        });
        if (newlyFulfilled.length > 0) {
          const orderIds = [...new Set(newlyFulfilled.map((r) => r.orderId))];
          setReadyOrders((prev) => {
            const next = { ...prev };
            orderIds.forEach((id) => { next[id] = true; });
            return next;
          });
          const label =
            orderIds.length === 1
              ? `đơn #${orderIds[0]}`
              : `${orderIds.length} đơn hàng`;
          setToast({
            type: "success",
            message: `✓ Nguyên liệu đã được thêm vào kho cho ${label}!`,
            details: [],
          });
          setTimeout(() => setToast(null), 5000);
        }
      } catch {
        // silent
      }
    };

    checkFulfillments();
    const interval = setInterval(checkFulfillments, 15000);
    return () => clearInterval(interval);
  }, [data]);

  const showToast = (type, message, details = []) => {
    setToast({ type, message, details });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Detail Modal ---
  const openDetailModal = async (order) => {
    setDetailModalOpen(true);
    setDetailOrder(null);
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${BASE_URL}/Order/${order.id}`);
      setDetailOrder(res.data?.data || order);
    } catch {
      setDetailOrder(order);
    } finally {
      setLoadingDetail(false);
    }
  };

  // --- Accept Modal ---
  const openAcceptModal = (e, order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setAcceptModalOpen(true);
  };

  const confirmAccept = async () => {
    if (!selectedOrder) {
      showToast("error", "Không tìm thấy đơn hàng được chọn");
      return;
    }
    
    if (!selectedOrder.id) {
      showToast("error", "ID đơn hàng không hợp lệ");
      return;
    }
    
    // Get current user info for approvedBy field  
    const userInfo = JSON.parse(localStorage.getItem("USER_INFO"));
    const approvedBy = userInfo?.id || 1;
    
    setLoadingAccept(true);
    try {
      // Determine next valid status based on current status
      let nextStatus;
      
      switch (selectedOrder.status) {
        case "Pending":    nextStatus = "Approved"; break;
        case "Approved":   nextStatus = "Processing"; break;
        case "Processing": nextStatus = "Approved"; break;
        default:           nextStatus = "Approved"; break;
      }
      
      console.log(`Attempting to update Order #${selectedOrder.id}: ${selectedOrder.status} → ${nextStatus}`);
      console.log('Selected Order Details:', { id: selectedOrder.id, status: selectedOrder.status, nextStatus, approvedBy });
      
      // Debug: Check if we have authentication token
      const token = JSON.parse(localStorage.getItem('ACCESS_TOKEN'))?.token || localStorage.getItem('ACCESS_TOKEN');
      console.log('Auth token available:', !!token);
      console.log('API URL will be:', `http://meinamfpt-001-site1.ltempurl.com/api/Order/${selectedOrder.id}/status`);
      console.log('Request payload:', { status: nextStatus, approvedBy });
      
      // Use direct API call for better debugging first
      try {
        const directResult = await orderService.UpdateStatus(selectedOrder.id, nextStatus, approvedBy);
        console.log('Direct API call succeeded:', directResult);

        showToast(
          "success",
          extractApiMessage(directResult?.data, `Đơn hàng #${selectedOrder.id} đã được chuyển sang ${nextStatus}!`)
        );
        
        setAcceptModalOpen(false);
        dispatch(fetchGetOrder());
        return;
      } catch (directError) {
        console.log('Direct API call failed, error details:', directError);
        console.log('Error response:', directError?.response);
        console.log('Error data:', directError?.response?.data);
        console.log('Error status:', directError?.response?.status);
        
        // If it's a case sensitivity issue, try lowercase
        if (directError?.response?.data?.error === 'OR40003') {
          console.log('Trying with lowercase status...');
          const lowerNextStatus = nextStatus.toLowerCase();
          
          try {
            const lowerResult = await orderService.UpdateStatus(selectedOrder.id, lowerNextStatus, approvedBy);
            console.log('Lowercase API call succeeded:', lowerResult);

            showToast(
              "success",
              extractApiMessage(lowerResult?.data, `Đơn hàng #${selectedOrder.id} đã được chuyển sang ${nextStatus}!`)
            );
            setAcceptModalOpen(false);
            dispatch(fetchGetOrder());
            return;
          } catch (lowerError) {
            console.log('Lowercase API call also failed:', lowerError);
          }
        }
        
        // If direct calls failed, throw to outer catch
        throw directError;
      }
    } catch (err) {
      console.error("Accept error:", err?.response?.data || err);
      if (err?.response?.data?.error === "OR40005" && selectedOrder?.id) {
        const shortageLookup = buildShortageLookup(err?.response?.data?.missingItems);
        setOrderShortages((prev) => ({
          ...prev,
          [selectedOrder.id]: shortageLookup,
        }));
        setOrderInventoryStatus((prev) => ({
          ...prev,
          [selectedOrder.id]: {
            isLoading: false,
            hasShortage: true,
            shortageLookup,
            shortageCount: Object.keys(shortageLookup).length,
          },
        }));
      }
      const approvalError = buildOrderApprovalError(err);
      showToast("error", `Lỗi khi chấp nhận đơn: ${approvalError.message}`, approvalError.details);
    } finally {
      setLoadingAccept(false);
    }
  };

  // --- Reject Modal ---
  const openRejectModal = (order) => {
    setSelectedOrder(order);
    setOpenDropdown(null);
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedOrder) {
      showToast("error", "Không tìm thấy đơn hàng được chọn");
      return;
    }
    
    if (!selectedOrder.id) {
      showToast("error", "ID đơn hàng không hợp lệ");
      return;
    }
    
    setLoadingReject(true);
    try {
      console.log(`Attempting to reject Order #${selectedOrder.id}`);

      const userInfo = JSON.parse(localStorage.getItem("USER_INFO") || "null");
      const approvedBy = userInfo?.id || 1;

      try {
        const result = await orderService.UpdateStatus(selectedOrder.id, "Rejected", approvedBy);
        showToast(
          "success",
          extractApiMessage(result?.data, `Đơn hàng #${selectedOrder.id} đã được chuyển sang Rejected.`)
        );
        setRejectModalOpen(false);
        dispatch(fetchGetOrder());
        return;
      } catch (primaryError) {
        if (primaryError?.response?.data?.error === "OR40003") {
          const fallback = await orderService.UpdateStatus(selectedOrder.id, "Cancelled", approvedBy);
          showToast(
            "success",
            extractApiMessage(fallback?.data, `Đơn hàng #${selectedOrder.id} đã được từ chối.`)
          );
          setRejectModalOpen(false);
          dispatch(fetchGetOrder());
          return;
        }
        throw primaryError;
      }
    } catch (err) {
      console.error("Reject error:", err?.response?.data || err);
      const errorMessage = extractApiErrorMessage(err, 'Lỗi không xác định');
      showToast("error", `Lỗi khi từ chối đơn: ${errorMessage}`);
    } finally {
      setLoadingReject(false);
    }
  };

  // --- Request Modal ---
  const openRequestModal = async (e, order) => {
    e.stopPropagation();
    setOpenDropdown(null);
    setSelectedOrder(order);
    setRequestNote("");
    setRequestModalOpen(true);
    setLoadingRequestItems(true);

    try {
      const res = await API.callWithToken().get(`MaterialRequest/order/${order.id}/materials`);
      const materials = normalizeCollection(res.data?.data ?? res.data);
      const shortageLookup = orderInventoryStatus[order.id]?.shortageLookup || orderShortages[order.id] || {};
      setRequestItems(materials.map((material) => buildRequestItem(material, shortageLookup, inventoryLookup)));
    } catch (err) {
      setRequestItems([]);
      showToast("error", `Lỗi khi tải danh sách nguyên liệu: ${extractApiErrorMessage(err)}`);
    } finally {
      setLoadingRequestItems(false);
    }
  };

  const updateRequestQty = (index, value) => {
    setRequestItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], requestedQuantity: value };
      return copy;
    });
  };

  const submitRequest = async () => {
    if (!selectedOrder) return;
    const itemsToRequest = requestItems
      .map((item) => ({
        itemId: item.itemId,
        requestedQuantity: Number(item.requestedQuantity) || 0,
      }))
      .filter((item) => item.requestedQuantity > 0);

    if (itemsToRequest.length === 0) {
      showToast("error", "Không có nguyên liệu nào cần yêu cầu. Tăng Request Qty nếu muốn gửi thêm.");
      return;
    }

    setLoadingRequest(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("USER_INFO"));
      const payload = {
        orderId: selectedOrder.id,
        requestedByUserId: userInfo?.id || 1,
        note: requestNote || "string",
        items: itemsToRequest,
      };
      
      // First create the material request
      const materialRequestResponse = await API.callWithToken().post(`MaterialRequest`, payload);
      
      // Then update order status to "Processing" with approvedBy field
      const approvedBy = userInfo?.id || 1;
      const statusResponse = await orderService.UpdateStatus(selectedOrder.id, "Processing", approvedBy);
      
      showToast(
        "success",
        extractApiMessage(
          materialRequestResponse?.data,
          extractApiMessage(statusResponse?.data, `Yêu cầu vật liệu cho đơn #${selectedOrder.id} đã được gửi!`)
        )
      );
      setRequestModalOpen(false);
      dispatch(fetchGetOrder());
    } catch (err) {
      showToast("error", `Lỗi khi gửi yêu cầu: ${extractApiErrorMessage(err)}`);
    } finally {
      setLoadingRequest(false);
    }
  };

  const orders = data || [];
  const incomingOrders = orders;

  const handleDeliver = async (e, order) => {
    e.stopPropagation();
    const userInfo = JSON.parse(localStorage.getItem("USER_INFO"));
    const approvedBy = userInfo?.id || 1;

    setLoadingDeliveryId(order.id);
    try {
      await updateOrderStatusWithFallback(order.id, ["Delivering"], approvedBy);
      showToast("success", `Đơn hàng #${order.id} đã được chuyển sang Delivering!`);
      dispatch(fetchGetOrder());
    } catch (err) {
      showToast("error", `Lỗi khi chuyển giao đơn: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoadingDeliveryId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return incomingOrders.filter((order) => {
      const statusMatch =
        filterStatus === "All" || normalizeOrderStatus(order.status) === filterStatus;
      const itemMatch =
        searchTerm === "" ||
        (order.orderLines || []).some((line) =>
          line.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      let dateMatch = true;
      if (filterDate) {
        const orderDay = parseUTC(order.orderDate).toISOString().slice(0, 10);
        dateMatch = orderDay === filterDate;
      }
      return statusMatch && itemMatch && dateMatch;
    });
  }, [incomingOrders, searchTerm, filterDate, filterStatus]);

  const detailLines = useMemo(() => normalizeCollection(detailOrder?.orderLines), [detailOrder]);

  return (
    <>
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <div className="min-w-0">
            <p className="break-words">{toast.message}</p>
            {toast.details?.length > 0 && (
              <div className="mt-2 space-y-1 text-xs text-white/90">
                {toast.details.map((detail, index) => (
                  <p key={`${detail}-${index}`} className="break-words">
                    • {detail}
                  </p>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setToast(null)} className="ml-2 opacity-75 hover:opacity-100">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900">Order Processing</h2>
              <span className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span className="material-symbols-outlined text-[18px]">list_alt</span>
                <span>{filteredOrders.length} Orders Active</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
              </div>
              <button className="px-4 py-2 bg-navy-charcoal text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">
                Logout
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/50">
            <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                      placeholder="Search by item name..."
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                    <input
                      type="date"
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary outline-none text-slate-700"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                    {filterDate && (
                      <button onClick={() => setFilterDate("")} className="text-slate-400 hover:text-slate-600" title="Clear date filter">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Status Tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {STATUS_TABS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        filterStatus === s
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Source (Franchise)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Items List</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-slate-400 py-10 text-sm">
                          Không có đơn hàng nào phù hợp
                        </td>
                      </tr>
                    )}
                    {filteredOrders.map((order, idx) => {
                      const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      const lines = order.orderLines || [];
                      const firstLine = lines[0];
                      const restLines = lines.slice(1);
                      const inventoryStatus = orderInventoryStatus[order.id];
                      const hasInsufficientStock = inventoryStatus?.hasShortage;
                      const hasInventoryReady = !!readyOrders[order.id];
                      const displayStatus = order.status === "Processing" && hasInventoryReady ? "Filled" : order.status;
                      const statusBadge = getStatusBadge(displayStatus);
                      const hasEffectiveShortage = hasInsufficientStock && !hasInventoryReady;
                      const isProcessing = order.status === "Processing";
                      const isApproved = order.status === "Approved";
                      const isCompleted = order.status === "Completed";
                      const isCancelled = String(order.status || "").toLowerCase().includes("cancel");
                      const isRejected = String(order.status || "").toLowerCase().includes("reject");
                      const isLockedStatus = isCancelled || isRejected;
                      const acceptDisabled = isApproved || isCompleted || isLockedStatus || hasEffectiveShortage;
                      const requestDisabled = isProcessing || isCompleted || isLockedStatus;

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => openDetailModal(order)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-bold text-navy-charcoal hover:text-primary transition-colors underline underline-offset-2 decoration-slate-300">
                                #ORD-{order.id}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Placed {getTimeDiff(order.orderDate)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`size-6 rounded flex items-center justify-center text-[10px] font-black ${avatarColor}`}>
                                {getInitial(order.username)}
                              </div>
                              <span className="text-sm font-bold text-navy-charcoal">{order.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {lines.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">Không có sản phẩm</span>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                {firstLine && (
                                  <span className="text-sm text-slate-700">{firstLine.quantity}x {firstLine.name}</span>
                                )}
                                {restLines.length > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {restLines.map((l) => `${l.quantity}x ${l.name}`).join(", ")}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-tight ${statusBadge.cls}`}>
                                {statusBadge.label}
                              </span>
                              {!isCompleted && (
                                readyOrders[order.id] ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-50 text-green-600 border border-green-200">
                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                    Inventory Ready
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-50 text-red-500 border border-red-200">
                                    <span className="material-symbols-outlined text-[10px]">cancel</span>
                                    Not Ready
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end items-center gap-2">
                              <div className="flex items-center gap-1.5" title={hasEffectiveShortage ? `Thiếu tồn kho cho ${inventoryStatus?.shortageCount || 0} nguyên liệu` : "Accept order"}>
                                <button
                                  onClick={(e) => openAcceptModal(e, order)}
                                  disabled={acceptDisabled}
                                  className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-colors disabled:cursor-not-allowed ${
                                    hasEffectiveShortage
                                      ? "bg-amber-400/70 opacity-45"
                                      : "bg-primary hover:bg-primary/90 disabled:opacity-40"
                                  }`}
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    {hasEffectiveShortage && <span className="material-symbols-outlined text-[14px]">warning</span>}
                                    <span>Accept</span>
                                  </span>
                                </button>
                                {hasEffectiveShortage && (
                                  <span className="text-[10px] font-semibold text-amber-600 whitespace-nowrap">
                                    {inventoryStatus.shortageCount} thiếu
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={(e) => openRequestModal(e, order)}
                                disabled={requestDisabled}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                Request
                              </button>
                              {/* More actions dropdown */}
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                </button>
                                {openDropdown === order.id && (
                                  <>
                                    <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                                    <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 w-40">
                                      <button
                                        onClick={() => openRejectModal(order)}
                                        disabled={isApproved || isProcessing || isCompleted || isLockedStatus}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Reject Order
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Showing {filteredOrders.length} of {incomingOrders.length} Orders
                </span>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== Detail Modal ===== */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-[560px] max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Order Detail{" "}
                    {detailOrder && <span className="font-mono text-primary">#{detailOrder.id}</span>}
                  </h3>
                  {detailOrder && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(detailOrder.orderDate)} · by {detailOrder.username}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-sm">Đang tải chi tiết đơn...</span>
                </div>
              ) : detailOrder ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`px-3 py-1 border rounded-full text-xs font-black uppercase tracking-tight ${getStatusBadge(detailOrder.status === "Processing" && readyOrders[detailOrder.id] ? "Filled" : detailOrder.status).cls}`}>
                      {getStatusBadge(detailOrder.status === "Processing" && readyOrders[detailOrder.id] ? "Filled" : detailOrder.status).label}
                    </span>
                    <span className="text-xs text-slate-400">Order Date: {formatDate(detailOrder.orderDate)}</span>
                  </div>

                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">Qty</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailLines.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center text-slate-400 py-6 text-sm">
                              Không có sản phẩm trong đơn hàng
                            </td>
                          </tr>
                        ) : (
                          detailLines.map((line, index) => {
                            const ingredients = getLineIngredients(line);

                            return (
                            <tr key={line.id} className="border-t border-slate-100">
                              <td className="px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">{line.name}</p>
                                <p className="text-xs text-slate-400">{line.description}</p>
                                {ingredients.length > 0 && (
                                  <div className="mt-2 space-y-1 border-l-2 border-amber-200 pl-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                                      Ingredients
                                    </p>
                                    {ingredients.map((ingredient, ingredientIndex) => {
                                      const quantity = formatIngredientQuantity(ingredient);

                                      return (
                                        <div
                                          key={`${line.id || index}-ingredient-${ingredientIndex}`}
                                          className="flex items-center justify-between gap-3 text-xs text-slate-500"
                                        >
                                          <span>{getIngredientName(ingredient, ingredientIndex)}</span>
                                          {quantity && <span className="font-medium text-slate-600">{quantity}</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium capitalize">
                                  {line.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 text-right">
                                {(line.price || 0).toLocaleString("vi-VN")}đ
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">{line.quantity}</td>
                              <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">
                                {((line.price || 0) * line.quantity).toLocaleString("vi-VN")}đ
                              </td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {detailLines.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-primary">
                          {detailLines
                            .reduce((s, l) => s + (l.price || 0) * l.quantity, 0)
                            .toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setDetailModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Accept Modal ===== */}
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
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to accept{" "}
                  <span className="font-mono font-bold">#ORD-{selectedOrder?.id}</span>?
                  This will move the order to Confirmed.
                </p>
              </div>
              <button onClick={() => setAcceptModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setAcceptModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm">
                Cancel
              </button>
              <button
                onClick={confirmAccept}
                disabled={loadingAccept}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm shadow flex items-center gap-2 disabled:opacity-60"
              >
                {loadingAccept && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                Confirm Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Reject Modal ===== */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRejectModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-96 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reject Order</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to reject order{" "}
                <span className="font-mono font-bold text-slate-700">#{selectedOrder?.id}</span>?
              </p>
              <p className="text-xs text-red-500 font-medium mt-2 bg-red-50 px-3 py-1.5 rounded-lg">
                This will update the order status to Rejected (or Cancelled if Rejected is not supported). The order will remain in the list.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={loadingReject}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loadingReject && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Request Modal ===== */}
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
                  <p className="text-sm text-slate-500 mt-1">
                    Missing ingredients are prefilled from inventory shortage for order{" "}
                    <span className="font-mono font-bold">#ORD-{selectedOrder?.id}</span>.
                  </p>
                </div>
              </div>
              <button onClick={() => setRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 overflow-y-auto max-h-64 border rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500">
                    <th className="px-4 py-3">Material Name</th>
                    <th className="px-4 py-3">Needed</th>
                    <th className="px-4 py-3">In Stock</th>
                    <th className="px-4 py-3">Request Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRequestItems ? (
                    <tr>
                      <td colSpan={4} className="text-center text-slate-400 py-6 text-sm">
                        Đang tải nguyên liệu theo tồn kho...
                      </td>
                    </tr>
                  ) : requestItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-slate-400 py-6 text-sm">
                        Không tải được nguyên liệu cho đơn hàng này
                      </td>
                    </tr>
                  ) : (
                    requestItems.map((it, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3 text-sm font-medium">{it.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatMeasure(it.quantityNeeded)} {it.unit}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatMeasure(it.currentStock)} {it.unit}</td>
                        <td className="px-4 py-3">
                          <input
                            value={it.requestedQuantity}
                            onChange={(e) => updateRequestQty(idx, e.target.value)}
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                            placeholder="Qty"
                            type="number"
                            min={0}
                            step="0.001"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</label>
              <input
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                placeholder="Ghi chú thêm..."
              />
            </div>

            <div className="mt-4 text-sm text-amber-700 bg-amber-50 p-3 rounded mb-4">
              Request Qty is prefilled with the missing amount only. Materials that are already enough start at 0, and you can still adjust any quantity manually.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRequestModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm">
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={loadingRequest}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2 disabled:opacity-60"
              >
                {loadingRequest && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SupplyOrderProcessing;