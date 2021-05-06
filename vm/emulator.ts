import {CS as ControlSignal, microcode} from "./microcode";
import {Err, FileNotFound, Tuple} from "./util";
import fss from "fs";

export enum Registers {
    Instruction,
    ProgramCounter,
    Accumulator,
    Address,
    AddressBackup,
    A,
    B,
    IO,
    Flags
}

export enum Flag {
    Zero,
    Carry,
    Equal
}

export type Peripheral<ShortWire extends boolean = false> = ShortWire extends true ? {
    write(),
    enable(),

    getValue(): number,
    setValue(value: number),

    disconnect?()
} : {
    write(),
    enable(),

    disconnect?()
};

export default class Emulator {
    RAM: Peripheral;
    ALU: Peripheral;
    readonly startClock: () => NodeJS.Timeout;
    public IOPorts: Tuple<number, number>;
    private readonly registers: Record<Registers, Peripheral<true>>;
    private readonly peripherals: { [key: number]: Peripheral };
    private bus: number;
    private flags: Flag[] = [];
    private clock: NodeJS.Timeout;
    private readonly clockSpeed: number;
    private controlBuffer: ControlSignal[][];

    public constructor(options?: {
        clockSpeed?: number,
        peripherals?: Tuple<(getPort: () => number) => Peripheral, 0 | 1 | 2 | 3>,
        ramFile: string,
        ramSize: number
    }) {
        this.registers = {
            [Registers.Instruction]: this.mkRegister(),
            [Registers.ProgramCounter]: this.mkRegister(),
            [Registers.Accumulator]: this.mkRegister(),
            [Registers.Address]: this.mkRegister(),
            [Registers.AddressBackup]: this.mkRegister(),
            [Registers.A]: this.mkRegister(),
            [Registers.B]: this.mkRegister(),
            [Registers.IO]: this.mkRegister(),
            [Registers.Flags]: this.mkRegister(),
        };
        this.RAM = this.mkRam(options.ramSize, options.ramFile);
        this.ALU = this.mkAlu(() => this.controlBuffer[0]?.includes(ControlSignal.Subtract) ?? false);

        this.bus = 0;

        this.controlBuffer = [];

        this.clockSpeed = options.clockSpeed;
        this.startClock = function (this: Emulator) {
            return this.clock = setInterval(() => this.onClock(), 1000 / options.clockSpeed ?? 16);
        }.bind(this);

        this.peripherals = {};
        this.IOPorts = [];
        for (const i of options.peripherals) {
            const id = this.getNextPeripheralID();
            this.IOPorts[id] = 0;
            this.peripherals[id] = i(() => this.IOPorts[id]);
        }

        process.on('exit', () => this.halt());
    }

    static readBin(binFile: string, ramSize: number): Buffer {
        if (fss.existsSync(binFile))
            if (binFile)
                return (fss.readFileSync(binFile))
            else
                return (Buffer.alloc(ramSize));
        else
            FileNotFound(binFile);
    }

    onClock() {
        if (this.controlBuffer.length > 0)
            this.performControlWord(this.controlBuffer.shift());
        else
            this.controlBuffer = [
                [ControlSignal.Address_Out, ControlSignal.AddressBackup_In],
                [ControlSignal.ProgramCounter_Out, ControlSignal.Address_In],
                [ControlSignal.Memory_Out, ControlSignal.InstructionRegister_In, ControlSignal.ProgramCounter_Increment],
                [ControlSignal.ProgramCounter_Out, ControlSignal.Address_In],
                [ControlSignal.Memory_Out, ControlSignal.InstructionRegister_In_Param, ControlSignal.ProgramCounter_Increment],
                [ControlSignal.AddressBackup_Out, ControlSignal.Address_In], // Maintains the value of the Address register across instructions
            ];
    }

    mkRegister(val?: number): Peripheral<true> {
        let value: number = val ?? 0;
        const register: Peripheral<true> = {
            write: () => value = this.bus,
            enable: () => this.bus = value,
            getValue: () => value,
            setValue: val => value = val
        };

        return register as Peripheral<true>;
    }

    mkRam(size: number = 2 ** 16, ramFile?: string): Peripheral {
        const ram = ramFile ? Buffer.concat([Emulator.readBin(ramFile, size), Buffer.alloc(size)], size) : Buffer.alloc(size);

        this.registers[Registers.ProgramCounter].setValue(ram.readUInt16LE(2) - 4);

        return {
            enable: () => this.bus = ram.readInt16LE(this.registers[Registers.Address].getValue() * 2),
            write: () => ram.writeInt16LE(this.bus, this.registers[Registers.Address].getValue() * 2)
        }
    }

