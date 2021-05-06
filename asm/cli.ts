import fss from 'fs';

import 'source-map-support/register';

import assemble from "./index";

const file = process.argv.find(i => i.startsWith('--file='))?.split('=')?.pop();
const outputSize = Number(process.argv.find(i => i.startsWith('--output-size='))?.split('=')?.pop() ?? '256');

if (file && fss.existsSync(file)) {
    const output = process.argv.find(i => i.startsWith('--out='))?.split('=')?.pop() ?? file.split('/').pop().split('.').slice(0, -1).concat('bin').join('.');

    fss.writeFileSync(output, Buffer.concat([await assemble(file), Buffer.alloc(outputSize)], outputSize));
} else if (file)
    console.error(`The file ${file} does not exist`);