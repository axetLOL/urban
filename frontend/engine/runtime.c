#include "runtime.h"

void update (void) {
    //stub
    return;
}

void delta (void) {
    printf("Buffer:%ld, Header:%ld\n", *(uint_fast64_t *)(base_ptr), *(uint_fast64_t *)(base_ptr+8));
    return;
}
