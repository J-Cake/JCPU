# JCPU Assembler

Recently, I've been working a lot with CPUs and low-level stuff, but attempting to abstract it to a somewhat higher
level. I became interested in how CPUs perform work. Specifically how a series of wires can do maths. I've built
simulation programs for many specialised interests I've had, but recently, I came across some videos on YouTube about
emulating the 6502 CPU, x86 CPUs and the like. So in a previous program I wrote
called [LogicX](https://logicx.jschneiderprojects.com.au), I built and designed a fully functional 16-bit CPU based
on [Ben Eater's 8-Bit computer video series](https://www.youtube.com/watch?v=HyznrdDSSGM&list=PLowKtXNTBypGqImE405J2565dvjafglHU)
. When I came to the testing phase, I needed a way to program the computer. Of course, it was entirely possible to
program it manually, using the ROM chip plugin for LogicX and populate a binary file myself, but that would be boring.
So I decided to emulate the CPU and write an assembler for it, so I can test it a little easier. I sat down this morning
and thought *yes, I could write an assembler for my CPU*. After just 4 hours, I'm proud to say that it's working
reliably. Mind you it's not exactly capable, or particularly efficient, but that's secondary, as I can now program my
CPU and interact with it, thanks to my emulator. I would highly suggest **not** using any of the designs/code used in
this, or the emulator project as it was quite literally thrown together in an afternoon. But if you're interested in
playing around with it, feel free. Below is a manual of its functionality. It's laughably small.

## Assembly

The assembler does one job. You feed it a file, and it spits out a binary file containing more-or-less exactly what you
fed in, in binary.

Currently, the only way to specify the file is with the `--file=<path to file>` parameter. It is also recommended
passing an `--out=<path to binary>` parameter, although this is not necessary.

### Labels

Labels exist in all (hopefully) assemblers. They mark locations in RAM to make it easier to find/jump to different parts
of the program. The syntax uses a double colon to mark labels anywhere in the source.

```
::label
```

### Instructions

Instructions are the most fundamental way to perform work on a CPU. There are a handful of supported ones. They are:

| **Instruction** | Mnemonic | Alias  | Description                                    | Operands |
|-----------------|----------|--------|------------------------------------------------|----------|
| Move            | `mov` | `move`    | Move a value from one register into another    | Register, Register |
| Load            | `lod` | `load`    | Load a value from ram                          | Register, Address  |
| LoadImmediate   | `ldi` | `load_i`  | Write a value directly into a register         | Register, Numeral  |
| Store           | `sto` | `store`   | Store a value into ram                         | Register, Address  |
| StoreImmediate  | `sti` | `store_i` | Store a value at a specified address in ram    | Address,  Numeral  |
| Add             | `add` | `sum`     | Adds values of A and B register                | Address            |
| Subtract        | `sub` | `diff`    | Subtracts values of A and B register           | Address            |
| In              | `in`  | `input`   | Writes contents of register to IO devices      | Register           |
| Out             | `out` | `output`  | Reads contents of IO devices to register       | Register           |
| Jump            | `jpm` | `jump`    | Jump to an address in ram                      | Address / Label    |
| JumpZero        | `jz`  | `jump_z`  | Jump to an address in ram if zero flag is set  | Address / Label    |
| JumpCarry       | `jc`  | `jump_c`  | Jump to an address in ram if carry flag is set | Address / Label    |
| Halt            | `hlt` | `halt`    | Stop the clock                                 | *none*             |

All instructions and aliases are case-insensitive

### Syntax

There's not much in terms of syntax.

* Labels: `::<label-name>`
* Address: `%<address-value>`
* Register: `$<register-name>`
* Numeral: *Any number (bases are bodx)* `0b00101110`, `0xffab` 
