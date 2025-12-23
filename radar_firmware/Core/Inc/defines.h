#ifndef INC_DEFINES_H_
#define INC_DEFINES_H_

#include "stm32h7xx.h"

#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define SYSTICK_LOAD (SystemCoreClock / 1000000U)
#define SYSTICK_DELAY_CALIB (SYSTICK_LOAD >> 1)

#define MAX_ADC12 65536.0f
#define MAX_ADC3 4096.0f
#define V_REF 3.3f
#define NUM_OF_CONVERSIONS 3
#define TX_BUFF_SIZE 64
#define CALIBRATION_BUFF_SIZE 50
#define V_REF_INT 1.216f
#define AVG_SLOPE 2.0f
#define V25 0.62f

#endif /* INC_DEFINES_H_ */
