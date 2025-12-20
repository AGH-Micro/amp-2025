// ws - WebSocket
// net - TCP
// serialport - UART
// 3 interfaces - 1 web, 2 MCU (TCP or Serial)

// Imports
const WebSocket = require("ws");
const net = require("net");
const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const config = require("./config");

// HTTP Server Application
const app = express();
app.use(cors());
app.use(express.json());

// WebSocket Server
const wss = new WebSocket.Server({ port: config.WS_PORT });

// Debug
console.log(`WebSocket server activated on port: ${config.WS_PORT}`);

// Declaration of variables for MCU connection handling
let mcuTcpClient = null;
let mcuSerialPort = null;
let connectionMode = "tcp"; // 'tcp' or 'serial'
let isConnecting = false;
let mcuStatus = {
    type: "system",
    status: "disconnected",
    message: "Not connected to MCU",
};
let requestInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // Max 30 seconds

// Current Config (can be updated via WS)
let currentConfig = {
    host: config.MCU_HOST,
    port: config.MCU_PORT,
    serialPort: config.SERIAL_PORT,
    baudRate: config.BAUD_RATE,
};

// Function to broadcast data to all WebSocket clients
const broadcast = (data) => {
    const dataStr = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(dataStr);
        }
    });
};

// === FUNCTION SENDING REQUEST TO MCU ===
const sendRequestToMCU = () => {
    const cmd = "RTEMP\nRSTFT\n";

    if (connectionMode === "tcp") {
        if (mcuTcpClient && !mcuTcpClient.destroyed && mcuTcpClient.writable) {
            mcuTcpClient.write(cmd);
        } else {
            // console.warn('[Periodic Request] Cannot send - MCU not connected (TCP)');
        }
    } else if (connectionMode === "serial") {
        if (mcuSerialPort && mcuSerialPort.isOpen) {
            mcuSerialPort.write(cmd);
        } else {
            // console.warn('[Periodic Request] Cannot send - MCU not connected (Serial)');
        }
    }
};

// === START PERIODIC REQUESTS ===
const startPeriodicRequests = () => {
    if (requestInterval) {
        return; // Already running
    }

    requestInterval = setInterval(sendRequestToMCU, 1000); // Every 1 second
    console.log("Periodic requests to MCU started (every 1 second)");
};

// === STOP PERIODIC REQUESTS ===
const stopPeriodicRequests = () => {
    if (requestInterval) {
        clearInterval(requestInterval);
        requestInterval = null;
        console.log("Periodic requests to MCU stopped");
    }
};

// === DISCONNECT HELPER ===
const disconnectMcu = () => {
    stopPeriodicRequests();

    if (mcuTcpClient) {
        console.log("Destroying TCP client...");
        mcuTcpClient.removeAllListeners();
        mcuTcpClient.destroy();
        mcuTcpClient = null;
    }

    if (mcuSerialPort) {
        console.log("Closing Serial port...");
        if (mcuSerialPort.isOpen) {
            mcuSerialPort.close();
        }
        mcuSerialPort = null;
    }

    isConnecting = false;
    mcuStatus = {
        type: "system",
        status: "disconnected",
        message: "MCU disconnected",
    };
    broadcast(mcuStatus);
};

// === DATA PARSING LOGIC (SHARED) ===
const handleMcuData = (data) => {
    const dataStr = data.toString();

    // 1. Attempt to parse as pure JSON
    try {
        const jsonData = JSON.parse(dataStr);
        // const jsonStr = JSON.stringify(jsonData);
        broadcast(jsonData);
        return;
    } catch (e) {
        // Not JSON, continue
    }

    // 2. Logic for concatenated text data
    const messages = dataStr.split(/(?=(?:TEMP:|IQ:|FFT:|STFT:))/g);

    messages.forEach((msg) => {
        if (!msg || msg.trim() === "") return;

        const wrappedData = { type: "data", payload: msg };
        broadcast(wrappedData);
    });
};

// === TCP CONNECTION ===
const connectToTcp = () => {
    if (isConnecting) return;
    disconnectMcu(); // Ensure clean slate

    isConnecting = true;
    connectionMode = "tcp";
    console.log(
        `Attempting to connect to MCU via TCP (${currentConfig.host}:${currentConfig.port})...`
    );

    mcuTcpClient = new net.Socket();

    mcuTcpClient.connect(currentConfig.port, currentConfig.host, () => {
        console.log(
            `Connected with MCU (TCP): ${currentConfig.host}:${currentConfig.port}`
        );
        isConnecting = false;
        reconnectAttempts = 0;
        mcuStatus = {
            type: "system",
            status: "connected",
            message: `Connected to MCU (TCP: ${currentConfig.host})`,
        };
        broadcast(mcuStatus);
        startPeriodicRequests();
    });

    mcuTcpClient.on("data", handleMcuData);

    mcuTcpClient.on("error", (err) => {
        console.error(`MCU TCP error: ${err.message}`);
        isConnecting = false;
    });

    mcuTcpClient.on("close", () => {
        console.log("TCP connection closed");
        if (connectionMode === "tcp") {
            handleReconnect();
        }
    });
};

