#include <stdint.h>
#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include "time.h"
#include "runtime.h"
#include "cmd.h"
#include "io.h"

/* ── globals ── */
uint8_t *base_ptr, *delta_ptr, *req_ptr;

/* ── dispatch ── */
typedef void (*handler_fn)(void);

static handler_fn dispatch_table[] = {
    session_new,
    session_load,
    tick_set,
};
static const size_t N_COMMANDS = sizeof(dispatch_table) / sizeof(dispatch_table[0]);

/* ── main ── */
int main(void) {

    base_ptr=calloc(1, 16*1024*1024);
    *(uint64_t *)base_ptr=16*1024*1024;
    delta_ptr=calloc(1, 16*1024*1024);
    *(uint64_t *)delta_ptr=16*1024*1024;
    req_ptr=calloc(1, 16*1024*1024);
    *(uint64_t *)req_ptr=16*1024*1024;

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
