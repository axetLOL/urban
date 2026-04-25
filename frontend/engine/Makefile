CC      = gcc
CFLAGS  = -Wall -Wextra -std=gnu11
SRCS    = main.c time.c runtime.c cmd.c io.c
TARGET  = main

$(TARGET): $(SRCS)
	$(CC) $(CFLAGS) $(SRCS) -o $(TARGET)

clean:
	rm -f $(TARGET)
