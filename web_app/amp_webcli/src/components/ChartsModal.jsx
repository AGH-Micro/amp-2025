import './ChartsModal.css'
import Charts from './Charts.jsx';

function ChartsModal ({
    show,
    type,
    onClose,
    dataRef
}) {

    if (!show) return null;

    const handleBackdropClick = (e) => {
        // Close only when clicking on backdrop
        if (e.target === e.currentTarget) {
            console.log(e);
            onClose();
        }
    };

    return (
        <div className='charts-modal__backdrop' onClick={handleBackdropClick}>
            <div className='charts-modal__container'>
                <button className='charts-modal__close-btn' onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <Charts
                    type={type}
                    isModal={true}
                    Act={() => {}} // Disable click on chart
                    dataRef={dataRef}
                />
            </div>
        </div>
    );
}

export default ChartsModal;
