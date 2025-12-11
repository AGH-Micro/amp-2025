#ifndef TEMPERATURE_MONITOR_H
#define TEMPERATURE_MONITOR_H

#include "stm32h7xx_hal.h"
#include <stdbool.h>
#include "ethernet_protocol.h"

typedef struct {
    uint8_t sensor_id;
    
    // Raw data
    uint16_t adc_raw;
    float temperature_instant; // Last measurement temperature

    float temperature_avg;     // Stable temperature
    float temp_min;
    float temp_max;
    
    // Warning trigger levels
    float threshold_warning;
    float threshold_critical;
    float threshold_shutdown;
    
    // Current state
    SensorStatus_t status;
    bool is_initialized;

} NTC_Monitor_t;


void NTC_Monitor_Init(NTC_Monitor_t *mon, uint8_t id, float warn, float crit, float shut);

void NTC_Monitor_Update(NTC_Monitor_t *mon, uint16_t adc_value);

#endif
