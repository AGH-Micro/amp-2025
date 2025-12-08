import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import "./components/Charts.css";
import Charts from "./components/Charts.jsx";
import LogConsole from "./components/LogConsole.jsx";
import StatusPanel from "./components/StatusPanel.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import ChartsModal from "./components/ChartsModal.jsx";
import ConnectionModal from "./components/ConnectionModal.jsx";
import config from "./config.js";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
function ATMApp() {
    // === REFS FOR DATA (No re-renders on update) ===
    const dataRef = useRef({
        temp1: [],
        temp2: [],
        temp3: [],
        iq: [],
        stft: [],
    });
    const logsRef = useRef(["[00:00:00] System ready"]);
    const logsVersionRef = useRef(0);

    // === WEBSOCKET REFERENCE ===
    const wsRef = useRef(null);
    const isMountedRef = useRef(true);
    const connectWebSocketRef = useRef(null);

    // === STATE DEFINITIONS ===
    // Connection
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");

    // Connection Config
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [connectionConfig, setConnectionConfig] = useState(null);

    // Temp Threshold
    const [showTempModal, setShowTempModal] = useState(false);
    const [temperatureThreshold, setTemperatureThreshold] = useState(() => {
        const saved = localStorage.getItem("temp_threshold");
        return saved ? parseFloat(saved) : 25;
    });
    const [tempInput, setTempInput] = useState("");
    const temperatureThresholdRef = useRef(
        parseFloat(localStorage.getItem("temp_threshold")) || 25
    );
    const lastTempAlertRef = useRef({ temp1: 0, temp2: 0, temp3: 0 });

    // Chart Modals
    const [showChartTempModal, setShowChartTempModal] = useState(false);
    const [showChartFFTModal, setShowChartFFTModal] = useState(false);
    const [showChartSTFTModal, setShowChartSTFTModal] = useState(false);

    // === LOGGING SYSTEM ===
    const addLog = useCallback((message) => {
        const timestamp = new Date().toLocaleTimeString();
        const newLog = `[${timestamp}] ${message}`;
        logsRef.current.push(newLog);
        if (logsRef.current.length > 100) {
            logsRef.current.shift();
        }
        logsVersionRef.current++;
    }, []);

    // === PARSING DATA WITH PREFIX ===
    const parseDataWithPrefix = useCallback(
        (fullPayload) => {
            // Split payload by newline to handle multiple messages in one packet
            const messages = fullPayload.split("\n");

            messages.forEach((payload) => {
                if (!payload || payload.trim() === "") return;

                const parts = payload.split(":");
                if (parts.length < 2) {
                    if (payload.length > 5) {
                        // addLog(`Invalid data from MCU: ${payload}`);
                    }
                    return;
                }

                const prefix = parts[0].trim();
                const timestamp = new Date().toISOString();

                switch (prefix) {
                    case config.TEMP1_PREFIX:
                        {
                            const value = parseFloat(parts[1].trim());
                            if (isNaN(value)) return;

                            const queue = dataRef.current.temp1;
                            queue.push({ value, timestamp });
                            if (queue.length > config.MAX_DATA_POINTS)
                                queue.shift();

                            // Check threshold
                            const now = Date.now();
                            if (
                                value > temperatureThresholdRef.current &&
                                now - lastTempAlertRef.current.temp1 > 5000
                            ) {
                                addLog(
                                    `⚠️ ALERT: Temp 1 exceeded threshold! ${value.toFixed(
                                        1
                                    )}°C > ${temperatureThresholdRef.current}°C`
                                );
                                lastTempAlertRef.current.temp1 = now;
                            }
                        }
                        break;

                    case config.TEMP2_PREFIX:
                        {
                            const value = parseFloat(parts[1].trim());
                            if (isNaN(value)) return;

                            const queue = dataRef.current.temp2;
                            queue.push({ value, timestamp });
                            if (queue.length > config.MAX_DATA_POINTS)
                                queue.shift();

                            // Check threshold
                            const now = Date.now();
                            if (
                                value > temperatureThresholdRef.current &&
                                now - lastTempAlertRef.current.temp2 > 5000
                            ) {
                                addLog(
                                    `⚠️ ALERT: Temp 2 exceeded threshold! ${value.toFixed(
                                        1
                                    )}°C > ${temperatureThresholdRef.current}°C`
                                );
                                lastTempAlertRef.current.temp2 = now;
                            }
                        }
                        break;

                    case config.TEMP3_PREFIX:
                        {
                            const value = parseFloat(parts[1].trim());
                            if (isNaN(value)) return;

                            const queue = dataRef.current.temp3;
                            queue.push({ value, timestamp });
                            if (queue.length > config.MAX_DATA_POINTS)
                                queue.shift();

                            // Check threshold
                            const now = Date.now();
                            if (
                                value > temperatureThresholdRef.current &&
                                now - lastTempAlertRef.current.temp3 > 5000
                            ) {
                                addLog(
                                    `⚠️ ALERT: Temp 3 exceeded threshold! ${value.toFixed(
                                        1
                                    )}°C > ${temperatureThresholdRef.current}°C`
                                );
                                lastTempAlertRef.current.temp3 = now;
                            }
                        }
                        break;

                    case config.IQ_PREFIX:
                        try {
                            const iqValues = parts[1]
                                .split(",")
                                .map((v) => parseFloat(v));
                            if (iqValues.length >= 2) {
                                const queue = dataRef.current.iq;
                                queue.push({ i: iqValues[0], q: iqValues[1] });
                                if (queue.length > config.MAX_DATA_POINTS)
                                    queue.shift();
                            }
                        } catch (e) {
                            addLog(`IQ parsing error: ${e.message}`);
                        }
                        break;

                    case config.STFT_PREFIX:
                        try {
                            if (!parts[1]) return;
                            const values = parts[1]
                                .split(",")
                                .map((v) => parseFloat(v));

                            if (values.length > 4096) {
                                // addLog(`STFT packet too large: ${values.length} values`);
                                return;
                            }

                            const frequencies = [];
                            const amplitudes = [];

                            for (let i = 0; i < values.length; i += 2) {
                                frequencies.push(values[i]);
                                amplitudes.push(values[i + 1]);
                            }

                            const queue = dataRef.current.stft;
                            queue.push({
                                time: timestamp,
                                frequencies,
                                amplitudes,
                            });
                            if (queue.length > config.MAX_STFT_FRAMES)
                                queue.shift();
                        } catch (e) {
                            console.error("Error parsing STFT", e);
                        }
                        break;

                    default:
                        // addLog(`Unknown prefix: ${prefix}`);
                        break;
                }
            });
        },
        [addLog]
    );

    // === WEBSOCKET CONNECTION ===
    const connectWebSocket = useCallback(() => {
        if (isConnecting) return;
        if (
            wsRef.current &&
            (wsRef.current.readyState === WebSocket.OPEN ||
                wsRef.current.readyState === WebSocket.CONNECTING)
        )
            return;

        setIsConnecting(true);
        const ws = new WebSocket(config.PROXY_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setIsConnecting(false);
            setConnectionStatus("PROXY CONNECTED");
            addLog("WebSocket connected.");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Handle system messages
                if (data.type === "system") {
                    addLog(`System: ${data.message}`);
                    if (data.status === "disconnected") {
                        setConnectionStatus("MCU DISCONNECTED");
                        addLog("MCU disconnected.");
                    } else if (data.status === "connected") {
                        setConnectionStatus("MCU CONNECTED");
                        addLog("MCU connected.");
                    }
                    return;
                }

                // Handle config state sync
                if (data.type === "config_state") {
                    setConnectionConfig({
                        mode: data.mode,
                        host: data.host,
                        port: data.port,
                        serialPort: data.serialPort,
                        baudRate: data.baudRate,
                    });
                    return;
                }

                // Handle data
                if (data.type === "data" && data.payload) {
                    parseDataWithPrefix(data.payload);
                }
            } catch (error) {
                // Fallback for non-JSON data (if any)
                parseDataWithPrefix(event.data);
            }
        };

        ws.onerror = (error) => {
            addLog(`WebSocket error: ${error}`);
            setIsConnecting(false);
        };

        ws.onclose = (event) => {
            setIsConnected(false);
            setIsConnecting(false);
            setConnectionStatus("DISCONNECTED");
            if (event.code !== 1000 && isMountedRef.current) {
                addLog("WebSocket disconnected, Reconnecting...");
                setTimeout(() => {
                    if (connectWebSocketRef.current)
                        connectWebSocketRef.current();
                }, config.RECONNECT_DELAY);
            } else {
                addLog("WebSocket connection closed by user.");
            }
        };
    }, [addLog, parseDataWithPrefix, isConnecting]);

    // Update ref whenever connectWebSocket changes
    useEffect(() => {
        connectWebSocketRef.current = connectWebSocket;
    }, [connectWebSocket]);

    const disconnectWebSocket = useCallback(() => {
        if (
            wsRef.current &&
            (wsRef.current.readyState === WebSocket.OPEN ||
                wsRef.current.readyState === WebSocket.CONNECTING)
        ) {
            wsRef.current.close(1000, "User disconnected");
        }
    }, []);

    // === HANDLERS ===
    const openConnectionModal = useCallback(() => {
        setShowConnectionModal(true);
    }, []);

    const closeConnectionModal = useCallback(() => {
        setShowConnectionModal(false);
    }, []);

    const confirmConnectionChange = useCallback(
        (newConfig) => {
            // 1. Handle Proxy Connection (Frontend -> Node.js)
            const currentProxyHost = localStorage.getItem("ws_host");
            const currentProxyPort = localStorage.getItem("ws_port");

            let proxyChanged = false;

            if (
                newConfig.proxyHost &&
                newConfig.proxyHost !== currentProxyHost
            ) {
                localStorage.setItem("ws_host", newConfig.proxyHost);
                proxyChanged = true;
            }

            if (
                newConfig.proxyPort &&
                newConfig.proxyPort.toString() !== currentProxyPort
            ) {
                localStorage.setItem("ws_port", newConfig.proxyPort);
                proxyChanged = true;
            }

            if (proxyChanged) {
                addLog(`Proxy settings changed. Reconnecting...`);
                // Force reconnect
                if (wsRef.current) {
                    wsRef.current.close(); // This will trigger onclose which triggers reconnect
                }
            }

            // 2. Handle MCU Connection (Node.js -> MCU)
            // Only send if we are connected to WS
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                    JSON.stringify({
                        type: "config_change",
                        mode: newConfig.mode,
                        host: newConfig.host,
                        port: newConfig.port,
                        serialPort: newConfig.serialPort,
                        baudRate: newConfig.baudRate,
                    })
                );
                addLog(
                    `MCU connection settings updated: ${newConfig.mode.toUpperCase()}`
                );
            }

            setConnectionConfig(newConfig);
            closeConnectionModal();
        },
        [addLog, closeConnectionModal]
    );

    const handleConnectionToggle = useCallback(() => {
        if (isConnecting) return;
        if (isConnected) {
            disconnectWebSocket();
        } else {
            connectWebSocket();
        }
    }, [isConnecting, isConnected, disconnectWebSocket, connectWebSocket]);

    const openTempModal = useCallback(() => {
        setTempInput(temperatureThreshold.toString());
        setShowTempModal(true);
    }, [temperatureThreshold]);

    const closeTempModal = useCallback(() => {
        setShowTempModal(false);
        setTempInput("");
    }, []);

    const confirmTempThreshold = useCallback(() => {
        const newTempThreshhold = parseFloat(tempInput);
        if (!isNaN(newTempThreshhold)) {
            setTemperatureThreshold(newTempThreshhold);
            temperatureThresholdRef.current = newTempThreshhold;
            localStorage.setItem(
                "temp_threshold",
                newTempThreshhold.toString()
            );
            addLog(`Temperature threshold set to ${newTempThreshhold}°C`);
        }
        closeTempModal();
    }, [tempInput, addLog, closeTempModal]);

    const openChartTempModal = useCallback(
        () => setShowChartTempModal(true),
        []
    );
    const openChartFFTModal = useCallback(() => setShowChartFFTModal(true), []);
    const closeChartTempModals = useCallback(
        () => setShowChartTempModal(false),
        []
    );
    const closeChartFFTModals = useCallback(
        () => setShowChartFFTModal(false),
        []
    );
    const openChartSTFTModal = useCallback(
        () => setShowChartSTFTModal(true),
        []
    );
    const closeChartSTFTModal = useCallback(
        () => setShowChartSTFTModal(false),
        []
    );

    const calibrate = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const message = "CALIBRATION\n";
            wsRef.current.send(message);
            addLog("Calibration command sent to MCU");
        } else {
            addLog("Cannot send calibration - WebSocket not connected");
        }
    }, [addLog]);

    // === LIFECYCLE ===
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (wsRef.current) {
                wsRef.current.onopen = null;
                wsRef.current.onmessage = null;
                wsRef.current.onerror = null;
                wsRef.current.onclose = null;
                if (
                    wsRef.current.readyState === WebSocket.OPEN ||
                    wsRef.current.readyState === WebSocket.CONNECTING
                ) {
                    wsRef.current.close(1000, "Component unmounted");
                }
            }
        };
    }, []);

    // === RENDER ===
    return (
        <div className="app-container">
            <header className="app-header">
                <img
                    src="./MICRO_logo_mniejsze.png"
                    alt="logo"
                    className="app-logo"
                />
                <img
                    src="./acc_logo.png"
                    alt="acc_logo"
                    className="app-acc_logo"
                />
            </header>

            <main className="app-main">
                <div className="charts-panel">
                    <div className="chart-container">
                        {/* Row 1: Temp and FFT side by side */}
                        <div className="chart-row">
                            <Charts
                                type="temp"
                                isModal={false}
                                Act={openChartTempModal}
                                dataRef={dataRef}
                            />
                            <Charts
                                type="iq"
                                isModal={false}
                                Act={openChartFFTModal}
                                dataRef={dataRef}
                            />
                        </div>

                        {/* Row 2: STFT Heatmap */}
                        <div className="chart-row-stft">
                            <Charts
                                type="stft"
                                isModal={false}
                                Act={openChartSTFTModal}
                                dataRef={dataRef}
                            />
                        </div>
                    </div>
                </div>

                <div className="controls-panel">
                    <LogConsole
                        logsRef={logsRef}
                        logsVersionRef={logsVersionRef}
                    />

                    <div className="bottom-controls">
                        <StatusPanel
                            isConnected={isConnected}
                            connectionStatus={connectionStatus}
                            onOpenTempModal={openTempModal}
                            calibrate={calibrate}
                            onClickButtonConnect={handleConnectionToggle}
                            onOpenIPModal={openConnectionModal}
                        />
                    </div>
                </div>
            </main>

            <SettingsModal
                show={showTempModal}
                type="temp"
                currentValue={temperatureThreshold}
                inputValue={tempInput}
                onInputChange={setTempInput}
                onConfirm={confirmTempThreshold}
                onClose={closeTempModal}
            />

            <ChartsModal
                show={showChartTempModal}
                type="temp"
                onClose={closeChartTempModals}
                dataRef={dataRef}
            />

            <ChartsModal
                show={showChartFFTModal}
                type="iq"
                onClose={closeChartFFTModals}
                dataRef={dataRef}
            />

            <ChartsModal
                show={showChartSTFTModal}
                type="stft"
                onClose={closeChartSTFTModal}
                dataRef={dataRef}
            ></ChartsModal>

            <ConnectionModal
                show={showConnectionModal}
                currentConfig={connectionConfig}
                onConfirm={confirmConnectionChange}
                onClose={closeConnectionModal}
            />
        </div>
    );
}

export default ATMApp;
