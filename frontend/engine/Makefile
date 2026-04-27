# Default settings (Linux/POSIX)
CC      = gcc
CFLAGS  = -Wall -Wextra -std=gnu11
SRCS    = main.c time.c runtime.c cmd.c io.c mem.c
TARGET  = main
EXT     =

# The 'all' rule builds the native version by default
all: gcc

# Native Linux Build
gcc: CC = gcc
gcc: TARGET = main
gcc: EXT =
gcc: $(TARGET)

# MinGW Cross-Compilation Build
# This assumes you have x86_64-w64-mingw32-gcc installed
mingw: CC = x86_64-w64-mingw32-gcc
mingw: TARGET = main_win
mingw: EXT = .exe
mingw: $(TARGET)$(EXT)

# Linking rule
$(TARGET)$(EXT): $(SRCS)
	$(CC) $(CFLAGS) $(SRCS) -o $(TARGET)$(EXT)

clean:
	rm -f main main_win.exe
