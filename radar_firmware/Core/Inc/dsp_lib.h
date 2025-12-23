#ifndef INC_DSP_LIB_H_
#define INC_DSP_LIB_H_

#include "stm32h7xx.h"
#include "arm_math.h"
#include "defines.h"

extern float32_t mat_x[5];
extern float32_t mat_y[5];
extern float32_t coef[5][1];
extern float32_t dc[2];
extern float32_t phi;
extern float32_t scale[2];

void coeff(float32_t x[5], float32_t y[5], float32_t coef[5][1]);
void calc_dc_phi(float32_t coef[5][1], float32_t dc[2], float32_t *phi);
void calc_scal(float32_t x[5], float32_t y[5], float32_t *phi, float32_t dc[2], float32_t scale[2]);
void transform(float32_t *I, float32_t *Q, float32_t dc[2], float32_t *phi, float32_t scale[2]);

#endif /* INC_DSP_LIB_H_ */
