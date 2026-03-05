import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function FranchiseLayout() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    username: "User",
    roleId: 3,
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("USER_INFO"));
      if (stored) setUserInfo(stored);
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("USER_INFO");
    navigate("/SignIn");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2 text-white">
              <span className="material-symbols-outlined">
                restaurant
              </span>
            </div>
            <div>
              <h1 className="text-base font-bold">
                Franchise Store
              </h1>
              <p className="text-xs text-slate-500">
                Management System
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          <Link
            to="/DashboardFranchise"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>

          <Link
            to="/CreateOrderFranchise"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">
              add_circle
            </span>
            Create Order
          </Link>
          <Link
            to="/OrderTrackingFranchise"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">
              add_circle
            </span>
            Order Tracking
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {userInfo.username}
            </span>
            <span
              onClick={handleLogout}
              className="material-symbols-outlined cursor-pointer hover:text-red-500"
            >
              logout
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default FranchiseLayout;