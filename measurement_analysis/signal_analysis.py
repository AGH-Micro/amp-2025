import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import stft

def scale_calc_phase(I, Q):
    phi = np.arctan2(Q, I)
    phi_scale = phi
    return phi_scale

def unwrap_window_stft(array, fs, nperseg):
    #stft_seg 256, 512, 1024
    #fs - sampling frequency
    array = np.unwrap(array) #phase unwrapping so it's continous
    f, t, Zxx = stft(array, fs=fs, window='hann', nperseg=nperseg)
    return f, t, Zxx, array