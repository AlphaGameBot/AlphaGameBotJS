// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use client";

import { useEffect, useState } from "react";

export default function SystemStatus() {
    const [status, setStatus] = useState<"operational" | "degraded" | "down" | "unknown">("unknown");

    useEffect(() => {
        fetch("/api/system-status").then((res) => res.json()).then((data) => {
            setStatus(data.status);
        });
    }, []);

    return (
        <div className="p-4 mb-8 text-sm rounded-lg" style={{ backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border)' }}>
            {/* pulsing circle with green text all systems operational */}
            <div className="flex items-center gap-2">
                <div
                    className={`w-3 h-3 rounded-full ${status === "operational" ? "animate-pulse" : "animate-pulse"}`}
                    style={{
                        backgroundColor:
                            status === "operational"
                                ? "var(--success-500)"
                                : status === "degraded"
                                    ? "var(--warning-500)"
                                    : status === "down"
                                        ? "var(--danger-500)"
                                        : "var(--color-gray-400)", // unknown -> gray
                    }}
                />
                <span style={{ color: "var(--text-muted)" }}>
                    {status === "operational"
                        ? "All Systems Operational"
                        : status === "degraded"
                            ? "Partial System Degradation"
                            : status === "down"
                                ? "Outage Detected"
                                : "Unknown Status"}
                </span>
            </div>
        </div>
    );
}