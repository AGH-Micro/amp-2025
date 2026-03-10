#include "stm32_temperature.h"
#include "main.h"

float GetSTM32Temperature(uint16_t adc_vref, uint16_t adc_sen) {
	float v_intref = (MAX_ADC3 * V_REF_INT) / adc_vref;
	float v_sen = (adc_sen * v_intref) / MAX_ADC3;
	float temp = ((v_sen - V25) * 1000 / AVG_SLOPE) + 25;
	return temp;
}
