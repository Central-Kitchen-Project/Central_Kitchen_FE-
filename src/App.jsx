import { Routes, Route } from "react-router-dom";
import SignIn from "../src/pages/SignInPage/SignIn";
import SignUp from "./pages/SignUpPage";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
      </Routes>
   
  );
}

export default App;