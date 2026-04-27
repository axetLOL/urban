#ifndef MEM_H
#define MEM_H

#include <stddef.h>

void* aligned_calloc(size_t size, size_t alignment);
void  aligned_free(void* ptr);

#endif
