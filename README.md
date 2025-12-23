# amp-2025
## What is tested and working:
- LEDs: LED_TEMP, LED_CLP, LED_STM, LED_RGB
- Console output via JTAG
- ADC1: channel 2 and channel 5
- ADC2: channel 2 and channel 18
- ADC3: channel 2 and channel 3
- Communication via Ethernet (working after fixing short circuit and changing the code)
  - Short circuit between TXD0 and TXEN was removed
  - Pin configuration in the code was updated:
    - PG11 -> PB11
    - PG13 -> PB12
  - The clock configuration in `SystemClock_Config()` was updated
- UART

## What is not tested:
- SPI
- I2C

## To do:
- [x] DSP code implementation
- [ ] Web app using UART for communication
- [x] Debug Ethernet communication (if possible)