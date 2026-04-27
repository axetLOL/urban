#ifndef TYPES_H
#define TYPES_H
#include <stdint.h>

typedef struct {
    uint64_t size;
    uint64_t ptr;
    uint64_t id;
} logical_volume_header;

#endif
