from data_processing import ReadAndParseData
import numpy as np
import matplotlib.pyplot as plt

file_name = 'data.log'
I_ellipse = []
Q_ellipse = []
I_data = []
Q_data = []
temp1_data = []
temp2_data = []
temp3_data = []

I_ellipse, Q_ellipse, I_data, Q_data, temp1_data, temp2_data, temp3_data = ReadAndParseData(file_name)
t_TEMP = np.arange(0, len(temp1_data) * 10, 10)

plt.figure(1)
plt.plot(I_ellipse, Q_ellipse, 'p')
plt.title('I-Q Plot')
plt.xlabel('I (In-phase)')
plt.ylabel('Q (Quadrature)')
plt.axis('equal')
plt.grid()
plt.show()

plt.figure(2)
plt.plot(t_TEMP, temp1_data, color='green', label='NTC1')
plt.plot(t_TEMP, temp2_data, color='orange', label='NTC2')
plt.plot(t_TEMP, temp3_data, color='blue', label='STM32')
plt.title('Temperature')
plt.xlabel('time [s]')
plt.ylabel('temperature [°C]')
plt.legend(loc='best', fontsize='medium', frameon=True)
plt.grid()
plt.show()