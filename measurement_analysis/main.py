from data_processing import ReadAndParseData
import numpy as np
import matplotlib.pyplot as plt
from signal_analysis import scale_calc_phase
from signal_analysis import unwrap_window_stft

file_name = 'data.log'
fs = 47313
nperseg = 256

I_ellipse = []
Q_ellipse = []
I_data = []
Q_data = []
temp2_data = []
temp3_data = []
phase = []

I_ellipse, Q_ellipse, I_data, Q_data, temp2_data, temp3_data = ReadAndParseData(file_name)
#t_TEMP = np.arange(0, len(temp2_data) * 10, 10)
t_TEMP = np.arange(0, len(temp2_data) * 5, 5)

N = len(I_data)
for k in range(N):
    phi = scale_calc_phase(I_data[k], Q_data[k])
    phase.append(phi)

f, t, Zxx, phase_unwrapped = unwrap_window_stft(phase, fs, nperseg)
amplitude = np.abs(Zxx)


plt.figure(1)
plt.subplot(2, 2, 1)
plt.plot(I_ellipse, Q_ellipse, 'p')
plt.title('I-Q Plot')
plt.xlabel('I (In-phase)')
plt.ylabel('Q (Quadrature)')
plt.axis('equal')
plt.grid()

plt.subplot(2, 2, 2)
plt.plot(t_TEMP, temp2_data, color='green', label='NTC')
plt.plot(t_TEMP, temp3_data, color='blue', label='STM32')
plt.title('Temperature')
plt.xlabel('time [s]')
plt.ylabel('temperature [°C]')
plt.legend(loc='best', fontsize='medium', frameon=True)
plt.grid()

plt.subplot(2, 2, (3, 4))
plt.pcolormesh(t, f, amplitude)
plt.xlabel('Time [s]')
plt.ylabel('Frequency [Hz]')
#plt.xlim(left=0)
plt.title('Spectrogram - amplitude')
plt.colorbar(label='Amplitude')
plt.show()