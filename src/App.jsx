import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../src/pages/SignInPage/SignIn";
import SignUp from "./pages/SignUpPage";
import ForgotPassword from "./pages/ForgotPasswordPage/ForgotPassword";
import NotFound from "./pages/NotFound";
import OrderAggregation from "./pages/OrderAggregationPage/OrderAggregation";
import SupplyOrderProcessing from "./pages/SupplyOrderProcessingPage/SupplyOrderProcessing";

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
      <Route path="/OrderAggregation" element={<OrderAggregation />} />

      {/* Not found */}
      <Route path="/NotFound" element={<NotFound />} />
    </Routes>
  );
}

export default App;
