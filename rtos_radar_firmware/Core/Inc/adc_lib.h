#ifndef INC_ADC_LIB_H_
#define INC_ADC_LIB_H_

#include "stm32h7xx.h"
#include "defines.h"
#include "arm_math.h"

extern ADC_HandleTypeDef hadc1;
extern ADC_HandleTypeDef hadc2;
extern ADC_HandleTypeDef hadc3;

extern uint32_t adc1_data;
extern uint32_t adc2_data;
extern uint16_t adc3_data[NUM_OF_CONVERSIONS];

extern uint16_t adc_ntc2;
extern uint16_t adc_sen;
extern uint16_t adc_vref;

extern float32_t I;
extern float32_t Q;

extern float32_t temp_ntc2;
extern float32_t internal_temp;

void PrepareADCRead(void);
void GetIQData(float32_t *I, float32_t *Q);
void GetTempData(float32_t *temp_ntc2, float32_t *internal_temp);

#endif /* INC_ADC_LIB_H_ */
