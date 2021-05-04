import {isInstruction, registerIdentifiers, TokenType} from "./data";
import {Err} from "./util";


export type Token<T extends TokenType = TokenType> = {
    source: string,
    type: T,
    charIndex?: number
}

export const matchers: Record<TokenType, (tok: string) => boolean> = {
    [TokenType.PrecompilerDirective]: tok => /^!.+$/.test(tok),
    [TokenType.Label]: tok => /^::\w+$/.test(tok),
    [TokenType.Numeral]: tok => /^-?(0[dDxXbBoO])?\d+$/.test(tok),
    [TokenType.ByteLiteral]: tok => /^((?<![\\])['"])((?:.(?!(?<![\\])\1))*.?)\1$/.test(tok),
    [TokenType.Instruction]: tok => /^\w{2,}/.test(tok) && isInstruction(tok),
    [TokenType.Comment]: tok => /^#.*$/.test(tok),

    [TokenType.Register]: tok => tok.startsWith('$') && registerIdentifiers.some(i => i.includes(tok.slice(1).toLowerCase())),
    [TokenType.Address]: tok => /^%[\da-fA-F]+$/.test(tok),

    [TokenType.Comma]: tok => tok === ',',
    [TokenType.Whitespace]: tok => /^[\t ]+$/.test(tok),
    [TokenType.NewLine]: tok => /^\n+$/.test(tok),
}

export default function Lexer(input: string): Token[] {
    let source = Array.from(input);
    const tokens: Token[] = [];

    while (source.length > 0) {
        const accumulator: string[] = [];
        let token: Token;

        for (const i of source) {
            accumulator.push(i);

            for (const [type, matcher] of Object.entries(matchers))
                if (matcher(accumulator.join('')))
                    token = {
                        source: accumulator.join(''), type: Number(type) as TokenType
                    }
        }

        if (token) {
            source = source.slice(token.source.length);
            tokens.push(token);
        } else Err(`Invalid Syntax - unrecognised token ${accumulator.join('').split(' ')[0]}`);
    }

    return tokens.filter(i => i.type !== TokenType.Whitespace && i.type !== TokenType.Comment);
}