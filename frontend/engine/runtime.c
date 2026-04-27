#include "runtime.h"
#include <inttypes.h>


void update (void) {
    //stub
    return;
}

void delta (void) {
    printf("Buffer:%" PRIuFAST64 ", Header:%" PRIuFAST64 "\n",
       *(uint_fast64_t *)(base_ptr),
       *(uint_fast64_t *)(base_ptr + 8));
    return;
}
