import { Routes, Route } from "react-router-dom";
import SignIn from "../src/pages/SignInPage/SignIn";
import SignUp from "./pages/SignUpPage";
import NotFound from "./pages/NotFound";
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

      {/* Not found */}
      <Route path="/NotFound" element={<NotFound />} />
    </Routes>
  );
}

export default App;
