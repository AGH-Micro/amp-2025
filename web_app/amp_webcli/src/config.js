const config = {
    // WEBSOCKET URL
    get PROXY_URL() {
        const savedHost =
            localStorage.getItem("ws_host") || window.location.hostname;
        const savedPort = localStorage.getItem("ws_port") || "8001";
        return `ws://${savedHost}:${savedPort}`;
    },

    // DELAY FOR RECONNECTING (check App.jsx)
    RECONNECT_DELAY: 3000,

    // Prefixes - agreements
    IQ_PREFIX: "IQ",
    TEMP_PREFIX: "TEMP",
    STFT_PREFIX: "STFT",

    // Charts settings
    MAX_DATA_POINTS: 100,
    MAX_STFT_FRAMES: 50,
};

export default config;
