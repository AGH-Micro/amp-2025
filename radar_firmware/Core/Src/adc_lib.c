#include "adc_lib.h"
#include "main.h"
#include "ntc_thermistor.h"
#include "stm32_temperature.h"

void PrepareADCRead(void) {
	if(HAL_ADCEx_Calibration_Start(&hadc1, ADC_CALIB_OFFSET, ADC_SINGLE_ENDED) != HAL_OK) {
		Error_Handler();
	}

	if(HAL_ADCEx_Calibration_Start(&hadc2, ADC_CALIB_OFFSET, ADC_SINGLE_ENDED) != HAL_OK) {
		Error_Handler();
	}

	if(HAL_ADCEx_Calibration_Start(&hadc3, ADC_CALIB_OFFSET, ADC_SINGLE_ENDED) != HAL_OK) {
		Error_Handler();
	}

	if(HAL_ADC_Start_DMA(&hadc3, (uint32_t*)adc3_data, NUM_OF_CONVERSIONS) != HAL_OK) {
		Error_Handler();
	}
}

void GetIQData(float32_t *I, float32_t *Q) {
	HAL_ADC_Start(&hadc1);
	HAL_ADC_Start(&hadc2);
	HAL_ADC_PollForConversion(&hadc1, HAL_MAX_DELAY);
	HAL_ADC_PollForConversion(&hadc2, HAL_MAX_DELAY);

	adc1_data = HAL_ADC_GetValue(&hadc1);
	adc2_data = HAL_ADC_GetValue(&hadc2);

	*I = (adc2_data * V_REF) / MAX_ADC12;
	*Q = (adc1_data * V_REF) / MAX_ADC12;
}

void GetTempData(float32_t *temp_ntc2, float32_t *internal_temp) {
	adc_ntc2 = adc3_data[0];
	adc_sen = adc3_data[1];
	adc_vref = adc3_data[2];

	*temp_ntc2 = NTC_GetTemperature(adc_ntc2);
	*internal_temp = GetSTM32Temperature(adc_vref, adc_sen);
}
