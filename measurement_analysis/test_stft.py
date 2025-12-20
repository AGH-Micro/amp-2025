import numpy as np
import matplotlib.pyplot as plt
from signal_analysis import scale_calc_phase
from signal_analysis import unwrap_window_stft


N=1024 # its also fs here
X=  np.zeros(N)
Y=  np.zeros(N)
P=  np.zeros(N)
f0=100
for k in range(N):
    theta=2.0*np.pi*k*f0/N
    X[k]=np.cos(theta)
    Y[k]=np.sin(theta)
    P[k]=scale_calc_phase(Y[k],X[k])

f,t,Zxx,phase_unwrapped=unwrap_window_stft(P,1024,256)

amplitude = np.abs(Zxx)

plt.plot(phase_unwrapped)


plt.figure()
plt.pcolormesh(t, f, amplitude)
plt.xlabel("Czas [s]")
plt.ylabel("Częstotliwość [Hz]")
plt.title("Spektrogram – amplituda")
plt.colorbar(label="Amplituda")
plt.show()