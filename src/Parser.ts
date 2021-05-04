import {Token} from "./Lexer";
import {GenericStatement, Instruction, instructionIdentifiers, InstructionType, Label, TokenType} from "./data";

export enum StatementType {
    Label,
    Instruction,
    Data,
    Unknown
}

export function detectStatementType(line: Token[]): StatementType {
    if (line.length > 0)
        if (line.length === 1 && line[0].type === TokenType.Label)
            return StatementType.Label;
        else if (line[0].type === TokenType.Instruction && line.length <= 4 && line.length >= 1)
            return StatementType.Instruction;
        else // Handle a data statement properly.
            return StatementType.Unknown;
    else
        return StatementType.Unknown;
}

export function parseInstruction(instruction: Token[]): Instruction {
    if (instruction[0].type !== TokenType.Instruction)
        throw `SyntaxError - invalid instruction`;

    const findInstructionType: (instruction: string) => InstructionType =
        instruction => Number(Object.entries(instructionIdentifiers).find(([, info]) => info.aliases.includes(instruction.toLowerCase()))[0]);

    return {
        type: findInstructionType(instruction[0].source),
        operands: instruction.slice(1).filter(i => i.type !== TokenType.Comma),
        statementType: StatementType.Instruction
    }
}

export function parseLabel(label: Token[]): Label {
    if (label[0].type !== TokenType.Label)
        throw `SyntaxError - invalid label`;

    return {
        name: label[0].source,
        statementType: StatementType.Label
    }
}

export type Statement<T extends StatementType = any> = GenericStatement<StatementType>;

type Record2 = {
    [P in StatementType]: (tokens: Token[]) => Statement<P>;
};

export default function Parse(tokens: Token[]): Statement[] {
    // const labels: { [label: string]: number } = {}; // TODO: Add labels as alternative to addresses

    const lines: Token[][] = [[]];
    for (const i of tokens)
        if (i.type === TokenType.NewLine && lines[lines.length - 1].length > 0)
            lines.push([]);
        else
            lines[lines.length - 1].push(i);

    return lines.map(function (i) {
        const parsers: Record2 = {
            [StatementType.Label]: tokens => ({
                ...parseLabel(tokens),
                statementType: StatementType.Label
            }),
            [StatementType.Instruction]: tokens => ({
                ...parseInstruction(tokens),
                statementType: StatementType.Instruction
            }),
            [StatementType.Data]: () => void 0,
            [StatementType.Unknown]: () => void 0,
        };

        return parsers[detectStatementType(i)](i);
    }).filter(i => i && i.statementType !== StatementType.Unknown);
}