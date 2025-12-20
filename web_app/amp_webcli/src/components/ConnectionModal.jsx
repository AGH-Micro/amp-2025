import React, { useState, useEffect } from 'react';
import './ConnectionModal.css';

function ConnectionModal({ show, currentConfig, onConfirm, onClose }) {
    // Proxy Settings (Frontend -> Node.js)
    const [proxyHost, setProxyHost] = useState('');
    const [proxyPort, setProxyPort] = useState(8001);

    // MCU Settings (Node.js -> MCU)
    const [mode, setMode] = useState('tcp');
    const [host, setHost] = useState('localhost');
    const [port, setPort] = useState(5000);
    const [serialPort, setSerialPort] = useState('');
    const [baudRate, setBaudRate] = useState(115200);
    
    const [availablePorts, setAvailablePorts] = useState([]);
    const [loadingPorts, setLoadingPorts] = useState(false);

    // Initialize state
    useEffect(() => {
        if (show) {
            // Load Proxy Host from LocalStorage (or default to current hostname)
            setProxyHost(localStorage.getItem('ws_host') || window.location.hostname);
            setProxyPort(localStorage.getItem('ws_port') || 8001);

            // Load MCU Config from props (server state)
            if (currentConfig) {
                setMode(currentConfig.mode || 'tcp');
                setHost(currentConfig.host || 'localhost');
                setPort(currentConfig.port || 5000);
                setSerialPort(currentConfig.serialPort || '');
                setBaudRate(currentConfig.baudRate || 115200);
            }
        }
    }, [show, currentConfig]);

    // Fetch serial ports when switching to serial mode
    useEffect(() => {
        if (show && mode === 'serial') {
            setLoadingPorts(true);
            // Note: We use proxyHost here to fetch ports from the CORRECT server
            const targetHost = proxyHost || window.location.hostname;
            
            fetch(`http://${targetHost}:3001/serialports`)
                .then(res => res.json())
                .then(ports => {
                    setAvailablePorts(ports);
                    if (!serialPort && ports.length > 0) {
                        setSerialPort(ports[0].path);
                    }
                    setLoadingPorts(false);
                })
                .catch(err => {
                    console.error('Failed to fetch serial ports:', err);
                    setLoadingPorts(false);
                });
        }
    }, [show, mode, proxyHost]); // Re-fetch if proxyHost changes

    if (!show) return null;

    const handleConfirm = () => {
        onConfirm({
            proxyHost,
            proxyPort,
            mode,
            host,
            port: parseInt(port),
            serialPort,
            baudRate: parseInt(baudRate)
        });
    };

    return (
        <div className="connection-modal-overlay">
            <div className="connection-modal">
                <h3 className="connection-modal__title">System Configuration</h3>

                {/* SECTION 1: PROXY CONNECTION */}
                <div className="connection-modal__section" style={{borderBottom: '1px solid #eee', paddingBottom: '1rem'}}>
                    <h4 style={{margin: '0 0 1rem 0', color: '#007bff'}}>1. Proxy Server (WebSocket)</h4>
                    <label className="connection-modal__label">Proxy IP Address</label>
                    <input 
                        type="text" 
                        className="connection-modal__input"
                        value={proxyHost}
                        onChange={(e) => setProxyHost(e.target.value)}
                        placeholder="e.g., localhost or 192.168.x.x"
                    />
                    <label className="connection-modal__label">Proxy Port</label>
                    <input 
                        type="number" 
                        className="connection-modal__input"
                        value={proxyPort}
                        onChange={(e) => setProxyPort(e.target.value)}
                        placeholder="e.g., 8001"
                    />
                    <small style={{color: '#666', display: 'block', marginTop: '-0.5rem'}}>
                        Address and port of the PC running the Node.js server.
                    </small>
                </div>

                {/* SECTION 2: MCU CONNECTION */}
                <div className="connection-modal__section" style={{paddingTop: '1rem'}}>
                    <h4 style={{margin: '0 0 1rem 0', color: '#007bff'}}>2. MCU Connection (Target)</h4>
                    <label className="connection-modal__label">Connection Mode</label>
                    <div className="connection-modal__radio-group">
                        <label className="connection-modal__radio-label">
                            <input
                                type="radio"
                                value="tcp"
                                checked={mode === 'tcp'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            Ethernet (TCP)
                        </label>
                        <label className="connection-modal__radio-label">
                            <input
                                type="radio"
                                value="serial"
                                checked={mode === 'serial'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            UART (Serial)
                        </label>
                    </div>
                </div>

                {mode === 'tcp' ? (
                    <div className="connection-modal__section">
                        <label className="connection-modal__label">MCU IP Address</label>
                        <input
                            type="text"
                            className="connection-modal__input"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                            placeholder="e.g., 192.168.1.100"
                        />
                        <label className="connection-modal__label">MCU Port</label>
                        <input
                            type="number"
                            className="connection-modal__input"
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                            placeholder="e.g., 5000"
                        />
                    </div>
                ) : (
                    <div className="connection-modal__section">
                        <label className="connection-modal__label">COM Port (on Server)</label>
                        {loadingPorts ? (
                            <div className="connection-modal__input" style={{backgroundColor: '#f9f9f9'}}>Loading ports from server...</div>
                        ) : (
                            <select
                                className="connection-modal__select"
                                value={serialPort}
                                onChange={(e) => setSerialPort(e.target.value)}
                            >
                                {availablePorts.length === 0 && <option value="">No ports found on server</option>}
                                {availablePorts.map(p => (
                                    <option key={p.path} value={p.path}>
                                        {p.path} {p.manufacturer ? `(${p.manufacturer})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                        
                        <label className="connection-modal__label">Baud Rate</label>
                        <select
                            className="connection-modal__select"
                            value={baudRate}
                            onChange={(e) => setBaudRate(e.target.value)}
                        >
                            <option value="9600">9600</option>
                            <option value="19200">19200</option>
                            <option value="38400">38400</option>
                            <option value="57600">57600</option>
                            <option value="115200">115200</option>
                            <option value="230400">230400</option>
                            <option value="460800">460800</option>
                            <option value="921600">921600</option>
                        </select>
                    </div>
                )}

                <div className="connection-modal__buttons">
                    <button className="connection-modal__button connection-modal__button--cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="connection-modal__button connection-modal__button--confirm" onClick={handleConfirm}>
                        Save & Connect
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConnectionModal;
