#ifndef ETHERNET_PROTOCOL_H
#define ETHERNET_PROTOCOL_H

#include <stdint.h>

#define MAX_SENSORS 4 // Max number of sensors

#pragma pack(1)

// Enum of states
typedef enum {
    STATUS_OK       = 0,
    STATUS_WARNING  = 1, // Over warning level
    STATUS_CRITICAL = 2, // Over critical level
    STATUS_SHUTDOWN = 3, // Over auto turn off level
    STATUS_ERROR    = 4  // Error
} SensorStatus_t;

// Struture for solo sensor
typedef struct {
    uint8_t sensor_id;          // Unique id
    int16_t temperature;        // Temperature in C multiplied by 100 (85.25C -> 8525)
    uint8_t status;             // States from enum of states SensorStatus
} SensorData_t;

// Ethernet packet
typedef struct {
    uint8_t protocol_version;   // version
    uint8_t num_sensors;        // number of sensors
    uint32_t timestamp_ms;      // Time from microcontroller start-up
    SensorData_t data[MAX_SENSORS]; // Sensor data array
} EthernetPacket_t;

#pragma pack()

#endif










































