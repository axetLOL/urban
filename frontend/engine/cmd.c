#include "cmd.h"

/* ── helpers ── */


/* ── commands ── */

//no args
void session_new(void) {

    uint64_t lv_count=1;

    *(uint64_t *)(base_ptr+8) = lv_count*(sizeof(logical_volume_header));

    lv = ( logical_volume_header *)(base_ptr+16);

    //LV1 header, tiles
    lv[0].size = 4*64*64; //size of LV1
    lv[0].ptr = 16+*(uint64_t *)(base_ptr+8)+63;
    lv[0].ptr -= lv[0].ptr%64; //ptr of LV1
    lv[0].id = 1; //ID of LV1

    //L1 content, tiles
    uint64_t tile_count = lv[0].size/sizeof(int32_t);
    for(uint64_t i = 0; i<tile_count; i++){
        int32_t val = 0;
        //if x=(0...3) -> val = -1
        //else if y=2 -> val = 1
        // else-> val = 0

        if (i%64<4) val=-1;
        else if (i/64==2)val = 1;

        *(int32_t *)(base_ptr+lv[0].ptr+i*4) = val;
    }


    return;
}

//string path, null terminated
void session_load(void) {
    return;
}

//4 byte ms to define tick
void tick_set(void) {
    uint32_t ms;
    if (fread(&ms, 4, 1, stdin) == 1)
        time_ms = ms;
    return;
}

//no args
void dump_to_file(void){
    FILE *f = fopen("dump.bin", "wb");

    if (f) {
        fwrite(base_ptr, 1, *(uint64_t *)base_ptr, f);
        fclose(f);
    } else {
        printf("DEBUG: Failed to open %s. Reason: %s\n", "dump.bin", strerror(errno));
    }
    return;
}
