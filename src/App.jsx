import { Routes, Route } from "react-router-dom";
import SignIn from "../src/pages/SignInPage/SignIn";
import SignUp from "./pages/SignUpPage";
import NotFound from "./pages/NotFound";
import MasterAdmin from "./pages/MasterAdminPage/MasterAdmin";
import HomepageFranchise from "./pages/HomepageFranchise/HomepageFranchise";
import HomepageCentral from "./pages/HomepageCentral/HomepageCentral";
import HomepageSupply from "./pages/HomepageSupply/HomepageSupply";
import DashboardCentral from "./pages/DashboardCentral/DashboardCentral";
import DashboardFranchise from "./pages/DashboardFranchise/DashboardFranchise"; 
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin"; 
import DashboardManager from "./pages/DashboardManager/DashboardManager";
import OrderAggregation from "./pages/OrderAggregationPage/OrderAggregation";
import SupplyOrderProcessing from "./pages/SupplyOrderProcessingPage/SupplyOrderProcessing";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/SignIn" element={<SignIn />} />
      <Route path="/SignUp" element={<SignUp />} />

      {/* Order */}
      <Route path="/SupplyOrderProcessing" element={<SupplyOrderProcessing />} />
      <Route path="/OrderAggregation" element={<OrderAggregation />} />

      {/* Dashboard */}
      <Route path="/DashboardCentral" element={<DashboardCentral />} />
      <Route path="/DashboardFranchise" element={<DashboardFranchise />} />
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
