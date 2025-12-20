################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
C:/Users/Kinga1606/Desktop/maybethis_ethernet/LwIP_TCP_Echo_Server/Drivers/BSP/STM32H7xx_Nucleo/stm32h7xx_nucleo.c 

OBJS += \
./Drivers/BSP/STM32H743ZI-Nucleo/stm32h7xx_nucleo.o 

C_DEPS += \
./Drivers/BSP/STM32H743ZI-Nucleo/stm32h7xx_nucleo.d 


# Each subdirectory must supply rules for building sources it contributes
Drivers/BSP/STM32H743ZI-Nucleo/stm32h7xx_nucleo.o: C:/Users/Kinga1606/Desktop/maybethis_ethernet/LwIP_TCP_Echo_Server/Drivers/BSP/STM32H7xx_Nucleo/stm32h7xx_nucleo.c Drivers/BSP/STM32H743ZI-Nucleo/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m7 -std=gnu11 -g3 -DUSE_HAL_DRIVER -DUSE_PWR_LDO_SUPPLY -DUSE_PWR_LDO_SUPPLY -DSTM32H723xx -DDEBUG -c -I../../Src -I../../Middlewares/Third_Party/LwIP/system -I../../Drivers/BSP/STM32H7xx_Nucleo -I../../Drivers/CMSIS/Device/ST/STM32H7xx/Include -I../../Drivers/BSP/Components -I../../Inc -I../../Middlewares/Third_Party/LwIP/src/include -I../../Drivers/BSP/Components/Common -I../../Drivers/STM32H7xx_HAL_Driver/Inc -I../../Drivers/CMSIS/Include -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfpu=fpv5-d16 -mfloat-abi=hard -mthumb -o "$@"

clean: clean-Drivers-2f-BSP-2f-STM32H743ZI-2d-Nucleo

clean-Drivers-2f-BSP-2f-STM32H743ZI-2d-Nucleo:
	-$(RM) ./Drivers/BSP/STM32H743ZI-Nucleo/stm32h7xx_nucleo.cyclo ./Drivers/BSP/STM32H743ZI-Nucleo/stm32h7xx_nucleo.d ./Drivers/BSP/STM32H743ZI-Nucleo/stm32h7xx_nucleo.o ./Drivers/BSP/STM32H743ZI-Nucleo/stm32h7xx_nucleo.su

.PHONY: clean-Drivers-2f-BSP-2f-STM32H743ZI-2d-Nucleo

