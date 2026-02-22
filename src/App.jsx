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

function App() {
  return (
    <Routes>
      {/* Default: redirect root to SignIn (login) */}
      <Route path="/" element={<Navigate to="/SignIn" replace />} />
      {/* Auth */}
      <Route path="/SignIn" element={<SignIn />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />

      {/* Order */}
      <Route path="/SupplyOrderProcessing" element={<SupplyOrderProcessing />} />
      <Route path="/SupplyOrderProcessing/accept/:orderId" element={<AcceptOrder />} />
      <Route path="/OrderAggregation" element={<OrderAggregation />} />
      <Route path="/MaterialFulfillmentPlan" element={<MaterialFulfillmentPlan />} />
      <Route path="/CreateOrderFranchise" element={<CreateOrderFranchise />} />
      <Route path="/ConfirmOrderFranchise" element={<ConfirmOrderFranchise />} />
 
      {/* Dashboard */}
      <Route path="/DashboardCentral" element={<DashboardCentral />} />
      <Route path="/DashboardFranchise" element={<DashboardFranchise />} />
      <Route path="/DashboardAdmin" element={<DashboardAdmin />} /> 
      <Route path="/DashboardManager" element={<DashboardManager />} /> 
      <Route path="/DashboardSupplier" element={<DashboardSupplier />} />


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
