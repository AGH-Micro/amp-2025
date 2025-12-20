#ifndef TEMPERATURE_API_H
#define TEMPERATURE_API_H

#include <stdint.h>
#include <stdbool.h>

void Temperature_Init(void);

void Temperature_Update(void);

int Temperature_GetData(char* buffer, uint16_t buffer_size);

int Temperature_GetSensorData(uint8_t sensor_id, char* buffer, uint16_t buffer_size);

bool Temperature_GetPacket(void* packet);

bool Temperature_IsCritical(void);

bool Temperature_IsWarning(void);

#endif























