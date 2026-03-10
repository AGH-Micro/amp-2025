#include "global_resources.h"

SemaphoreHandle_t xUARTSemaphore = NULL;
StreamBufferHandle_t xIQStreamBuffer = NULL;
osThreadId_t CalibrationTaskHandle = NULL;
osThreadId_t IQTaskHandle = NULL;
osThreadId_t STFTTaskHandle = NULL;
osThreadId_t TemperatureTaskHandle = NULL;
osTimerId_t timerCalibrationHandle = NULL;
osTimerId_t timerIQHandle = NULL;
osTimerId_t timerTemperatureHandle = NULL;

const osThreadAttr_t CalibrationTask_attr = {
	.name = "CalibrationTask",
	.stack_size = 10 * 1024,
	.priority = (osPriority_t) osPriorityAboveNormal2,
};

const osThreadAttr_t IQTask_attr = {
	.name = "IQTask",
	.stack_size = 15 * 1024,
	.priority = (osPriority_t) osPriorityAboveNormal1,
};

const osThreadAttr_t STFTTask_attr = {
	.name = "STFTTask",
	.stack_size = 20 * 1024,
	.priority = (osPriority_t) osPriorityAboveNormal,
};

const osThreadAttr_t TemperatureTask_attr = {
	.name = "TemperatureTask",
	.stack_size = 10 * 1024,
	.priority = (osPriority_t) osPriorityNormal,
};

arm_cfft_radix4_instance_f32 S_fft_radix;

char IQ_buffer_tx[TX_BUFF_SIZE] __attribute__((section(".ram_d2_data")));
char temp_buffer_tx[TX_BUFF_SIZE] __attribute__((section(".ram_d2_data")));
char ellipse_buffer_tx[TX_BUFF_SIZE] __attribute__((section(".ram_d2_data")));

float32_t I_calibration_buffer[CALIBRATION_BUFF_SIZE] __attribute__((section(".ram_d2_data")));
float32_t Q_calibration_buffer[CALIBRATION_BUFF_SIZE] __attribute__((section(".ram_d2_data")));

uint32_t adc1_data = 0;
uint32_t adc2_data = 0;
uint16_t adc3_data[NUM_OF_CONVERSIONS] __attribute__((section(".ram_d2_data")));

uint16_t adc_ntc2 = 0;
uint16_t adc_sen = 0;
uint16_t adc_vref = 0;

uint32_t last_iq_update = 0;
uint32_t last_temp_update = 0;

float32_t mat_x[5] __attribute__((section(".ram_d2_data")));
float32_t mat_y[5] __attribute__((section(".ram_d2_data")));
float32_t coef[5][1] __attribute__((section(".ram_d2_data")));
float32_t dc[2] __attribute__((section(".ram_d2_data")));
float32_t phi = 0.0f;
float32_t scale[2] __attribute__((section(".ram_d2_data")));

float32_t I = 0.0;
float32_t Q = 0.0;
float32_t hann_window_iq[2 * FFT_SIZE] __attribute__((section("ram_d2_data")));
float32_t temp_ntc2 = 0.0;
float32_t internal_temp = 0.0;
