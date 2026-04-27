#ifndef CMD_H
#define CMD_H

#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include "types.h"

extern uint32_t time_ms;
extern uint8_t *base_ptr, *delta_ptr, *req_ptr;
extern logical_volume_header *lv;

void session_new(void);
void session_load(void);
void tick_set(void);
void dump_to_file(void);

#endif