    mkAlu(subtract: () => boolean): Peripheral {
        let sum: number = 0;
        return {
            enable: () => this.bus = sum,
            write: () => sum = this.registers[Registers.A].getValue() + (this.registers[Registers.B].getValue() * (subtract() ? -1 : 1))

            // const zero = sum === 0 ? 1 : 0;
            // const carry = sum >= (2 ** 16) ? 1 : 0;
            // const sign = sum < 0 ? 1 : 0;
            // const parity = sum & 1;
            //
            // this.registers[Registers.Flags].setValue(zero | (carry >> 1) | (sign >> 2) | (parity >> 3));
        }
    }

    private getNextPeripheralID(): number {
        const freeID: number | null = Number(Object.keys(this.peripherals).find(i => !this.peripherals[i]) ?? null);

        if (freeID)
            return freeID;

        return Object.keys(this.peripherals).length;
    }

    private halt() {
        clearInterval(this.clock);
        for (const i in this.peripherals)
            this.peripherals[i]?.disconnect?.();
    }

    private performControlWord(word: ControlSignal[]) {
        const ControlWordActivators: Record<ControlSignal, () => void> = {
            [ControlSignal.InstructionRegister_In]: function (this: Emulator) {
                this.registers[Registers.Instruction].write.apply(this);
                const instruction = this.registers[Registers.Instruction].getValue();
                if (instruction in microcode)
                    this.controlBuffer.push(...microcode[instruction].filter(i => i.length > 0));
            }.bind(this),
            [ControlSignal.InstructionRegister_In_Param]: () => this.registers[Registers.Instruction].write(),
            [ControlSignal.InstructionRegister_Out]: () => this.registers[Registers.Instruction].enable(),
            [ControlSignal.ProgramCounter_In]: () => this.registers[Registers.ProgramCounter].write(),
            [ControlSignal.ProgramCounter_Out]: () => this.registers[Registers.ProgramCounter].enable(),
            [ControlSignal.ProgramCounter_Increment]: () => this.registers[Registers.ProgramCounter].setValue(this.registers[Registers.ProgramCounter].getValue.apply(this) + 1),
            [ControlSignal.Accumulator_In]: () => this.registers[Registers.Accumulator].write(),
            [ControlSignal.Accumulator_Out]: () => this.registers[Registers.Accumulator].enable(),
            [ControlSignal.Address_In]: () => this.registers[Registers.Address].write(),
            [ControlSignal.Address_Out]: () => this.registers[Registers.Address].enable(),
            [ControlSignal.AddressBackup_In]: () => this.registers[Registers.AddressBackup].write(),
            [ControlSignal.AddressBackup_Out]: () => this.registers[Registers.AddressBackup].enable(),
            [ControlSignal.A_In]: () => [() => this.registers[Registers.A].write(), () => this.ALU.write()].forEach(i => i()),
            [ControlSignal.A_Out]: () => this.registers[Registers.A].enable(),
            [ControlSignal.B_In]: () => [() => this.registers[Registers.B].write(), () => this.ALU.write()].forEach(i => i()),
            [ControlSignal.B_Out]: () => this.registers[Registers.B].enable(),
            [ControlSignal.IO_In]: () => this.registers[Registers.IO].write(),
            [ControlSignal.IO_Out]: () => this.registers[Registers.IO].enable(),
            [ControlSignal.Flags_In]: () => void 0,
            [ControlSignal.Flags_Out]: () => this.registers[Registers.Flags].enable(),
            [ControlSignal.Memory_In]: () => this.RAM.write(),
            [ControlSignal.Memory_Out]: () => this.RAM.enable(),
            [ControlSignal.ALU_Enable]: () => this.ALU.enable(),
            [ControlSignal.Subtract]: () => void 0,
            [ControlSignal.Peripheral_In]: () => {
                const peripheral = this.registers[Registers.Address].getValue();
                if (this.peripherals[peripheral]) {
                    this.IOPorts[peripheral] = this.bus
                    this.peripherals[peripheral].write();
                }
            },
            [ControlSignal.Peripheral_Out]: () => this.peripherals[this.registers[Registers.B].getValue()].enable(),
            [ControlSignal.Halt]: () => this.halt()
        }

        for (const i of word)
            ControlWordActivators[i]();

        this.bus = 0;
    }
}