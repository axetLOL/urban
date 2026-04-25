#include "io.h"

#ifdef _WIN32
#include <windows.h>

int32_t stdin_bytes_available(void) {
    HANDLE h = GetStdHandle(STD_INPUT_HANDLE);
    DWORD avail = 0;
    if (!PeekNamedPipe(h, NULL, 0, NULL, &avail, NULL))
        return -1;
    return (int32_t)avail;
}

#else
#include <sys/select.h>
#include <unistd.h>

int32_t stdin_bytes_available(void) {
    fd_set fds;
    FD_ZERO(&fds);
    FD_SET(STDIN_FILENO, &fds);
    struct timeval tv = {0, 0};
    int32_t r = select(STDIN_FILENO + 1, &fds, NULL, NULL, &tv);
    if (r < 0) return -1;
    if (r == 0) return 0;
    return 8;
}

#endif
