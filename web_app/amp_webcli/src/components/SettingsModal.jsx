import "./SettingsModal.css";

function SettingsModal({
    show,
    type,
    currentValue,
    inputValue,
    onInputChange,
    onConfirm,
    onClose,
}) {
    if (!show) return null;

    const getTitle = () => {
        if (type === "temp") return "Adjust temperature threshold";
        if (type === "fft") return "Adjust FFT threshold";
        if (type === "ip") return "Set WebSocket IP";
        return "Adjust threshold";
    };

    const getUnit = () => {
        if (type === "temp") return "°C";
        if (type === "fft") return "V";
        if (type === "ip") return "";
        return "";
    };

    const getPlaceholder = () => {
        if (type === "ip") return "Enter IP address (e.g., 192.168.1.100)";
        return `Enter new ${type} threshold`;
    };

    const title = getTitle();
    const unit = getUnit();
    const placeholder = getPlaceholder();

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onConfirm();
        }
    };

    return (
        <div className="settings-modal-overlay">
            <div className="settings-modal">
                <h3 className="settings-modal__title">{title}</h3>
                <p className="settings-modal__current">
                    Current: {currentValue}
                    {unit}
                </p>
                <input
                    type={type === "ip" ? "text" : "number"}
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholder()}
                    className="settings-modal__input"
                />
                <div className="settings-modal__buttons">
                    <button
                        onClick={onConfirm}
                        className="settings-modal__button settings-modal__button--confirm"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onClose}
                        className="settings-modal__button settings-modal__button--cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
