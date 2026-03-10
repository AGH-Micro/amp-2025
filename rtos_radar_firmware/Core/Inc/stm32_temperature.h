#ifndef INC_STM32_TEMPERATURE_H_
#define INC_STM32_TEMPERATURE_H_

#include "stm32h7xx.h"
#include "defines.h"

extern uint16_t adc_vref;
extern uint16_t adc_sen;

float GetSTM32Temperature(uint16_t adc_vref, uint16_t adc_sen);

#endif /* INC_STM32_TEMPERATURE_H_ */
