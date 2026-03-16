#include "calibration_task.h"
#include <stdio.h>
#include "adc_lib.h"
#include "dsp_lib.h"

void TimerCalibration_Callback(void *argument) {
	xTaskNotifyGive(CalibrationTaskHandle);
}

void vCalibrationTask(void *argument) {
	ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
	osTimerStop(timerCalibrationHandle);

	PrepareADCRead();

	for(int i = 0; i < CALIBRATION_BUFF_SIZE; i++) {
		GetIQData(&I, &Q);
		I_calibration_buffer[i] = I;
		Q_calibration_buffer[i] = Q;
		osDelay(pdMS_TO_TICKS(10));
	}

	uint8_t index = 0;
	for(int i = 0; i < CALIBRATION_BUFF_SIZE; i++) {
		if(i % 10 == 0) {
			mat_x[index] = I_calibration_buffer[i];
			mat_y[index] = Q_calibration_buffer[i];
			index++;
		}
	}

	for(int i = 0; i < 5; i++) {
		sprintf(ellipse_buffer_tx, "IQ:%.4f,%.4f\r\n", mat_x[i], mat_y[i]);
		SCB_CleanDCache_by_Addr((uint32_t*)ellipse_buffer_tx, sizeof(ellipse_buffer_tx));
		HAL_UART_Transmit(&huart5, (uint8_t*)ellipse_buffer_tx, strlen(ellipse_buffer_tx), HAL_MAX_DELAY);
	}

	coeff(mat_x, mat_y, coef);
	calc_dc_phi(coef, dc, &phi);
	calc_scal(mat_x, mat_y, &phi, dc, scale);

	osTimerStart(timerIQHandle, pdMS_TO_TICKS(1000));
	osTimerStart(timerTemperatureHandle, pdMS_TO_TICKS(10000));
	vTaskDelete(NULL);
}
