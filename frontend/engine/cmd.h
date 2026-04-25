#ifndef CMD_H
#define CMD_H

#include <stdint.h>
#include <stdio.h>

extern uint32_t time_ms;
extern uint8_t *base_ptr, *delta_ptr, *req_ptr;

void session_new(void);
void session_load(void);
void tick_set(void);

#endif
