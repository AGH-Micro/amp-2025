import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import "./StatusPanel.css";

// Wrap component function in memo(...)
const StatusPanel = memo(function StatusPanel({
    isConnected,
    connectionStatus,
    onOpenTempModal,
    calibrate,
    onClickButtonConnect,
    onOpenIPModal,
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside (with useCallback for proper cleanup)
    const handleClickOutside = useCallback((event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpen(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open, handleClickOutside]);

    return (
        <div className="status-panel">
            <div>
                <span className="status-panel__label">STATUS: </span>
                <span
                    className={`status-panel__status ${
                        isConnected
                            ? "status-panel__status--connected"
                            : "status-panel__status--disconnected"
                    }`}
                >
                    {connectionStatus}
                </span>
            </div>
            <div>
                <button
                    className="status-panel__button--fancy"
                    onClick={onClickButtonConnect}
                >
                    {isConnected ? "Disconnect" : "Connect"}
                </button>
                <div className="ControlPanel__gear-menu" ref={menuRef}>
                    <div
                        className="control-gear"
                        onClick={() => setOpen((v) => !v)}
                        title="Show controls"
                    >
                        <svg
                            width="38"
                            height="38"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="var(--AGH_black)"
                                strokeWidth="2"
                                fill="var(--AGH_white)"
                            />
                            <path
                                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                                stroke="var(--AGH_black)"
                                strokeWidth="2"
                                fill="none"
                            />
                        </svg>
                    </div>
                    <div
                        className={`ControlPanel__dropdown${
                            open ? " open" : ""
                        }`}
                    >
                        <button onClick={onOpenTempModal}>
                            Adjust temperature threshold
                        </button>
                        <button onClick={calibrate}>Calibrate system</button>
                        <button onClick={onOpenIPModal}>
                            Connection Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}); // Closing memo parenthesis

export default StatusPanel;
