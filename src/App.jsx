import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../src/pages/SignInPage/SignIn";
import SignUp from "./pages/SignUpPage";
import ForgotPassword from "./pages/ForgotPasswordPage/ForgotPassword";
import NotFound from "./pages/NotFound";
import MasterAdmin from "./pages/MasterAdminPage/MasterAdmin";
import HomepageFranchise from "./pages/HomepageFranchise/HomepageFranchise";
import HomepageCentral from "./pages/HomepageCentral/HomepageCentral";
import HomepageSupply from "./pages/HomepageSupply/HomepageSupply";
import DashboardSupplier from "./pages/DashboardSupplier/DashboardSupplier";    
import DashboardCentral from "./pages/DashboardCentral/DashboardCentral";
import DashboardFranchise from "./pages/DashboardFranchise/DashboardFranchise"; 
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin"; 
import DashboardManager from "./pages/DashboardManager/DashboardManager";
import CreateOrderFranchise from "./pages/CreateOrderFranchise/CreateOrderFranchise";
import ConfirmOrderFranchise from "./pages/ConfirmOrderFranchise/ConfirmOrderFranchise";
import OrderAggregation from "./pages/OrderAggregationPage/OrderAggregation";
import SupplyOrderProcessing from "./pages/SupplyOrderProcessingPage/SupplyOrderProcessing";
import AcceptOrder from "./pages/SupplyOrderProcessingPage/AcceptOrder";
import MaterialFulfillmentPlan from "./pages/MaterialFulfillmentPlanPage/MaterialFulfillmentPlan";
import CentralLayout from "./layouts/CentralLayout";
import SupplierLayout from "./layouts/SupplierLayout";

function App() {
  return (
    <Routes>
      {/* Default: redirect root to SignIn (login) */}
      <Route path="/" element={<Navigate to="/SignIn" replace />} />
      {/* Auth */}
      <Route path="/SignIn" element={<SignIn />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />

      {/* Central role — shared sidebar layout */}
      <Route element={<CentralLayout />}>
        <Route path="/DashboardCentral" element={<DashboardCentral />} />
        <Route path="/OrderAggregation" element={<OrderAggregation />} />
        <Route path="/MaterialFulfillmentPlan" element={<MaterialFulfillmentPlan />} />
      </Route>

      {/* Supplier role — shared sidebar layout */}
      <Route element={<SupplierLayout />}>
        <Route path="/DashboardSupplier" element={<DashboardSupplier />} />
        <Route path="/SupplyOrderProcessing" element={<SupplyOrderProcessing />} />
        <Route path="/SupplyOrderProcessing/accept/:orderId" element={<AcceptOrder />} />
      </Route>

      {/* Franchise */}
      <Route path="/DashboardFranchise" element={<DashboardFranchise />} />
      <Route path="/CreateOrderFranchise" element={<CreateOrderFranchise />} />
      <Route path="/ConfirmOrderFranchise" element={<ConfirmOrderFranchise />} />

      {/* Dashboard */}
      <Route path="/DashboardAdmin" element={<DashboardAdmin />} /> 
      <Route path="/DashboardManager" element={<DashboardManager />} /> 

      {/* Homepage */}
      <Route path="/HomepageFranchise" element={<HomepageFranchise />} />
      <Route path="/HomepageCentral" element={<HomepageCentral />} />
      <Route path="/HomepageSupply" element={<HomepageSupply />} /> 

      {/* Admin */}
      <Route path="/MasterAdmin" element={<MasterAdmin />} />

      {/* Not found */}
      <Route path="/NotFound" element={<NotFound />} />
    </Routes>
  );
}

export default App;
