#ifndef INC_GLOBAL_RESOURCES_H_
#define INC_GLOBAL_RESOURCES_H_

#include "FreeRTOS.h"
#include "cmsis_os2.h"
#include "semphr.h"
#include "stream_buffer.h"

#include "arm_math.h"
#include "defines.h"

extern UART_HandleTypeDef huart5;

extern SemaphoreHandle_t xUARTSemaphore;
extern StreamBufferHandle_t xIQStreamBuffer;
extern osThreadId_t CalibrationTaskHandle;
extern osThreadId_t IQTaskHandle;
extern osThreadId_t STFTTaskHandle;
extern osThreadId_t TemperatureTaskHandle;
extern osTimerId_t timerCalibrationHandle;
extern osTimerId_t timerIQHandle;
extern osTimerId_t timerTemperatureHandle;

extern const osThreadAttr_t CalibrationTask_attr;
extern const osThreadAttr_t IQTask_attr;
extern const osThreadAttr_t STFTTask_attr;
extern const osThreadAttr_t TemperatureTask_attr;

extern arm_cfft_radix4_instance_f32 S_fft_radix;

extern char IQ_buffer_tx[TX_BUFF_SIZE];
extern char temp_buffer_tx[TX_BUFF_SIZE];
extern char ellipse_buffer_tx[TX_BUFF_SIZE];

extern float32_t I_calibration_buffer[CALIBRATION_BUFF_SIZE];
extern float32_t Q_calibration_buffer[CALIBRATION_BUFF_SIZE];

extern uint32_t adc1_data;
extern uint32_t adc2_data;
extern uint16_t adc3_data[NUM_OF_CONVERSIONS]; //[0] - adc_ntc2, [1] - adc_sen, [2] - adc_vref

extern uint16_t adc_ntc2;
extern uint16_t adc_sen;
extern uint16_t adc_vref;

extern uint32_t last_iq_update;
extern uint32_t last_temp_update;

extern float32_t mat_x[5];
extern float32_t mat_y[5];
extern float32_t coef[5][1];
extern float32_t dc[2];
extern float32_t phi;
extern float32_t scale[2];

extern float32_t I;
extern float32_t Q;
extern float32_t hann_window_iq[2 * FFT_SIZE];
extern float32_t temp_ntc2;
extern float32_t internal_temp;

#endif /* INC_GLOBAL_RESOURCES_H_ */
