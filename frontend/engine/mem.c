#include "mem.h"
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
    #include <malloc.h>
#endif

void* aligned_calloc(size_t size, size_t alignment) {
    // Round up size to the nearest multiple of alignment to satisfy C11/POSIX
    size_t padded_size = (size + alignment - 1) & ~(alignment - 1);
    void* ptr = NULL;

#if defined(_WIN32)
    ptr = _aligned_malloc(padded_size, alignment);
#else
    ptr = aligned_alloc(alignment, padded_size);
#endif

    if (ptr) {
        memset(ptr, 0, padded_size);
    }
    return ptr;
}

void aligned_free(void* ptr) {
    if (!ptr) return;
#if defined(_WIN32)
    _aligned_free(ptr);
#else
    free(ptr);
#endif
}
