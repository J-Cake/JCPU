import {Statement, StatementType} from "./Parser";
import {Instruction, instructionIdentifiers, InstructionType, Label, registerIdentifiers, TokenType} from "./data";

import {Token} from "./Lexer";
import {Instructions} from '../vm/microcode';
import {Err} from "../vm/util";
import {Registers} from "../vm/emulator";

const labels: { [label: string]: number } = {};

export const getRegister: (register: string) => string = register => register.slice(1);
export const getAddress: (tok: Token<TokenType.Address | TokenType.Label>) => number = tok =>
    tok.type === TokenType.Address ? parseInt(tok.source.slice(1), 16) : labels[tok.source];
export const getNumeral: (tok: Token<TokenType.Numeral>) => number = function (tok) {
    const [, sign, base, numeral] = tok.source.match(/^(-)?(0[dxbo])?([\da-f]+)$/i);
    const baseValue = {
        'd': 10,
        'x': 16,
        'b': 2,
        'o': 8
    }
    return parseInt(numeral, baseValue[base] ?? 10) * (sign === '-' ? -1 : 1);
};

const mapper: Record<InstructionType, (operands: Token[]) => [Instructions, number?][]> = {
    [InstructionType.Move]: function (operands) {
        const reg1 = Registers[Object.keys(registerIdentifiers).find(i => registerIdentifiers[i].includes(operands[0].source.slice(1).toLowerCase()))];
        const reg2 = Registers[Object.keys(registerIdentifiers).find(i => registerIdentifiers[i].includes(operands[1].source.slice(1).toLowerCase()))];

        const instruction = Object.keys(Instructions).find(i => i.includes(`${reg1}_${reg2}`));
        if (instruction)
            return [[Instructions[instruction]]];
        else
            Err(`Move not supported for ${reg1} to ${reg2}`);
    },
    [InstructionType.Load]: function (operands) {
        const map: Record<FlatArray<typeof registerIdentifiers[keyof typeof registerIdentifiers], 2>, Instructions> = {
            'acc': Instructions.LoadAccumulator,
            'accumulator': Instructions.LoadAccumulator,
            'adr': Instructions.LoadAddress,
            'address': Instructions.LoadAddress,
            'a': Instructions.LoadA,
            'b': Instructions.LoadB,
            'io': Instructions.LoadIO,
            'buffer': Instructions.LoadIO,
        };

        if (operands[0].type === TokenType.Register && operands[1].type === TokenType.Address)
            return [[map[getRegister(operands[0].source)], getAddress(operands[1] as Token<TokenType.Address>)]];
    },
    [InstructionType.LoadImmediate]: function (operands) {
        const map: Record<FlatArray<typeof registerIdentifiers[keyof typeof registerIdentifiers], 2>, Instructions> = {
            'acc': Instructions.LoadAccumulator_Immediate,
            'accumulator': Instructions.LoadAccumulator_Immediate,
            'adr': Instructions.LoadAddress_Immediate,
            'address': Instructions.LoadAddress_Immediate,
            'a': Instructions.LoadA_Immediate,
            'b': Instructions.LoadB_Immediate,
            'io': Instructions.LoadIO_Immediate,
            'buffer': Instructions.LoadIO_Immediate,
        };

        if (operands[0].type === TokenType.Register && operands[1].type === TokenType.Numeral)
            return [[map[getRegister(operands[0].source)], getNumeral(operands[1] as Token<TokenType.Numeral>)]];
    },
    [InstructionType.Store]: function (operands) {
        const map: Record<FlatArray<typeof registerIdentifiers[keyof typeof registerIdentifiers], 2>, Instructions> = {
            'acc': Instructions.StoreAccumulator,
            'accumulator': Instructions.StoreAccumulator,
            'adr': Instructions.StoreAddress,
            'address': Instructions.StoreAddress,
            'a': Instructions.StoreA,
            'b': Instructions.StoreB,
            'io': Instructions.StoreIO,
            'buffer': Instructions.StoreIO,
        };
        if (operands[0].type === TokenType.Register && operands[1].type === TokenType.Address)
            return [[map[getRegister(operands[0].source)], getAddress(operands[1] as Token<TokenType.Address>)]];
    },
    [InstructionType.StoreImmediate]: operands => [
        [Instructions.LoadAddress_Immediate, getAddress(operands[0] as Token<TokenType.Address>)],
        [Instructions.Store_Immediate, getNumeral(operands[1] as Token<TokenType.Numeral>)]
    ],
    [InstructionType.Add]: operands => [[Instructions.Add, getAddress(operands[0] as Token<TokenType.Address>)]],
    [InstructionType.Subtract]: operands => [[Instructions.Subtract, getAddress(operands[0] as Token<TokenType.Address>)]],
    [InstructionType.Sum]: operands => [[Instructions.Sum]],
    [InstructionType.Difference]: operands => [[Instructions.Difference]],
    [InstructionType.In]: () => [[Instructions.In]],
    [InstructionType.Out]: () => [[Instructions.Out]],
    [InstructionType.Jump]: operands => [[Instructions.Jump, getAddress(operands[0] as Token<TokenType.Address | TokenType.Label>)]],
    [InstructionType.JumpZero]: operands => [[Instructions.JumpZero, getAddress(operands[0] as Token<TokenType.Address | TokenType.Label>)]],
    [InstructionType.JumpCarry]: operands => [[Instructions.JumpCarry, getAddress(operands[0] as Token<TokenType.Address | TokenType.Label>)]],
    [InstructionType.Halt]: () => [[Instructions.Halt]],
}

export default function Assemble(statements: Statement[], maxLength?: number): Buffer {
    const magicNumber = Buffer.alloc(4);
    magicNumber.writeUInt16LE(148);
    const bin: Buffer[] = [magicNumber];

    for (const i of statements)
        if (i.statementType === StatementType.Instruction) {
            const instructionHolder: Instruction = i as Instruction;

            const expected = instructionIdentifiers[instructionHolder.type].operands;
            const actual = instructionHolder.operands.map(i => i.type);

            if (expected.some((i, a) => i !== actual[a]))
                Err(`${InstructionType[instructionHolder.type]} expects [${expected.map(i => TokenType[i]).join(', ')}]. Received [${instructionHolder.operands.map(i => TokenType[i.type]).join(', ')}]`);
            else {
                const instruction = mapper[instructionHolder.type](instructionHolder.operands);
                if (instruction) {
                    for (const j of instruction) {
                        const b = Buffer.alloc(4);
                        b.writeInt16LE(j[0]);
                        b.writeUInt16LE(j[1], 2);
                        bin.push(b);
                    }
                } else
                    throw `Invalid Syntax - Unimplemented Instruction '${InstructionType[instructionHolder.type]}'`;
            }
        } else if (i.statementType === StatementType.Label) {
            const labelHolder: Label = i as Label;
            labels[labelHolder.name] = bin.length * 4 - 4;
        }

    if ('::main' in labels)
        bin[0].writeUInt16LE(labels['::main'], 2);

    return Buffer.concat(bin, maxLength);
}