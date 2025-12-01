#pragma once

#ifndef TESTH7_LIB_H
#define TESTH7_LIB_H

#include <stdint.h>
#include "stm32h7xx_hal.h"

/* --------------------------------------- READ README.MD BEFORE USING !!! ----------------------------------------------- */

extern const double vRef;
extern const int delayTime;

extern volatile uint8_t  adc1_Ready;
extern volatile uint8_t  adc2_Ready;
extern volatile uint8_t  adc3_Ready;


void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc);
// void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *hadc);

void printUART(UART_HandleTypeDef* huart, char* str);

void testConsolePrint(int option);
void testBlinkDiode(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin, int option);
void testADC(ADC_HandleTypeDef* hadc, double vRef);

void VCOM_Init(void);

#endif /* TESTH7_LIB_H */
