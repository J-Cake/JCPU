import 'source-map-support/register';
import Emulator from "./emulator";
import typewriter from "./io/Typewriter";

const binFile = process.argv.find(i => i.startsWith('--file='))?.split('=')?.pop();
const ramSize = Number(process.argv.find(i => i.startsWith('--ram-size='))?.split('=')?.pop() ?? '256');

const emulator = new Emulator({
    clockSpeed: 128,
    ramFile: binFile,
    ramSize: ramSize,
    peripherals: [typewriter()]
});
emulator.startClock();