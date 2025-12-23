#include "dsp_lib.h"
#include "main.h"

//coeff calculates coefficients of general equation of ellipse
void coeff(float32_t x[5], float32_t y[5], float32_t coef[5][1]) {
	arm_matrix_instance_f32 mat_M_instance;
	arm_matrix_instance_f32 mat_C_instance;
	arm_matrix_instance_f32 mat_coef_instance;
	arm_matrix_instance_f32 mat_MT_instance;
	arm_matrix_instance_f32 mat_M1_instance;
	arm_matrix_instance_f32 mat_M2_instance;

	static float32_t C[5][1];
	static float32_t M[5][5];
	static float32_t MT[5][5];
	static float32_t M1[5][5];
	static float32_t M2[5][5];

	for(int i = 0; i < 5; i++) {
		M[i][0] = x[i] * y[i];
		M[i][1] = y[i] * y[i];
		M[i][2] = x[i];
		M[i][3] = y[i];
		M[i][4] = 1.0f;
	}

	for(int i = 0; i < 5; i++) {
		C[i][0] = -x[i] * x[i];
	}

	arm_mat_init_f32(&mat_M_instance, 5, 5, &M[0][0]);
	arm_mat_init_f32(&mat_C_instance, 5, 1, &C[0][0]);
	arm_mat_init_f32(&mat_coef_instance, 5, 1, &coef[0][0]);
	arm_mat_init_f32(&mat_MT_instance, 5, 5, &MT[0][0]);
	arm_mat_init_f32(&mat_M1_instance, 5, 5, &M1[0][0]);
	arm_mat_init_f32(&mat_M2_instance, 5, 5, &M2[0][0]);

	arm_status status_trans;
	arm_status status_mult1;
	arm_status status_mult2;
	arm_status status_mult3;
	arm_status status_inv;

	status_trans = arm_mat_trans_f32(&mat_M_instance, &mat_MT_instance);
	status_mult1 = arm_mat_mult_f32(&mat_MT_instance, &mat_M_instance, &mat_M1_instance);//(Mt*M) in M1
	status_inv = arm_mat_inverse_f32(&mat_M1_instance, &mat_M2_instance); // (Mt*M)^-1 in M2
	status_mult2 = arm_mat_mult_f32(&mat_M2_instance, &mat_MT_instance, &mat_M1_instance); //((Mt*M)^-1 ) * Mt in M1
	status_mult3 = arm_mat_mult_f32(&mat_M1_instance, &mat_C_instance, &mat_coef_instance);//((Mt*M)^-1 ) * Mt * C in coef
}

//calc_dc_phi calculates the DC offstet and phi - angle offset of ellipse
void calc_dc_phi(float32_t coef[5][1], float32_t dc[2], float32_t *phi) {
	float32_t a = 1.0f;
	float32_t b = coef[0][0];
	float32_t c = coef[1][0];
	float32_t d = coef[2][0];
	float32_t e = coef[3][0];

	float32_t den = 0.25f * b * b - c;
	if(den == 0.0f) {
		den = 1E-5;
	}

	dc[0] = (0.5f * c * d - 0.25f * b * e) / den;
	dc[1] = (0.5f * e - 0.25f * b * d) / den;
//	*phi = asinf(b / (2 * sqrt(c)));
	*phi = 0.5f * atan2f(b, (a - c));
}

//calc_scal calculates the width and height of ellipse for scaling
void calc_scal(float32_t x[5], float32_t y[5], float32_t *phi, float32_t dc[2], float32_t scale[2]) {
	float32_t x_buff[5] = {};
	float32_t y_buff[5] = {};
	float32_t x_buff_n[5] = {};
	float32_t y_buff_n[5] = {};
	float32_t max_min_x[2] = {};
	float32_t max_min_y[2] = {};

	for(int i = 0; i < 5; i++) {
		x_buff[i]=x[i]-dc[0];
		y_buff[i]=y[i]-dc[1];
		x_buff_n[i]=x_buff[i]*cos(*phi)-y_buff[i]*sin(*phi);
		y_buff_n[i]=x_buff[i]*sin(*phi)+y_buff[i]*cos(*phi);

		max_min_x[0] = MAX(max_min_x[0], x_buff_n[i]);
		max_min_x[1] = MIN(max_min_x[1], x_buff_n[i]);
		max_min_y[0] = MAX(max_min_y[0], y_buff_n[i]);
		max_min_y[1] = MIN(max_min_y[1], y_buff_n[i]);
	}

	scale[0]=(fabsf(max_min_x[0])+fabsf(max_min_x[1]))/2;
	scale[1]=(fabsf(max_min_y[0])+fabsf(max_min_y[1]))/2;
}

//transform transforms every sample with calculated DC, phi and width/height of ellipse
void transform(float32_t *I, float32_t *Q, float32_t dc[2], float32_t *phi, float32_t scale[2]) {
	*I = *I - dc[0];
	*Q = *Q - dc[1];
	float32_t I_trans = (*I) * cos(*phi) - (*Q) * sin(*phi);
	float32_t Q_trans = (*I) * sin(*phi) + (*Q) * cos(*phi);

	*I = I_trans / scale[0];
	*Q = Q_trans / scale[1];
}
