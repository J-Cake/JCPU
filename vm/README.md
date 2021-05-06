# JCPU Virtual Machine

This neat little program reads and runs a binary file spat out by the assembler.

The virtual machine takes 3 arguments, all of which except `file` are optional.

* `--file=<path to binary file` Reads binary file and uses it to populate RAM
* `--ram-size=<*number*>` The minimum number of bytes to give RAM. If the file provided is less than this, RAM will be
  end-padded with 0
* `--peripherals=<devices>` The VM has a few standard peripheral devices that you can connect in order to interact with
  the VM. Currently, the only implemented one is the `Typewriter`, which is installed by default.

I'd like to point out that this is not a serious project, and that I'll be making dramatic changes occasionally. Please
don't use any code here in production. This is a learning thing for me, and a playground project.