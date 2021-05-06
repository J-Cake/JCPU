# JCPU

This is literally a week-long project. I was playing around with compilers and wanted to target my own platform. So
writing an emulator was the next logical step (don't even ask). Anyway, I wrote an assembler and virtual cpu for it.

It's not difficult to run. Nodejs > 14.2.

1. ```pnpm i```
2. ```pnpx tsc```
3. Run it:
    1. ```node --es-module-specifier-resolution=node ./build/asm/cli.js```
    2. ```node --es-module-specifier-resolution=node ./build/vm/cli.js```