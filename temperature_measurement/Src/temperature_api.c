#include "temperature_api.h"
#include "temperature_monitor.h"
#include "ntc_thermistor.h"
#include "ethernet_protocol.h"
#include "stm32h7xx_hal.h"
#include <stdio.h>
#include <string.h>

// External ADC handle (should be initialized by CubeMX)
extern ADC_HandleTypeDef hadc3;  // Using ADC3

// Temperature sensors (2 NTC thermistors)
static NTC_Monitor_t sensor_ntc1;  // First NTC thermistor
static NTC_Monitor_t sensor_ntc2;  // Second NTC thermistor

// Timing
static uint32_t last_update = 0;

// ADC3 Channel Configuration
#define ADC_CHANNEL_NTC1        ADC_CHANNEL_2
#define ADC_CHANNEL_NTC2        ADC_CHANNEL_3

static uint16_t Read_ADC_Channel(uint32_t channel);
static const char* get_status_string(SensorStatus_t status);

// Return status as str
static const char* get_status_string(SensorStatus_t status) {
    switch(status) {
        case STATUS_OK:       return "OK";
        case STATUS_WARNING:  return "WARN";
        case STATUS_CRITICAL: return "CRIT";
        case STATUS_SHUTDOWN: return "SHUT";
        case STATUS_ERROR:    return "ERR";
        default:              return "UNKN";
    }
}

//Initialize monitoring
void Temperature_Init(void) {
    // Initialize 2 NTC sensors with thresholds
    NTC_Monitor_Init(&sensor_ntc1, 1, 70.0f, 80.0f, 85.0f);
    NTC_Monitor_Init(&sensor_ntc2, 2, 70.0f, 80.0f, 85.0f);
    
    last_update = HAL_GetTick();
}


void Temperature_Update(void) {
    uint32_t current = HAL_GetTick();
    
    // Update every 1 second
    if (current - last_update >= 1000) {
        last_update = current;
        
        uint16_t adc_ntc1 = Read_ADC_Channel(ADC_CHANNEL_NTC1);
        uint16_t adc_ntc2 = Read_ADC_Channel(ADC_CHANNEL_NTC2);
        
        NTC_Monitor_Update(&sensor_ntc1, adc_ntc1);
        NTC_Monitor_Update(&sensor_ntc2, adc_ntc2);
    }
}


int Temperature_GetData(char* buffer, uint16_t buffer_size) {
    if (buffer == NULL || buffer_size == 0) {
        return 0;
    }
    
    // Format: TEMP:ID1,T1,S1|ID2,T2,S2
    return snprintf(buffer, buffer_size,
        "TEMP:%d,%.2f,%s|%d,%.2f,%s",
        sensor_ntc1.sensor_id,
        sensor_ntc1.temperature_avg,
        get_status_string(sensor_ntc1.status),
        sensor_ntc2.sensor_id,
        sensor_ntc2.temperature_avg,
        get_status_string(sensor_ntc2.status)
    );
}


int Temperature_GetSensorData(uint8_t sensor_id, char* buffer, uint16_t buffer_size) {
    if (buffer == NULL || buffer_size == 0) {
        return 0;
    }
    
    NTC_Monitor_t* sensor = NULL;
    
    // Select sensor (only 1 or 2)
    switch(sensor_id) {
        case 1: sensor = &sensor_ntc1; break;
        case 2: sensor = &sensor_ntc2; break;
        default: return 0;  // Invalid sensor ID
    }
    
    // Format: SENS:ID,Instant,Avg,Min,Max,ADC,Status
    return snprintf(buffer, buffer_size,
        "SENS:%d,%.2f,%.2f,%.2f,%.2f,%d,%s",
        sensor->sensor_id,
        sensor->temperature_instant,
        sensor->temperature_avg,
        sensor->temp_min,
        sensor->temp_max,
        sensor->adc_raw,
        get_status_string(sensor->status)
    );
}


bool Temperature_GetPacket(void* packet) {
    if (packet == NULL) {
        return false;
    }
    
    EthernetPacket_t* eth_packet = (EthernetPacket_t*)packet;
    
    eth_packet->protocol_version = 1;
    eth_packet->num_sensors = 2;  // Only 2 sensors now
    eth_packet->timestamp_ms = HAL_GetTick();
    
    // Sensor 1: NTC1
    eth_packet->data[0].sensor_id = sensor_ntc1.sensor_id;
    eth_packet->data[0].status = (uint8_t)sensor_ntc1.status;
    eth_packet->data[0].temperature = (int16_t)(sensor_ntc1.temperature_avg * 100.0f);
    
    // Sensor 2: NTC2
    eth_packet->data[1].sensor_id = sensor_ntc2.sensor_id;
    eth_packet->data[1].status = (uint8_t)sensor_ntc2.status;
    eth_packet->data[1].temperature = (int16_t)(sensor_ntc2.temperature_avg * 100.0f);
    
    return true;
}

bool Temperature_IsCritical(void) {
    return (sensor_ntc1.status >= STATUS_CRITICAL) ||
           (sensor_ntc2.status >= STATUS_CRITICAL);
}

bool Temperature_IsWarning(void) {
    return (sensor_ntc1.status >= STATUS_WARNING) ||
           (sensor_ntc2.status >= STATUS_WARNING);
}


static uint16_t Read_ADC_Channel(uint32_t channel) {
    ADC_ChannelConfTypeDef sConfig = {0};
    
    sConfig.Channel = channel;
    sConfig.Rank = ADC_REGULAR_RANK_1;
    sConfig.SamplingTime = ADC_SAMPLETIME_810CYCLES_5;
    sConfig.SingleDiff = ADC_SINGLE_ENDED;
    sConfig.OffsetNumber = ADC_OFFSET_NONE;
    sConfig.Offset = 0;
    
    if (HAL_ADC_ConfigChannel(&hadc3, &sConfig) != HAL_OK) {
        return 0;  // Error
    }

    HAL_ADC_Start(&hadc3);
    
    if (HAL_ADC_PollForConversion(&hadc3, 100) != HAL_OK) {
        HAL_ADC_Stop(&hadc3);
        return 0;  // Error
    }
    
    uint16_t adc_value = HAL_ADC_GetValue(&hadc3);
    HAL_ADC_Stop(&hadc3);
    
    return adc_value;
}