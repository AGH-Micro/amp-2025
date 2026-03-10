# STM32H723ZG RTOS radar firmware
A high-performance Digital Signal Processing (DSP) firmware for STM32H723ZG, featuring real-time IQ signal correction, STFT (Short-Time Fourier Transform) and CFAR (Constant False Alarm Rate) target detection.

## Key Features
- **Real-time IQ Correction:** Ellipse fitting-based calibration for DC offset, phase shift and gain imbalance.
- **Advanced DSP Pipeline:** Uses ARM CMSIS-DSP for hardware-accelerated FFT (Radix-4) and Complex Magnitude calculations.
- **Multi-threaded RTOS Architecture:** Powered by FreeRTOS (CMSIS-RTOS v2) with prioritized tasks for Calibration, Signal Processing and Temperature Measurement.

## Tech Stack
- **Hardware:** STM32H723ZG
- **OS:** FreeRTOS
- **Library:** CMSIS-DSP
- **Communication:** UART (115200, 8N1)

## UART Communication Protocol
The system streams data via UART. Each message starts with a specific label.

| Label | Data Format | Description |
| :---: | :---: | :--- |
| **IQ:** | `IQ:I,Q` | Raw samples used for ellipse fitting during the initial 10s window. |
| **STFT:** | `STFT:freq,mag` | Fast streaming of magnitude bins above the CFAR threshold (`freq` in Hz). |
| **TEMP:** | `TEMP:ntc,internal` | NTC sensor and STM32 internal temperatures in °C. |