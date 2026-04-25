#ifndef RUNTIME_H
#define RUNTIME_H

#include <stdio.h>
#include <stdint.h>

extern uint8_t *base_ptr, *delta_ptr, *req_ptr;

void delta(void);
void update(void);

#endif
