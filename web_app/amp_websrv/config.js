module.exports = {
    // WebSocket Server (React)
    WS_PORT: 8001,

    // HTTP server for statistics (PORTS, ADDRESSES etc...)
    STAT_HTTP_PURPOSE: "/statistics",
    STAT_HTTP_PORT: 3001,

    // STM32 TCP
    MCU_HOST: "localhost", // MCU address IPv4
    MCU_PORT: 5000, // MCU port

    // STM32 UART (Default)
    SERIAL_PORT: "COM3",
    BAUD_RATE: 115200,

    RECONNECT_DELAY: 3000, // Delay for reconnect [ms]
};
