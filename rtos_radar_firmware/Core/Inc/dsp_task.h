#ifndef INC_DSP_TASK_H_
#define INC_DSP_TASK_H_

#include "defines.h"
#include "global_resources.h"

void TimerIQ_Callback(void *argument);
void vIQTask(void *argument);
void vSTFTTask(void *argument);

#endif /* INC_DSP_TASK_H_ */
