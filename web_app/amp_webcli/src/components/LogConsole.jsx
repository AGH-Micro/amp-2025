import React, { useEffect, useRef, useState } from "react";
import "./LogConsole.css";

function LogConsole({ logsRef, logsVersionRef }) {
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const contentRef = useRef(null);
    const lastVersionRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!logsRef.current || !logsVersionRef.current) return;

            // Check if logs version changed (increments with every new log)
            if (logsVersionRef.current !== lastVersionRef.current) {
                setUpdateTrigger((prev) => (prev + 1) % 1000);
                lastVersionRef.current = logsVersionRef.current;
            }
        }, 200); // Poll every 200ms

        return () => clearInterval(interval);
    }, [logsRef, logsVersionRef]);
    useEffect(() => {
        const contentElement = contentRef.current;
        if (contentElement) {
            // Check if user is near bottom before adding new content
            const isScrolledToBottom =
                contentElement.scrollHeight - contentElement.clientHeight <=
                contentElement.scrollTop + 100;

            // If user was at bottom, scroll to bottom after adding new log
            if (isScrolledToBottom) {
                contentElement.scrollTop = contentElement.scrollHeight;
            }
        }
    }, [updateTrigger]);

    return (
        <div className="log-console">
            <h4 className="log-console__title">Information & alerts:</h4>
            <div className="log-console__content" ref={contentRef}>
                {logsRef.current?.map((log, index) => (
                    <div key={`${index}-${log.slice(0, 20)}`}>{log}</div>
                ))}
            </div>
        </div>
    );
}

export default React.memo(LogConsole);