// === SERIAL CONNECTION ===
const connectToSerial = () => {
    if (isConnecting) return;
    disconnectMcu();

    isConnecting = true;
    connectionMode = "serial";
    console.log(
        `Attempting to connect to MCU via Serial (${currentConfig.serialPort} @ ${currentConfig.baudRate})...`
    );

    try {
        mcuSerialPort = new SerialPort({
            path: currentConfig.serialPort,
            baudRate: parseInt(currentConfig.baudRate),
            autoOpen: false,
        });

        mcuSerialPort.open((err) => {
            if (err) {
                console.error("Error opening serial port:", err.message);
                isConnecting = false;
                handleReconnect();
                return;
            }

            console.log(
                `Connected with MCU (Serial): ${currentConfig.serialPort}`
            );
            isConnecting = false;
            reconnectAttempts = 0;
            mcuStatus = {
                type: "system",
                status: "connected",
                message: `Connected to MCU (Serial: ${currentConfig.serialPort})`,
            };
            broadcast(mcuStatus);
            startPeriodicRequests();
        });

        // const parser = mcuSerialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

        mcuSerialPort.on("data", handleMcuData);

        mcuSerialPort.on("error", (err) => {
            console.error(`Serial port error: ${err.message}`);
            isConnecting = false;
        });

        mcuSerialPort.on("close", () => {
            console.log("Serial port closed");
            if (connectionMode === "serial") {
                handleReconnect();
            }
        });
    } catch (err) {
        console.error("Failed to create SerialPort:", err);
        isConnecting = false;
        handleReconnect();
    }
};

// === RECONNECT LOGIC ===
const handleReconnect = () => {
    stopPeriodicRequests();
    mcuStatus = {
        type: "system",
        status: "disconnected",
        message: "MCU disconnected",
    };
    broadcast(mcuStatus);

    reconnectAttempts++;
    const delay = Math.min(
        config.RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1),
        MAX_RECONNECT_DELAY
    );
    console.log(`Reconnect attempt ${reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
        if (connectionMode === "tcp") connectToTcp();
        else connectToSerial();
    }, delay);
};

// Start default connection
connectToTcp();

// WebSocket calls
wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`WebSocket Client connected: ${clientIp}`);
    ws.send(JSON.stringify(mcuStatus));

    // Send current config to client so they know what's up
    ws.send(
        JSON.stringify({
            type: "config_state",
            mode: connectionMode,
            ...currentConfig,
        })
    );

    const onMessage = (message) => {
        try {
            const msgObj = JSON.parse(message);

            // === CONFIGURATION CHANGE ===
            if (msgObj.type === "config_change") {
                console.log("Received config change:", msgObj);

                if (msgObj.mode === "tcp") {
                    currentConfig.host = msgObj.host || currentConfig.host;
                    currentConfig.port =
                        parseInt(msgObj.port) || currentConfig.port;
                    connectToTcp();
                } else if (msgObj.mode === "serial") {
                    currentConfig.serialPort =
                        msgObj.serialPort || currentConfig.serialPort;
                    currentConfig.baudRate =
                        parseInt(msgObj.baudRate) || currentConfig.baudRate;
                    connectToSerial();
                }
                return;
            }
        } catch (e) {
            // Not JSON, treat as raw command
        }

        const messageStr = message.toString();

        let isConfig = false;
        try {
            const obj = JSON.parse(messageStr);
            if (obj.type === "config_change") isConfig = true;
        } catch (e) {}

        if (!isConfig) {
            // Send to MCU
            if (connectionMode === "tcp") {
                if (
                    mcuTcpClient &&
                    !mcuTcpClient.destroyed &&
                    mcuTcpClient.writable
                ) {
                    mcuTcpClient.write(messageStr);
                }
            } else {
                if (mcuSerialPort && mcuSerialPort.isOpen) {
                    mcuSerialPort.write(messageStr);
                }
            }
        }
    };

    const onError = (err) => {
        console.error(`WebSocket error from ${clientIp}: ${err.message}`);
    };

    const onClose = () => {
        console.log(`WebSocket Client disconnected: ${clientIp}`);
        ws.removeListener("message", onMessage);
        ws.removeListener("error", onError);
        ws.removeListener("close", onClose);
    };

    ws.on("message", onMessage);
    ws.on("error", onError);
    ws.on("close", onClose);
});

// Bonus statistics server
app.get(config.STAT_HTTP_PURPOSE, (req, res) => {
    res.json({
        status: "ok",
        wsPort: config.WS_PORT,
        mode: connectionMode,
        config: currentConfig,
        connectedClients: wss.clients.size,
        mcuConnectionStatus: mcuStatus.status,
        uptime: process.uptime(),
    });
});

// Endpoint to list serial ports
app.get("/serialports", async (req, res) => {
    try {
        const ports = await SerialPort.list();
        res.json(ports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(config.STAT_HTTP_PORT, () => {
    console.log(`HTTP server: http://localhost:${config.STAT_HTTP_PORT}`);
    console.log(
        `HTTP Statistics server: http://localhost:${config.STAT_HTTP_PORT}${config.STAT_HTTP_PURPOSE}`
    );
});

let isShuttingDown = false;

process.on("SIGINT", () => {
    if (isShuttingDown) return; // Prevent multiple shutdowns
    isShuttingDown = true;

    console.log("\nClosing Proxy...");

    // Force exit after 2 seconds if graceful shutdown fails
    const forceExit = setTimeout(() => {
        console.log("Forced shutdown");
        process.exit(0);
    }, 2000);

    // Close all WebSocket connections
    wss.clients.forEach((client) => {
        client.close();
    });

    // Close WebSocket server
    wss.close(() => {
        console.log("WebSocket server closed");
    });

    // Disconnect MCU
    disconnectMcu();

    // Clear the force exit timeout and exit normally
    clearTimeout(forceExit);
    console.log("Server shutdown complete");
    process.exit(0);
});
