#ifndef MEM_H
#define MEM_H

#include <stddef.h>

void* aligned_calloc(size_t size, size_t alignment);
void  aligned_free(void* ptr);
void* aligned_recalloc(void* ptr, size_t old_size, size_t new_size, size_t alignment);

#endif
