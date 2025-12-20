#include "temperature_monitor.h"
#include "ntc_thermistor.h"
#include <string.h>

void NTC_Monitor_Init(NTC_Monitor_t *mon, uint8_t id, float warn, float crit, float shut) {
    memset(mon, 0, sizeof(NTC_Monitor_t));
    mon->sensor_id = id;
    mon->threshold_warning = warn;
    mon->threshold_critical = crit;
    mon->threshold_shutdown = shut;
    mon->status = STATUS_OK;
}

void NTC_Monitor_Update(NTC_Monitor_t *mon, uint16_t adc_value) {
    mon->adc_raw = adc_value;
    float temp_new = NTC_GetTemperature(adc_value);
    mon->temperature_instant = temp_new;

    // Initialize with first measurement
    if (!mon->is_initialized) {
        mon->temperature_avg = temp_new;
        mon->temp_min = temp_new;
        mon->temp_max = temp_new;
        mon->is_initialized = true;
    }

    // IIR filter
    const float alpha = 0.1f;
    mon->temperature_avg = mon->temperature_avg * (1.0f - alpha) + temp_new * alpha;

    // Update data
    if (mon->temperature_avg < mon->temp_min) mon->temp_min = mon->temperature_avg;
    if (mon->temperature_avg > mon->temp_max) mon->temp_max = mon->temperature_avg;

    // Check trigger levels with hysteresis = 5
    float temp_check = mon->temperature_avg;
    
    if (temp_check >= mon->threshold_shutdown) {
        mon->status = STATUS_SHUTDOWN;
    } else if (temp_check >= mon->threshold_critical) {
        mon->status = STATUS_CRITICAL;
    } else if (temp_check >= mon->threshold_warning) {
        mon->status = STATUS_WARNING;
    } else if (temp_check < mon->threshold_warning - 5.0f) { // hysteresis
        mon->status = STATUS_OK;
    }
}
