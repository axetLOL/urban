#include "cmd.h"

/* ── helpers ── */


/* ── commands ── */

//no args
void session_new(void) {

    *(uint64_t *)(base_ptr+8) = lv_count*(sizeof(logical_volume_header));

    lv = ( logical_volume_header *)(base_ptr+16);

    //LV1 header, global gamestate
    lv[0].size = sizeof(game_state_structure);
    lv[0].ptr = 16+*(uint64_t *)(base_ptr+8)+63;
    lv[0].ptr -= lv[0].ptr%64;
    lv[0].id = 1;

    //LV1 contents, global gamestate

    game_state = (game_state_structure *)(base_ptr+lv[0].ptr);

    (*game_state).money = 40000.0f;
    (*game_state).pos_1.x = 0;
    (*game_state).pos_1.y = 0;
    (*game_state).pos_2.x = 1920;
    (*game_state).pos_2.y = 1080;


    //LV2 header, building sizes

    lv[1].size=sizeof(building_size)*building_count;
    lv[1].ptr = lv[0].ptr+lv[0].size+63;
    lv[1].ptr -= lv[1].ptr%64;
    lv[1].id = 2;
    
    //LV2 contents, building sizes

    //to be added

    //LV3 header, building prices

    lv[2].size=sizeof(double)*building_count;
    lv[2].ptr = lv[1].ptr+lv[1].size+63;
    lv[2].ptr -= lv[2].ptr%64;
    lv[2].id = 3;

    //LV3 header, building prices

    //to be added

    //LV4 header, tiles
    lv[3].size = sizeof(int32_t)*64*64; 
    lv[3].ptr = lv[2].ptr+lv[2].size+63;
    lv[3].ptr -= lv[3].ptr%64; 
    lv[3].id = 4; 

    //LV4 content, tiles
    int32_t *tile_ptr = (int32_t *)(base_ptr + lv[3].ptr);

    for (uint64_t y = 0; y < 64; y++) {
        for (uint64_t x = 0; x < 64; x++) {
            int32_t val = 0;

            if (y < 4) {
                val = -1;
            } else if (x == 2) {
                val = 1;
            }

            *tile_ptr = val;
            tile_ptr++;
        }
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

//4 byte x, 4 byte y, 4 byte building ID
void tile_build (void){
    int32_t id;
    uint32_t x, y;
    fread(&x, 4, 1, stdin);
    fread(&y, 4, 1, stdin);
    fread(&id, 4, 1, stdin);
    uint64_t ptr=lv[3].ptr;
    *(int32_t *)((int32_t *)ptr+y*64+x)=id;

    return;
}

//4 byte x, 4 byte y
void tile_clear (void){
    uint32_t x, y;
    fread(&x, 4, 1, stdin);
    fread(&y, 4, 1, stdin);
    uint64_t ptr=lv[3].ptr;
    *(int32_t *)((int32_t *)ptr+y*64+x)=0;

    return;
}

// 16 bytes: x_1, y_1, x_2, y_2
void viewbox_register (void) {
    int32_t x_1, y_1, x_2, y_2;
    fread(&x_1, 4, 1, stdin);
    fread(&y_1, 4, 1, stdin);
    fread(&x_2, 4, 1, stdin);
    fread(&y_2, 4, 1, stdin);
    (*game_state).pos_1.x = x_1;
    (*game_state).pos_1.y = y_1;
    (*game_state).pos_2.x = x_2;
    (*game_state).pos_2.y = y_2;
    return;

}   