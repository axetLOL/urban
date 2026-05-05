#ifndef TYPES_H
#define TYPES_H
#include <stdint.h>

typedef struct {
    uint64_t size;
    uint64_t ptr;
    uint64_t id;
} logical_volume_header;

typedef struct {
    int32_t x;
    int32_t y;
} position;

typedef struct {
    double money;
    position pos_1;
    position pos_2;
} game_state_structure;

typedef struct {
    uint8_t x;
    uint8_t y;

} building_size;

#endif
