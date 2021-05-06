// import fs from 'fs/promises';
// import os from 'os';
// import path from 'path';
//
// import Emulator, {Peripheral} from "../emulator";
//
// export default function(this: Emulator, deviceId: number): Peripheral {
//     const file = fs.open(path.join(os.homedir(), '.JCPU'), 'rw');
//     const emulator = this;
//
//     return {
//         getValue(): number {
//             return 0;
//         }, setValue(value: number) {
//
//         }
//     }
// }