#include <stdint.h>
#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>

#include "time.h"
#include "runtime.h"
#include "cmd.h"
#include "io.h"
#include "mem.h"
#include "types.h"

/* ── globals ── */
uint8_t *base_ptr, *delta_ptr, *req_ptr;

logical_volume_header *lv;

uint64_t lv_count=4;

game_state_structure *game_state;

uint64_t building_count = 3;

/* ── dispatch ── */
typedef void (*handler_fn)(void);

static handler_fn dispatch_table[] = {
    session_new,
    session_load,
    tick_set,
    dump_to_file,
    tile_build,
    tile_clear,
    viewbox_register,
};
static const size_t N_COMMANDS = sizeof(dispatch_table) / sizeof(dispatch_table[0]);

/* ── main ── */
int main(void) {

    base_ptr=aligned_calloc(2*1024*1024, 64);
    *(uint64_t *)base_ptr=2*1024*1024;
    delta_ptr=aligned_calloc(2*1024*1024, 64);
    *(uint64_t *)delta_ptr=2*1024*1024;
    req_ptr=aligned_calloc(2*1024*1024, 64);
    *(uint64_t *)req_ptr=2*1024*1024;

    while (true) {
        __auto_type start = get_now();

        while (stdin_bytes_available() >= 8) {
            uint64_t cmd;
            if (fread(&cmd, 8, 1, stdin) == 1)
                if (cmd < N_COMMANDS)
                    dispatch_table[cmd]();
        }



        update();
        delta();
        fflush(stdout);
        sleep_until(start);
    }
}
