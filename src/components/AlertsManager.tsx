"use client";

import { useEffect, useState } from "react";
import { Bell, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast, { Toast } from "react-hot-toast";

interface Alert {
  id: string;
  inventoryItem: {
    name: string;
    quantity: number;
    unit: string;
  };
  alertType: string;
  message: string;
  acknowledged: boolean;
  createdAt: string;
}

export function AlertsManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        const unacknowledgedAlerts = data.filter(
          (alert: Alert) => !alert.acknowledged
        );
        setAlerts(unacknowledgedAlerts);

        unacknowledgedAlerts
          .filter((alert: Alert) => alert.alertType === "LOW_STOCK")
          .forEach((alert: Alert) => {
            toast.custom(
              (t: Toast) => (
                <div
                  className={`${
                    t.visible ? "animate-enter" : "animate-leave"
                  } max-w-md w-full bg-red-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                  <div className="flex-1 w-0 p-4">
                    <p className="text-sm font-medium text-white">
                      {alert.message}
                    </p>
                  </div>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="p-4 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ),
              { id: alert.id, duration: 10000 }
            );
          });
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  };

  const acknowledgeAlert = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, acknowledged: true }),
      });
      if (res.ok) {
        setAlerts(alerts.filter((alert) => alert.id !== id));
        toast.success("Alert dismissed");
      } else {
        toast.error("Failed to dismiss alert");
      }
    } catch {
      toast.error("Failed to dismiss alert");
    }
    setLoading(false);
  };

  const unacknowledgedCount = alerts.length;

  return (
    <>
      {/* Alert Bell */}
      <div className="fixed top-4 right-18 z-50">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative p-2 text-white hover:text-accent transition-colors"
          aria-label="Show/Hide Inventory Alerts"
        >
          <Bell className="h-6 w-6" />
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-2 text-xs font-bold">
              {unacknowledgedCount}
            </span>
          )}
        </button>
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="fixed top-14 right-4 w-80 max-h-96 overflow-y-auto rounded border border-gray-700 bg-blue-900 p-4 shadow-lg z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">
              Inventory Alerts
            </h3>
            <button
              onClick={() => setShowAlerts(false)}
              aria-label="Close Alerts Panel"
              className="text-white hover:text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {alerts.length === 0 ? (
            <p className="text-gray-300">No active alerts.</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="mb-2 rounded bg-red-800 p-2 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-yellow-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-300">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                  disabled={loading}
                >
                  Dismiss
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
