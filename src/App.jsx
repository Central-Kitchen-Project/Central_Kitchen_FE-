import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { HIDDEN_ITEM_IDS_STORAGE_KEY, syncHiddenItems } from "./store/itemSlice";
import SignIn from "../src/pages/SignInPage/SignIn";
import SignUp from "./pages/SignUpPage";
import ForgotPassword from "./pages/ForgotPasswordPage/ForgotPassword";
import NotFound from "./pages/NotFound";
import HomepageFranchise from "./pages/Franchise/HomepageFranchise/HomepageFranchise";
import HomepageCentral from "./pages/CentralKitchen/HomepageCentral/HomepageCentral";
import HomepageSupply from "./pages/SupplyCoordinator/HomepageSupply/HomepageSupply";
import DashboardSupplier from "./pages/SupplyCoordinator/DashboardSupplier/DashboardSupplier";    
import DashboardCentral from "./pages/CentralKitchen/DashboardCentral/DashboardCentral";
import DashboardFranchise from "./pages/Franchise/DashboardFranchise/DashboardFranchise"; 
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin"; 
import DashboardManager from "./pages/DashboardManager/DashboardManager";
import CreateOrderFranchise from "./pages/Franchise/CreateOrderFranchise/CreateOrderFranchise";
import ConfirmOrderFranchise from "./pages/Franchise/ConfirmOrderFranchise/ConfirmOrderFranchise";
import OrderAggregation from "./pages/CentralKitchen/OrderAggregationPage/OrderAggregation";
import SupplyOrderProcessing from "./pages/SupplyCoordinator/SupplyOrderProcessingPage/SupplyOrderProcessing";
import AcceptOrder from "./pages/SupplyCoordinator/SupplyOrderProcessingPage/AcceptOrder";
import MaterialFulfillmentPlan from "./pages/MaterialFulfillmentPlanPage/MaterialFulfillmentPlan";
import CentralLayout from "./layouts/CentralLayout";
import SupplierLayout from "./layouts/SupplierLayout";
import FranchiseLayout from "./layouts/FranchiseLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import AdminLayout from "./layouts/AdminLayout";
import OrderTracking from "./pages/Franchise/OrderTracking";
import MaterialTracking from "./pages/CentralKitchen/MaterialTracking";
import FeedbackFranchise from "./pages/Franchise/FeedbackFranchise/FeedbackFranchise";
import InventoryFranchise from "./pages/Franchise/InventoryFranchise/InventoryFranchise";
import InventorySupply from "./pages/SupplyCoordinator/InventorySupply/InventorySupply";
import InventoryManager from "./pages/ManagerFranchise/InventoryManager/InventoryManager";
import PurchaseOrderManager from "./pages/ManagerFranchise/PurchaseOrderManager/PurchaseOrderManager";
import MenuManagement from "./pages/ManagerFranchise/MenuManagement/MenuManagement";
import ReportAnalyticsManager from "./pages/ManagerFranchise/ReportAnalyticsManager/ReportAnalyticsManager";  
import UserManagement from "./pages/DashboardAdmin/UserManagement/UserManagement";
import RBACSettings from "./pages/DashboardAdmin/RBACSettings/RBACSettings";
import SystemConfiguration from "./pages/DashboardAdmin/SystemConfiguration/SystemConfiguration";
import MasterAdmin from "./pages/MasterAdminPage/MasterAdmin";
import OrderManagement from "./pages/DashboardAdmin/OrderManagement/OrderManagement";
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === HIDDEN_ITEM_IDS_STORAGE_KEY) {
        dispatch(syncHiddenItems());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [dispatch]);

  return (
    <Routes>
      {/* Manager role — shared sidebar layout */}
      <Route element={<ManagerLayout />}>
        <Route path="/DashboardManager" element={<DashboardManager />} />
        <Route path="/InventoryManager" element={<InventoryManager />} />
        <Route path="/PurchaseOrderManager" element={<PurchaseOrderManager />} />
        <Route path="/MenuManagement" element={<MenuManagement />} />
        <Route path="/ReportAnalyticsManager" element={<ReportAnalyticsManager />} /> 
      </Route>

      {/* Default — redirect root to SignIn (login) */}
      <Route path="/" element={<Navigate to="/SignIn" replace />} />
      {/* Auth */}
      <Route path="/SignIn" element={<SignIn />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />

      {/* Central role — shared sidebar layout */}
      <Route element={<CentralLayout />}>
        <Route path="/DashboardCentral" element={<DashboardCentral />} />
        <Route path="/OrderAggregation" element={<OrderAggregation />} />
        <Route path="/MaterialTracking" element={<MaterialTracking />} />
        <Route path="/MaterialFulfillmentPlan" element={<MaterialFulfillmentPlan />} />
      </Route>

      {/* Supplier role — shared sidebar layout */}
      <Route element={<SupplierLayout />}>
        <Route path="/DashboardSupplier" element={<DashboardSupplier />} />
        <Route path="/SupplyOrderProcessing" element={<SupplyOrderProcessing />} />
        <Route path="/SupplyOrderProcessing/accept/:orderId" element={<AcceptOrder />} />
        <Route path="/InventorySupply" element={<InventorySupply />} />      
      </Route>

      {/* Franchise */}
      <Route element={<FranchiseLayout />}>
      <Route path="/DashboardFranchise" element={<DashboardFranchise />} />
      <Route path="/CreateOrderFranchise" element={<CreateOrderFranchise />} />
      <Route path="/OrderTrackingFranchise" element={<OrderTracking />} />
      <Route path="/InventoryFranchise" element={<InventoryFranchise />} />
      <Route path="/FeedbackFranchise" element={<FeedbackFranchise />} />
      </Route>
      {/* <Route path="/ConfirmOrderFranchise" element={<ConfirmOrderFranchise />} /> Không dùng nữa */}
      {/* Dashboard */}
      <Route element={<AdminLayout />}>
        <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
        <Route path="/UserManagement" element={<UserManagement />} />
        <Route path="/OrderManagement" element={<OrderManagement />} />
        <Route path="/RBACSettings" element={<RBACSettings />} />
        <Route path="/SystemConfiguration" element={<SystemConfiguration />} />
        <Route path="/MasterAdmin" element={<MasterAdmin />} />
      </Route>

      {/* Homepage */}
      <Route path="/HomepageFranchise" element={<HomepageFranchise />} />
      <Route path="/HomepageCentral" element={<HomepageCentral />} />
      <Route path="/HomepageSupply" element={<HomepageSupply />} /> 

      {/* Not found */}
      <Route path="/NotFound" element={<NotFound />} />
    </Routes>
  );
}

export default App;
