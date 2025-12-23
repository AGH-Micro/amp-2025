#ifndef NTC_THERMISTOR_H
#define NTC_THERMISTOR_H

#include "stm32h7xx_hal.h"

#define ADC_MAX_VALUE 4095.0f

// Structure for writing in lut
typedef struct {
    uint16_t adc_value;
    int16_t temp_x10;  // Temp multiplied by 10
} NTC_LUT_Entry_t;

float NTC_GetTemperature(uint16_t adc_value);

#endif
