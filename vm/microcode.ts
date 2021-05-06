import {Tuple} from './util';

export enum Instructions {
    MoveA_B,
    MoveA_Accumulator,
    MoveA_Address,
    MoveA_IO,
    MoveB_A,
    MoveB_Accumulator,
    MoveB_Address,
    MoveB_IO,
    MoveAccumulator_A,
    MoveAccumulator_B,
    MoveAccumulator_Address,
    MoveAccumulator_IO,
    MoveAddress_A,
    MoveAddress_B,
    MoveAddress_Accumulator,
    MoveAddress_IO,
    MoveIO_A,
    MoveIO_B,
    MoveIO_Accumulator,
    MoveIO_Address,

    LoadA, // Loads op from memory into A
    LoadB, // Loads op from memory into B
    LoadAccumulator, // Loads op from memory into Accumulator
    LoadAddress,  // Loads op from memory into Address
    LoadIO, // Loads op from memory into IO
    LoadA_Immediate, // Loads op directly into A
    LoadB_Immediate, // Loads op directly into B
    LoadAccumulator_Immediate, // Loads op directly into Accumulator
    LoadAddress_Immediate, // Loads op directly into Address
    LoadIO_Immediate, // Loads op directly into IO
    StoreA, // Writes A into memory at address op
    StoreB, // Writes B into memory at address op
    StoreAccumulator, // Writes Accumulator into memory at address op
    StoreAddress, // Writes Address into memory at address op
    StoreIO, // Writes IO into memory at address op
    Store_Immediate, // Stores op at memory location in Address
    Add, // Places the sum of values in registers A and value at op into Accumulator
    Sum, // Places the sum of values in registers A and B into Accumulator
    Subtract, // Places the difference between registers A and value at op into Accumulator
    Difference, // Places the difference between registers A and B into Accumulator
    Compare, // Passes registers A and B through ALU without placing the result in Accumulator
    Jump, // Jumps to address in op
    JumpZero, // Jumps to address in op if zero flag is set
    JumpCarry, // Jumps to address in op if carry flag is set
    In, // Writes the contents of device pointed to by Address register into IO register
    Out, // Writes contents of IO register to device pointed to by B register.
    Halt, // Stops the program.
}

export enum CS {
    InstructionRegister_In,
    InstructionRegister_In_Param,
    InstructionRegister_Out,
    ProgramCounter_In,
    ProgramCounter_Out,
    ProgramCounter_Increment,
    Accumulator_In,
    Accumulator_Out,
    Address_In,
    Address_Out,
    AddressBackup_In,
    AddressBackup_Out,
    A_In,
    A_Out,
    B_In,
    B_Out,
    IO_In,
    IO_Out,
    Flags_In,
    Flags_Out,
    Memory_In,
    Memory_Out,
    ALU_Enable,
    Subtract,
    Peripheral_In,
    Peripheral_Out,
    Halt,
}

