#include "temperature_task.h"
#include <stdio.h>
#include "adc_lib.h"

void TimerTemperature_Callback(void *argument) {
	xTaskNotifyGive(TemperatureTaskHandle);
}

void vTemperatureTask(void *argument) {
	float32_t local_temp_ntc2 = 0.0;
	float32_t local_internal_temp = 0.0;
	char msg[32];

	while(1) {
		ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
		GetTempData(&local_temp_ntc2, &local_internal_temp);
		if(xSemaphoreTake(xUARTSemaphore, portMAX_DELAY) == pdTRUE) {
			temp_ntc2 = local_temp_ntc2;
			internal_temp = local_internal_temp;
			sprintf(msg, "TEMP:%.2f,%.2f\r\n", temp_ntc2, internal_temp);
			HAL_UART_Transmit(&huart5, (uint8_t*)msg, strlen(msg), HAL_MAX_DELAY);
			xSemaphoreGive(xUARTSemaphore);
		}
	}
	vTaskDelete(NULL);
}
