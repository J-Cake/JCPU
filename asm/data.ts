import {Tuple} from "./util";
import {Token} from "./Lexer";
import {StatementType} from "./Parser";
import {Registers} from "../vm/emulator";

export enum TokenType {
    PrecompilerDirective,
    Variable,
    Label,
    Numeral,
    ByteLiteral,
    Instruction,
    Comment,

    Register,
    Address,

    Comma,
    Whitespace,
    NewLine
}

export const registerIdentifiers: Record<Registers, string[]> = {
    [Registers.Instruction]: ['ins', 'instruction'],
    [Registers.ProgramCounter]: ['pc', 'program_counter'],
    [Registers.Accumulator]: ['acc', 'accumulator'],
    [Registers.Address]: ['adr', 'addr', 'address'],
    [Registers.AddressBackup]: [],
    [Registers.A]: ['a'],
    [Registers.B]: ['b'],
    [Registers.IO]: ['io', 'buffer'],
    [Registers.Flags]: []
};

export enum InstructionType {
    Move,
    Load,
    LoadImmediate,
    Store,
    StoreImmediate,
    Add,
    Subtract,
    Sum,
    Difference,
    In,
    Out,
    Jump,
    JumpZero,
    JumpCarry,
    Halt,
}

export const instructionIdentifiers: Record<InstructionType, {
    aliases: string[],
    operands: Tuple<TokenType.Register | TokenType.Numeral | TokenType.Address | TokenType.Label, 0 | 1 | 2>
}> = {
    [InstructionType.Move]: {
        aliases: ['mov', 'move'],
        operands: [TokenType.Register, TokenType.Register]
    },
    [InstructionType.Load]: {
        aliases: ['lod', 'load'],
        operands: [TokenType.Register, TokenType.Address]
    },
    [InstructionType.LoadImmediate]: {
        aliases: ['ldi', 'load_i'],
        operands: [TokenType.Register, TokenType.Numeral]
    },
    [InstructionType.Store]: {
        aliases: ['sto', 'store'],
        operands: [TokenType.Register, TokenType.Address]
    },
    [InstructionType.StoreImmediate]: {
        aliases: ['sti', 'store_i'],
        operands: [TokenType.Address, TokenType.Numeral]
    },
    [InstructionType.Add]: {
        aliases: ['add'],
        operands: [TokenType.Address]
    },
    [InstructionType.Subtract]: {
        aliases: ['sub'],
        operands: [TokenType.Address]
    },
    [InstructionType.Sum]: {
        aliases: ['sum'],
        operands: []
    },
    [InstructionType.Difference]: {
        aliases: ['dif', 'difference'],
        operands: []
    },
    [InstructionType.In]: {
        aliases: ['in', 'input'],
        operands: [TokenType.Register]
    },
    [InstructionType.Out]: {
        aliases: ['out', 'output'],
        operands: []
    },
    [InstructionType.Jump]: {
        aliases: ['jmp', 'jump'],
        operands: [TokenType.Label]
    },
    [InstructionType.JumpCarry]: {
        aliases: ['jc', 'jump_c'],
        operands: [TokenType.Label]
    },
    [InstructionType.JumpZero]: {
        aliases: ['jz', 'jump_z'],
        operands: [TokenType.Label]
    },
    [InstructionType.Halt]: {
        aliases: ['hlt', 'halt'],
        operands: []
    }
}

export const isInstruction: (ins: string) => boolean = ins => Object.values(instructionIdentifiers).some(i => i.aliases.includes(ins.toLowerCase()));

export type GenericStatement<Type extends StatementType> = {
    statementType: Type
}

export interface Instruction<Type extends InstructionType = InstructionType> extends GenericStatement<StatementType.Instruction> {
    type: Type,
    operands: Token[],
    statementType: StatementType.Instruction
}

export interface Label extends GenericStatement<StatementType.Label> {
    name: string,
    statementType: StatementType.Label
}

export interface Data extends GenericStatement<StatementType.Data> {
    data: Token[],
    statementType: StatementType.Data
}