import React, { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import "./Charts.css";

function Charts({ type, isModal, Act, dataRef }) {
    const [plotData, setPlotData] = useState([]);
    const [layout, setLayout] = useState({});
    const [revision, setRevision] = useState(0);
    const lastUpdateRef = useRef(0);
    const [stftViewMode, setStftViewMode] = useState("heatmap");
    const revisionCounterRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            // Limit updates to 10fps (100ms)
            if (now - lastUpdateRef.current < 100) return;

            if (!dataRef.current) return;

            let newData = [];
            let newLayout = {};
            let shouldUpdate = false;

            if (type === "temp") {
                const queue1 = dataRef.current.temp1;
                const queue2 = dataRef.current.temp2;
                const queue3 = dataRef.current.temp3;

                if (queue1 && queue1.length > 0) {
                    newData = [
                        {
                            type: "scattergl",
                            mode: "lines",
                            x: queue1.map((item) => item.timestamp),
                            y: queue1.map((item) => item.value),
                            line: {
                                color: "rgb(34, 139, 34)",
                                width: 2,
                                shape: "spline",
                            },
                            name: "Temp 1",
                        },
                        {
                            type: "scattergl",
                            mode: "lines",
                            x: queue2.map((item) => item.timestamp),
                            y: queue2.map((item) => item.value),
                            line: {
                                color: "rgb(255, 140, 0)",
                                width: 2,
                                shape: "spline",
                            },
                            name: "Temp 2",
                        },
                        {
                            type: "scattergl",
                            mode: "lines",
                            x: queue3.map((item) => item.timestamp),
                            y: queue3.map((item) => item.value),
                            line: {
                                color: "rgb(220, 20, 60)",
                                width: 2,
                                shape: "spline",
                            },
                            name: "Temp 3",
                        },
                    ];
                    newLayout = {
                        title: {
                            text: "Temperature Monitor",
                            font: { size: 14 },
                        },
                        autosize: true,
                        margin: { l: 60, r: 30, t: 60, b: 60 },
                        xaxis: {
                            title: {
                                text: "Time",
                                font: { size: 12 },
                                standoff: 10,
                            },
                            gridcolor: "rgba(0, 0, 0, 0.05)",
                            showgrid: true,
                            tickformat: "%H:%M:%S",
                            nticks: 6,
                        },
                        yaxis: {
                            title: {
                                text: "Temperature (°C)",
                                font: { size: 12 },
                                standoff: 10,
                            },
                            gridcolor: "rgba(0, 0, 0, 0.05)",
                            showgrid: true,
                            rangemode: "tozero",
                        },
                        paper_bgcolor: "white",
                        plot_bgcolor: "#fafafa",
                        font: {
                            family: "Montserrat, Arial, sans-serif",
                            size: 11,
                        },
                        showlegend: true,
                        legend: {
                            x: 1,
                            y: 0,
                            xanchor: "right",
                            yanchor: "bottom",
                            bgcolor: "rgba(255, 255, 255, 0.8)",
                        },
                        uirevision: "temp",
                    };
                    shouldUpdate = true;
                }
            } else if (type === "iq") {
                const queue = dataRef.current.iq;
                if (queue && queue.length > 0) {
                    newData = [
                        {
                            type: "scattergl",
                            mode: "lines+markers",
                            x: queue.map((item) => item.i),
                            y: queue.map((item) => item.q),
                            marker: {
                                size: 6,
                                color: "rgb(30, 144, 255)",
                                opacity: 0.8,
                            },
                            line: {
                                color: "rgba(30, 144, 255, 0.5)",
                                width: 1,
                            },
                            name: "IQ Data",
                        },
                    ];
                    newLayout = {
                        title: { text: "IQ Constellation", font: { size: 14 } },
                        autosize: true,
                        margin: { l: 60, r: 30, t: 60, b: 60 },
                        xaxis: {
                            title: {
                                text: "I",
                                font: { size: 12 },
                                standoff: 10,
                            },
                            gridcolor: "rgba(0, 0, 0, 0.1)",
                            showgrid: true,
                            zeroline: true,
                        },
                        yaxis: {
                            title: {
                                text: "Q",
                                font: { size: 12 },
                                standoff: 10,
                            },
                            gridcolor: "rgba(0, 0, 0, 0.1)",
                            showgrid: true,
                            zeroline: true,
                            scaleanchor: "x",
                            scaleratio: 1,
                        },
                        paper_bgcolor: "white",
                        plot_bgcolor: "white",
                        font: {
                            family: "Montserrat, Arial, sans-serif",
                            size: 11,
                        },
                        legend: {
                            x: 0,
                            y: 1,
                            bgcolor: "rgba(255, 255, 255, 0.8)",
                        },
                        uirevision: "iq",
                    };
                    shouldUpdate = true;
                }
            } else if (type === "stft") {
                const queue = dataRef.current.stft;
                if (queue && queue.length > 0) {
                    if (stftViewMode === "heatmap") {
                        newData = [
                            {
                                type: "heatmap",
                                x: queue[0]?.frequencies || [],
                                y: queue.map((item) => item.time),
                                z: queue.map((item) => item.amplitudes),
                                colorscale: [
                                    [0, "rgb(0,0,131)"],
                                    [0.25, "rgb(0,60,170)"],
                                    [0.5, "rgb(5,255,255)"],
                                    [0.75, "rgb(255,255,0)"],
                                    [1, "rgb(255,0,0)"],
                                ],
                                colorbar: {
                                    title: "Amplitude (V)",
                                    titleside: "right",
                                    nticks: 6,
                                    tickmode: "linear",
                                    tick0: 0,
                                    dtick: 20,
                                    len: 0.8,
                                    thickness: 20,
                                    x: 1.02,
                                    tickfont: { size: 11 },
                                },
                                hoverongaps: false,
                            },
                        ];
                        newLayout = {
                            title: {
                                text: "STFT Spectrogram",
                                font: { size: 14 },
                            },
                            autosize: true,
                            margin: { l: 80, r: 80, t: 60, b: 70 },
                            xaxis: {
                                title: {
                                    text: "Frequency (Hz)",
                                    font: { size: 12 },
                                    standoff: 10,
                                },
                                gridcolor: "rgba(255, 255, 255, 0.3)",
                                showgrid: true,
                            },
                            yaxis: {
                                title: {
                                    text: "Time",
                                    font: { size: 12 },
                                    standoff: 10,
                                },
                                gridcolor: "rgba(255, 255, 255, 0.3)",
                                showgrid: true,
                                autorange: "reversed",
                                tickformat: "%H:%M:%S",
                            },
                            paper_bgcolor: "white",
                            font: {
                                family: "Montserrat, Arial, sans-serif",
                                size: 11,
                            },
                            uirevision: "stft-heatmap",
                        };
                    } else if (stftViewMode === "line") {
                        const lastFrame = queue[queue.length - 1];
                        newData = [
                            {
                                type: "scattergl",
                                mode: "lines",
                                x: lastFrame.frequencies,
                                y: lastFrame.amplitudes,
                                line: {
                                    color: "rgb(30, 144, 255)",
                                    width: 2,
                                },
                                fill: "tozeroy",
                                fillcolor: "rgba(30, 144, 255, 0.1)",
                                name: "Spectrum",
                            },
                        ];
                        newLayout = {
                            title: {
                                text: "Spectrum (Last STFT Frame)",
                                font: { size: 14 },
                            },
                            autosize: true,
                            margin: { l: 60, r: 30, t: 60, b: 60 },
                            xaxis: {
                                title: {
                                    text: "Frequency (Hz)",
                                    font: { size: 12 },
                                    standoff: 10,
                                },
                                gridcolor: "rgba(0, 0, 0, 0.05)",
                                showgrid: true,
                            },
                            yaxis: {
                                title: {
                                    text: "Amplitude (V)",
                                    font: { size: 12 },
                                    standoff: 10,
                                },
                                gridcolor: "rgba(0, 0, 0, 0.05)",
                                showgrid: true,
                                rangemode: "tozero",
                            },
                            paper_bgcolor: "white",
                            plot_bgcolor: "#fafafa",
                            font: {
                                family: "Montserrat, Arial, sans-serif",
                                size: 11,
                            },
                            uirevision: "stft-line",
                        };
                    }
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) {
                setPlotData(newData);
                setLayout(newLayout);
                revisionCounterRef.current =
                    (revisionCounterRef.current + 1) % 10000;
                setRevision(revisionCounterRef.current);
                lastUpdateRef.current = now;
            }
        }, 100); // Poll every 100ms

        return () => clearInterval(interval);
    }, [type, dataRef, stftViewMode]);

    const handleClick = (e) => {
        // Ignore clicks on legend or modebar
        if (e.target.closest(".legend") || e.target.closest(".modebar")) return;

        if (Act && typeof Act === "function") {
            Act();
        }
    };

    return (
        <div
            className={`${isModal ? "chart-panel__modal" : "chart-panel"} ${
                type === "stft" ? "stft" : ""
            }`}
            onClick={handleClick}
        >
            {type === "stft" && (
                <button
                    className="stft-toggle-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setStftViewMode((prev) =>
                            prev === "heatmap" ? "line" : "heatmap"
                        );
                    }}
                >
                    {stftViewMode === "heatmap"
                        ? "Show Spectrum"
                        : "Show Spectrogram"}
                </button>
            )}
            <div
                className={`${
                    isModal ? "chart-wrapper__modal" : "chart-wrapper"
                }`}
            >
                <Plot
                    data={plotData}
                    layout={layout}
                    revision={revision}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    config={{
                        responsive: true,
                        displayModeBar: "hover",
                        displaylogo: false,
                    }}
                />
            </div>
        </div>
    );
}

export default React.memo(Charts);
