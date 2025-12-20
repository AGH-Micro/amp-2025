#define _WINSOCK_DEPRECATED_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <winsock2.h>
#include <time.h>
#include <math.h> 

#pragma comment(lib, "ws2_32.lib")

#define PORT 5000
#define BUFFER_SIZE 32768 

// Function generating random temperature (20-30°C)
float generateRandomTemp() {
    return 20.0f + ((float)rand() / RAND_MAX) * 10.0f;
}

// Function generating random IQ value (Ellipse)
void generateIQData(char* buffer, int buffer_size) {
    static float t = 0.0f;
    float a = 40.0f; // Semi-major axis
    float b = 20.0f; // Semi-minor axis
    
    float i_val = a * cos(t);
    float q_val = b * sin(t);
    
    // Add some noise
    i_val += ((float)rand() / RAND_MAX) * 2.0f - 1.0f;
    q_val += ((float)rand() / RAND_MAX) * 2.0f - 1.0f;

    snprintf(buffer, buffer_size, "IQ:%.2f,%.2f\n", i_val, q_val);
    
    t += 0.1f;
    if (t > 6.28318f) t -= 6.28318f;
}

void generateSTFTData(char* buffer, int buffer_size) {
    int offset = snprintf(buffer, buffer_size, "STFT:");
    
    // Simulation parameters 
    int fundamental_idx = 100;      // Fundamental frequency (200Hz at 2Hz/bin)
    float peak_width = 2.0f;        // Peak width
    float base_amplitude = 80.0f;   // Base amplitude
    
    // Harmonic parameters
    int num_harmonics = 50;         // 50 harmonics (200Hz * 50 = 10000Hz)
    float harmonic_decay = 0.75f;   // Even slower decay
    
    // Amplitude wobble
    float current_peak_amp = base_amplitude + ((float)rand() / RAND_MAX) * 10.0f - 5.0f;

    // Amplitude array for each harmonic
    float harmonic_amps[60];
    for (int h = 0; h < num_harmonics && h < 60; h++) {
        // Each subsequent harmonic is weaker (decay^h)
        harmonic_amps[h] = current_peak_amp * pow(harmonic_decay, h);
        // Add small random fluctuation for each harmonic
        harmonic_amps[h] += ((float)rand() / RAND_MAX) * 2.0f - 1.0f;
        
        // Minimum threshold 
        if (harmonic_amps[h] < 0.3f) harmonic_amps[h] = 0.3f;
    }

    // Generate 1024 points 
    for (int i = 0; i < 1024; i++) {
        if (buffer_size - offset < 30) break;

        float freq = i * 2.0f;  
        
        // 1. Background noise (lower for better harmonic visibility)
        float amp = ((float)rand() / RAND_MAX) * 1.0f;

        // 2. Add all harmonics
        for (int h = 0; h < num_harmonics; h++) {
            int harmonic_idx = fundamental_idx * (h + 1);  // 1x, 2x, 3x, ..., 50x frequencies
            
            // Check if harmonic fits in range
            if (harmonic_idx < 1024) {
                float dist = (float)(i - harmonic_idx);
                // Peak width grows with frequency (natural blur)
                float adjusted_width = peak_width * (1.0f + h * 0.05f);
                // Add Gaussian distribution for this harmonic
                amp += harmonic_amps[h] * exp(-(dist * dist) / (2 * adjusted_width * adjusted_width));
            }
        }

        if (i > 0) {
            offset += snprintf(buffer + offset, buffer_size - offset, ",");
        }
        offset += snprintf(buffer + offset, buffer_size - offset, "%.1f,%.2f", freq, amp);
    }
    
    if (buffer_size - offset > 2) {
        snprintf(buffer + offset, buffer_size - offset, "\n");
    }
}

int main() {
    WSADATA wsa;
    SOCKET server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    int client_addr_len = sizeof(client_addr);
    char buffer[BUFFER_SIZE];
    int recv_len;
    
    srand((unsigned int)time(NULL));

    printf("Initialising Winsock...\n");
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        printf("Failed. Error Code : %d\n", WSAGetLastError());
        return 1;
    }
    
    if ((server_socket = socket(AF_INET, SOCK_STREAM, 0)) == INVALID_SOCKET) {
        printf("Could not create socket : %d\n", WSAGetLastError());
        return 1;
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) == SOCKET_ERROR) {
        printf("Bind failed with error code : %d\n", WSAGetLastError());
        return 1;
    }

    listen(server_socket, 3);
    printf("Waiting for incoming connections on port %d...\n", PORT);

    while (1) {
        if ((client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &client_addr_len)) == INVALID_SOCKET) {
            printf("accept failed\n");
            continue;
        }

        printf("Connection accepted\n");
        u_long mode = 1;
        ioctlsocket(client_socket, FIONBIO, &mode);

        int connected = 1;
        int counter = 0;

        while (connected) {
            // Clear buffer before use
            memset(buffer, 0, BUFFER_SIZE);

            // Send TEMP every ~1 second (20 * 50ms)
            if (counter % 20 == 0) {
                float temp1 = generateRandomTemp();
                float temp2 = generateRandomTemp();
                float temp3 = generateRandomTemp();
                snprintf(buffer, BUFFER_SIZE, "TEMP:%.2f,%.2f,%.2f\n", temp1, temp2, temp3);
            } 
            // Send STFT every ~3 seconds, offset by 1.5s
            else if (counter % 60 == 30) {
                generateSTFTData(buffer, BUFFER_SIZE);
            } 
            // Send IQ data all other times (approx 20Hz)
            else {
                generateIQData(buffer, BUFFER_SIZE);
            }

            int send_result = send(client_socket, buffer, (int)strlen(buffer), 0);
            
            if (send_result == SOCKET_ERROR) {
                int error = WSAGetLastError();
                if (error != WSAEWOULDBLOCK) {
                    printf("Send failed: %d\n", error);
                    connected = 0;
                }
            } else {
                // Shorten console logging to avoid STFT clutter
                if (strncmp(buffer, "STFT", 4) == 0) {
                    printf("Sent: STFT data package (%d bytes)\n", send_result);
                } else {
                    printf("Sent: %s", buffer);
                }
            }

            recv_len = recv(client_socket, buffer, BUFFER_SIZE, 0);
            if (recv_len == 0) {
                printf("Client disconnected.\n");
                connected = 0;
            } else if (recv_len > 0) {
                buffer[recv_len] = '\0';
                printf("Received: %s\n", buffer);
            }

            counter++;
            Sleep(50);
        }
        closesocket(client_socket);
    }

    closesocket(server_socket);
    WSACleanup();
    return 0;
}