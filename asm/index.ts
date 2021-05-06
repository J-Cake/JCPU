import fs from 'fs/promises';

import Lexer from "./Lexer";
import Parse from "./Parser";
import Assemble from "./Assembler";

export default async function assemble(file: string): Promise<Buffer> {
    const source = await fs.readFile(file, 'utf8');

    return Assemble(Parse(Lexer(source)))
}