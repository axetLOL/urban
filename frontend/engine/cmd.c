#include "cmd.h"

/* ── helpers ── */

static void define_logical_volumes(void){

    return;
}

/* ── commands ── */

//no args
void session_new(void) {

    *(uint64_t *)(base_ptr+8) = 64; //lenght of the pointer header

    define_logical_volumes();
    return;
}

//string path, null terminated
void session_load(void) {
    return;
}

//4 byte ms to define tick
void tick_set(void) {
    uint32_t ms;
    if (fread(&ms, 4, 1, stdin) == 1)
        time_ms = ms;
    return;
}
