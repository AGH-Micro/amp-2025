#include "testH7_lib.h"
#include "main.h"
#include "stm32h7xx_nucleo.h"
#include <stdio.h>
/* --------------------------------------- READ README.MD BEFORE USING !!! ----------------------------------------------- */

const double vRef = 3.3;
const  int delayTime = 1000;

volatile uint8_t adc1_Ready = 0;
volatile uint8_t adc2_Ready = 0;
volatile uint8_t adc3_Ready = 0;



volatile uint16_t adc1_Output = 0;
volatile uint16_t adc2_Output = 0;
volatile uint16_t adc3_Output = 0;


volatile static double adc1_OutputVoltage = 0.0;
volatile static double adc2_OutputVoltage = 0.0;
volatile static double adc3_OutputVoltage = 0.0;

static char adc1_Buff[20];
static char adc1_BuffVoltage[20];
static char adc2_Buff[20];
static char adc2_BuffVoltage[20];
static char adc3_Buff[20];
static char adc3_BuffVoltage[20];

volatile static double procent = 0.0;

// above variables needed to complete tasks




void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc) // adc handler
{
	if(hadc->Instance == ADC1)
	{
		adc1_Output = HAL_ADC_GetValue(hadc); // flag = adc1_Ready
		adc1_Ready = 1;
	}
	if(hadc->Instance == ADC3)
	{
		adc2_Output = HAL_ADC_GetValue(hadc); // flag = adc2_Ready
		adc2_Ready = 1;
	}
	if(hadc->Instance == ADC3)
	{
		adc3_Output = HAL_ADC_GetValue(hadc); // flag = adc3_Ready
		adc3_Ready = 1;
	}

}

void testADC(ADC_HandleTypeDef* hadc, double vRef) // function to check Output of ADC converted to voltage (0 - Vref) 
{
	 HAL_ADC_Start_IT(hadc);
	 if(adc1_Ready)
	 {
		 adc1_Ready = 0;
		 adc1_OutputVoltage = vRef - vRef*((double)adc1_Output/((double)0xFFFF));
		 procent = (adc1_OutputVoltage*100)/vRef;
		 sprintf(adc1_Buff, "%x", adc1_Output);
		 sprintf(adc1_BuffVoltage, "%.3f", adc1_OutputVoltage);
		 printf("Output: %sV, HexValue: %s, %%: %.2f%% \r\n", adc1_BuffVoltage, adc1_Buff, procent);
	 }
	 if(adc2_Ready)
	 {
		 adc2_Ready = 0;
		 adc2_OutputVoltage = vRef - vRef*((double)adc2_Output/((double)0xFFFF));
		 procent = (adc2_OutputVoltage*100)/vRef;
		 sprintf(adc1_Buff, "%x", adc2_Output);
		 sprintf(adc1_BuffVoltage, "%.3f", adc2_OutputVoltage);
		 printf("Output: %sV, HexValue: %s, %%: %.2f%% \r\n", adc2_BuffVoltage, adc2_Buff, procent);
	 }
	 if(adc3_Ready)
	 {
		 adc3_Ready = 0;
		 adc3_OutputVoltage = vRef - vRef*((double)adc3_Output/((double)0xFFFF));
		 procent = (adc3_OutputVoltage*100)/vRef;
		 sprintf(adc1_Buff, "%x", adc3_Output);
		 sprintf(adc1_BuffVoltage, "%.3f", adc3_OutputVoltage);
		 printf("Output: %sV, HexValue: %s, %%: %.2f%% \r\n", adc3_BuffVoltage, adc3_Buff, procent);
	 }

}

void printUART(UART_HandleTypeDef* huart, char* str) // basic print uart( uart_instance, (what we want to print via UART) )
{
    char buff[100];
    snprintf(buff, sizeof(buff), "%s", str);
    HAL_UART_Transmit(huart, (uint8_t*)buff, strlen(buff), HAL_MAX_DELAY);
}


void testConsolePrint(int option) // basic console print via VCOM or BSPVCOM
{
	static int idx = 0;
	switch(option)
	{
	case 1:
		printf("Test Console print via Virtual_COM, idx:%d\r\n ", idx);
		idx++;
		break;
	case 2:
		printf("Mega cool console print via VirtualCOM for Chillguys:) idx:%d\r\n\n",idx);
		idx++;
		break;
	default:
		printf("Wrong argument \"option\" for testConsolePrint() function !");
		HAL_Delay(10000);
		break;
	}
}

// 1- toggle, 2 - TurnON, 3- TurnOFF
void testBlinkDiode(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin, int option) // basic blink diode func()
{
	switch(option)
	{
	case 1:
		HAL_GPIO_TogglePin(&GPIOx, GPIO_Pin);
		HAL_Delay(500);
		break;
	case 2:
		HAL_GPIO_WritePin(&GPIOx, GPIO_Pin, GPIO_PIN_SET);
		break;
	case 3:
		HAL_GPIO_WritePin(&GPIOx, GPIO_Pin, GPIO_PIN_RESET);
		break;
	default:
		printf("Wrong argument \"option\" for testBlinkDiode() function !\r\n"
				"1 - Toggle,\r\n2 - state_ON,\r\n3 - state_OFF\r\n\n");
		HAL_Delay(10000);
		break;
	}
}

// init of VCOM BSP on the nucleo-H7, uncomment if needed
/* 
void VCOM_Init(void)
{
  COM_InitTypeDef BspCOMInit;

  BspCOMInit.BaudRate   = 115200;
  BspCOMInit.WordLength = COM_WORDLENGTH_8B;
  BspCOMInit.StopBits   = COM_STOPBITS_1;
  BspCOMInit.Parity     = COM_PARITY_NONE;
  BspCOMInit.HwFlowCtl  = COM_HWCONTROL_NONE;
  if (BSP_COM_Init(COM1, &BspCOMInit) != BSP_ERROR_NONE)
  {
    Error_Handler();
  }
}
*/


