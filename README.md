# amp-2025
## What is tested and working:
- LEDs: LED_TEMP, LED_CLP, LED_STM, LED_RGB
- Console output via JTAG
- ADC1: channel 2 and channel 5
- ADC2: channel 2 and channel 18
- ADC3: channel 2 and channel 3

## What is tested but not working:
- Communication via Ethernet
  #### Actions taken so far:
  - removed short circuit between TXD0 and TXEN
  - changed pin configuration in the code
    - PG11 -> PB11
    - PG13 -> PB12

## What is not tested:
- SPI
- I2C

## To do:
- [ ] DSP code implementation
- [ ] Web app using UART for communication
- [ ] Debug Ethernet communication (if possible)