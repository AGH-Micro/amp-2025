#include "dsp_task.h"
#include <stdio.h>
#include <adc_lib.h>
#include <dsp_lib.h>

void TimerIQ_Callback(void *argument) {
	xTaskNotifyGive(IQTaskHandle);
}

void vIQTask(void *argument) {
	float32_t samples[2]; //[I, Q]
	while(1) {
		ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
		GetIQData(&samples[0], &samples[1]);
		transform(&samples[0], &samples[1], dc, &phi, scale);
		xStreamBufferSend(xIQStreamBuffer, samples, sizeof(samples), pdMS_TO_TICKS(10));
	}
	vTaskDelete(NULL);
}

void vSTFTTask(void *argument) {
    static float32_t time_buffer[2 * FFT_SIZE]; // [I,Q,I,Q...]
    static float32_t work_buffer[2 * FFT_SIZE];
    float32_t magnitude[FFT_SIZE];

    char uart_buff[1024];

    arm_cfft_radix4_init_f32(&S_fft_radix, FFT_SIZE, 0, 1);

    const size_t bytes_to_read = FFT_SIZE * sizeof(float32_t);

    while(1) {
        size_t total_received = 0;
        uint8_t *rx_ptr = (uint8_t*)&time_buffer[FFT_SIZE];

        while(total_received < bytes_to_read) {
            size_t bytes = xStreamBufferReceive(xIQStreamBuffer,
                                                rx_ptr + total_received,
                                                bytes_to_read - total_received,
                                                portMAX_DELAY);
            total_received += bytes;
        }

        memcpy(work_buffer, time_buffer, (2 * FFT_SIZE) * sizeof(float32_t));

        arm_mult_f32(work_buffer, hann_window_iq, work_buffer, (2 * FFT_SIZE));
        arm_cfft_radix4_f32(&S_fft_radix, work_buffer);
        arm_cmplx_mag_f32(work_buffer, magnitude, FFT_SIZE);

        // CFAR (signal detection)
        // CFAR (signal detection)
        if(xSemaphoreTake(xUARTSemaphore, 10) == pdTRUE) {

            int offset = 0;
            offset += snprintf(uart_buff + offset, sizeof(uart_buff) - offset, "STFT:");

            for(int i = TRAINING_CELLS + GUARD_CELLS; i < (FFT_SIZE / 2); i++) {

                float32_t noise_level = 0.0f;
                int count = 0;

                for(int j = i - (TRAINING_CELLS + GUARD_CELLS); j <= i + (TRAINING_CELLS + GUARD_CELLS); j++) {
                    if(j < i - GUARD_CELLS || j > i + GUARD_CELLS) {
                        noise_level += magnitude[j];
                        count++;
                    }
                }

                noise_level /= (float32_t)count;

                if(magnitude[i] > (noise_level * THRESHOLD_FACTOR)) {

                    float32_t freq = (float32_t)i * FS / (float32_t)FFT_SIZE;

                    offset += snprintf(uart_buff + offset,
                                       sizeof(uart_buff) - offset,
                                       "%.1f,%.4f,",
                                       freq,
                                       magnitude[i]);

                    if(offset >= sizeof(uart_buff) - 32) break; // zabezpieczenie przed overflow
                }
            }

            offset += snprintf(uart_buff + offset, sizeof(uart_buff) - offset, "\r\n");

            HAL_UART_Transmit(&huart5, (uint8_t*)uart_buff, offset, 10);

            xSemaphoreGive(xUARTSemaphore);
        }

        // overlap (50%)
        memmove(&time_buffer[0], &time_buffer[FFT_SIZE], bytes_to_read);
    }
}