export const microcode: Record<Instructions, Instruction> = {
    [Instructions.MoveA_B]:
        [[CS.A_Out, CS.B_In], [], []],
    [Instructions.MoveA_Accumulator]:
        [[CS.A_Out, CS.Accumulator_In], [], []],
    [Instructions.MoveA_Address]:
        [[CS.A_Out, CS.Address_In], [], []],
    [Instructions.MoveA_IO]:
        [[CS.A_Out, CS.IO_In], [], []],
    [Instructions.MoveB_A]:
        [[CS.B_Out, CS.A_In], [], []],
    [Instructions.MoveB_Accumulator]:
        [[CS.B_Out, CS.Accumulator_In], [], []],
    [Instructions.MoveB_Address]:
        [[CS.B_Out, CS.Address_In], [], []],
    [Instructions.MoveB_IO]:
        [[CS.B_Out, CS.IO_In], [], []],
    [Instructions.MoveAccumulator_A]:
        [[CS.Accumulator_Out, CS.A_In], [], []],
    [Instructions.MoveAccumulator_B]:
        [[CS.Accumulator_Out, CS.B_In], [], []],
    [Instructions.MoveAccumulator_Address]:
        [[CS.Accumulator_Out, CS.Address_In], [], []],
    [Instructions.MoveAccumulator_IO]:
        [[CS.Accumulator_Out, CS.IO_In], [], []],
    [Instructions.MoveAddress_A]:
        [[CS.Address_Out, CS.A_In], [], []],
    [Instructions.MoveAddress_B]:
        [[CS.Address_Out, CS.B_In], [], []],
    [Instructions.MoveAddress_Accumulator]:
        [[CS.Address_Out, CS.Accumulator_In], [], []],
    [Instructions.MoveAddress_IO]:
        [[CS.Address_Out, CS.IO_In], [], []],
    [Instructions.MoveIO_A]:
        [[CS.IO_Out, CS.A_In], [], []],
    [Instructions.MoveIO_B]:
        [[CS.IO_Out, CS.B_In], [], []],
    [Instructions.MoveIO_Accumulator]:
        [[CS.IO_Out, CS.Accumulator_In], [], []],
    [Instructions.MoveIO_Address]:
        [[CS.IO_Out, CS.Address_In], [], []],

    [Instructions.LoadA]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.A_In], []],
    [Instructions.LoadB]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.B_In], []],
    [Instructions.LoadAccumulator]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.Accumulator_In], []],
    [Instructions.LoadAddress]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.Address_In], []],
    [Instructions.LoadIO]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.IO_In], []],

    [Instructions.LoadA_Immediate]:
        [[CS.InstructionRegister_Out, CS.Memory_In], [CS.Memory_Out, CS.A_In], []],
    [Instructions.LoadB_Immediate]:
        [[CS.InstructionRegister_Out, CS.Memory_In], [CS.Memory_Out, CS.B_In], []],
    [Instructions.LoadAccumulator_Immediate]:
        [[CS.InstructionRegister_Out, CS.Memory_In], [CS.Memory_Out, CS.Accumulator_In], []],
    [Instructions.LoadAddress_Immediate]:
        [[CS.InstructionRegister_Out, CS.Memory_In], [CS.Memory_Out, CS.Address_In], []],
    [Instructions.LoadIO_Immediate]:
        [[CS.InstructionRegister_Out, CS.Memory_In], [CS.Memory_Out, CS.IO_In], []],

    [Instructions.StoreA]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.A_Out, CS.Memory_In], []],
    [Instructions.StoreB]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.B_Out, CS.Memory_In], []],
    [Instructions.StoreAccumulator]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Accumulator_Out, CS.Memory_In], []],
    [Instructions.StoreAddress]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Address_Out, CS.Memory_In], []],
    [Instructions.StoreIO]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.IO_Out, CS.Memory_In], []],
    [Instructions.Store_Immediate]:
        [[CS.InstructionRegister_Out, CS.Memory_In], [], []],

    [Instructions.Sum]:
        [[CS.Memory_Out, CS.B_In], [CS.ALU_Enable, CS.Accumulator_In], []],
    [Instructions.Add]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.B_In], [CS.ALU_Enable, CS.Accumulator_In]],
    [Instructions.Difference]:
        [[CS.Memory_Out, CS.B_In], [CS.ALU_Enable, CS.Accumulator_In, CS.Subtract], []],
    [Instructions.Subtract]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.B_In], [CS.ALU_Enable, CS.Accumulator_In, CS.Subtract]],
    [Instructions.Compare]:
        [[CS.InstructionRegister_Out, CS.Address_In], [CS.Memory_Out, CS.InstructionRegister_Out], [CS.ALU_Enable, CS.Subtract, CS.Flags_In]],

    [Instructions.Jump]:
        [[CS.InstructionRegister_Out, CS.ProgramCounter_In], [], []],
    [Instructions.JumpZero]:
        [[], [], []],
    [Instructions.JumpCarry]:
        [[], [], []],

    [Instructions.In]:
        [[CS.Peripheral_Out, CS.IO_In], [], []],
    [Instructions.Out]:
        [[CS.IO_Out, CS.Peripheral_In], [], []],
    [Instructions.Halt]:
        [[CS.Halt], [], []],
}

export type Instruction = Tuple<CS[], 3>;