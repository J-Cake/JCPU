import {Tuple} from "./util";
import {Token} from "./Lexer";
import {StatementType} from "./Parser";

export enum TokenType {
    PrecompilerDirective,
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

export const registerIdentifiers = [
    ['ins', 'instruction'],
    ['pc', 'program_counter'],
    ['acc', 'accumulator'],
    ['adr', 'addr', 'address'],
    ['a'],
    ['b'],
    ['io', 'buffer']
];

export enum InstructionType {
    Move,
    Load,
    LoadImmediate,
    Store,
    StoreImmediate,
    Add,
    Subtract,
    In,
    Out,
    Jump,
    JumpZero,
    JumpCarry,
    Halt,
}

export const instructionIdentifiers: Record<InstructionType, {
    aliases: string[],
    operands: Tuple<TokenType.Register | TokenType.Numeral | TokenType.Address, 0|1|2>
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
        aliases: ['add', 'sum'],
        operands: [TokenType.Address]
    },
    [InstructionType.Subtract]: {
        aliases: ['sub', 'diff'],
        operands: [TokenType.Address]
    },
    [InstructionType.In]: {
        aliases: ['in', 'input'],
        operands: [TokenType.Register]
    },
    [InstructionType.Out]: {
        aliases: ['out', 'output'],
        operands: [TokenType.Register]
    },
    [InstructionType.Jump]: {
        aliases: ['jmp', 'jump'],
        operands: [TokenType.Address]
    },
    [InstructionType.JumpCarry]: {
        aliases: ['jc', 'jump_c'],
        operands: [TokenType.Address]
    },
    [InstructionType.JumpZero]: {
        aliases: ['jz', 'jump_z'],
        operands: [TokenType.Address]
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