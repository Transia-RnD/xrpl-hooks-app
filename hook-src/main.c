/**
 * This hook just accepts any transaction coming through it
 */
#include "libs/hookapi.h"

int64_t hook(uint32_t reserved) {

    TRACESTR("Accept.c: Called.");
    accept (0,0,0); 

    _g(1,1);   // every hook needs to import guard function and use it at least once
    // unreachable
    return 0;
}