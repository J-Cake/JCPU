import Emulator, {Peripheral} from "../emulator";

// *screen* device
export default function display(): (getPort: () => number) => Peripheral {
    return function(getPort: () => number): Peripheral {
        return {
            enable: () => 0,
            write: () => console.log("Printing", getPort())
        }
    }
}