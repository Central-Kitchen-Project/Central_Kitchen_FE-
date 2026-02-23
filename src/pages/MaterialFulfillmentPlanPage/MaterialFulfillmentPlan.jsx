import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function MaterialFulfillmentPlan() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const batchId = params.get("id");

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================
  // MOCK API DATA
  // ==========================
  const mockApiResponse = {
    status: "Success",
    data: [
      {
        id: 4,
        orderId: 1,
        requestedByUsername: "aaa",
        status: "Pending",
        note: "thêm bột mì",
        createdAt: "2026-02-23T01:15:53.027",
        items: [
          {
            id: 3,
            itemId: 1,
            materialName: "Bot mi",
            unit: "kg",
            currentStock: 0,
            requestedQuantity: 100,
          },
        ],
      },
      {
        id: 3,
        orderId: 7,
        requestedByUsername: "aaa",
        status: "Pending",
        note: "string",
        createdAt: "2026-02-23T00:58:38.983",
        items: [
          {
            id: 2,
            itemId: 7,
            materialName: "Sugar",
            unit: "kg",
            currentStock: 0,
            requestedQuantity: 2,
          },
        ],
      },
    ],
  };

  // ==========================
  // LOAD DATA BASED ON orderId
  // ==========================
  useEffect(() => {
    const found = mockApiResponse.data.find(
      (item) => item.orderId.toString() === batchId
    );

    setRequest(found || null);
    setLoading(false);
  }, [batchId]);

  // ==========================
  // ACCEPT REQUEST
  // ==========================
  const handleAccept = () => {
    setRequest((prev) => ({ ...prev, status: "Approved" }));
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!request) return <div className="p-10">Request not found</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Material Fulfillment Plan
            </h2>
            <p className="text-slate-500 text-xs">
              Order #{request.orderId} • Requested by{" "}
              <span className="font-bold">{request.requestedByUsername}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                request.status === "Pending"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {request.status}
            </span>

            {request.status === "Pending" && (
              <button
                onClick={handleAccept}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
              >
                Accept Request
              </button>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* NOTE */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <p className="text-xs font-bold text-blue-600 uppercase">Note</p>
            <p className="text-sm text-blue-900 mt-1">{request.note}</p>
          </div>

          {/* MATERIAL REQUIREMENTS */}
          <section>
            <h3 className="text-lg font-bold mb-4 text-slate-900">
              Material Requirements & Actions
            </h3>

            <div className="space-y-4">
              {request.items.map((item) => {
                const deficit =
                  item.requestedQuantity - item.currentStock;

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-xl shadow-sm p-6 ${
                      deficit > 0 ? "border-l-4 border-l-red-500" : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                      {/* MATERIAL INFO */}
                      <div className="lg:col-span-4">
                        <h4 className="font-bold text-slate-900">
                          {item.materialName}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                          <span>
                            <b className="text-slate-700">Requested:</b>{" "}
                            {item.requestedQuantity} {item.unit}
                          </span>
                          <span>
                            <b className="text-slate-700">Stock:</b>{" "}
                            {item.currentStock} {item.unit}
                          </span>
                          {deficit > 0 && (
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                              Deficit: {deficit} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ACTION OPTIONS */}
                      <div className="lg:col-span-5">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`action-${item.id}`}
                              defaultChecked
                              className="sr-only peer"
                            />
                            <div className="text-center py-2 text-[10px] font-bold uppercase rounded-md peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-slate-500">
                              Internal Production
                            </div>
                          </label>

                          <label className="flex-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`action-${item.id}`}
                              className="sr-only peer"
                            />
                            <div className="text-center py-2 text-[10px] font-bold uppercase rounded-md peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-slate-500">
                              External Sourcing
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* STATUS */}
                      <div className="lg:col-span-3 text-right">
                        {deficit > 0 ? (
                          <span className="text-xs font-bold text-red-600">
                            Action Required
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-green-600">
                            Ready
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="bg-white border-t border-slate-200 px-8 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/OrderAggregation")}
            className="px-4 py-2 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100"
          >
            ← Back
          </button>

          <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700">
            Confirm & Trigger
          </button>
        </footer>
      </main>
    </div>
  );
}

export default MaterialFulfillmentPlan;