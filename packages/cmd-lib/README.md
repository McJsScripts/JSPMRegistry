# cmd-lib

A package for creating clientside commands.

You are recommended to look at https://github.com/Mojang/brigadier/ for more information on how to create commands.

```js
import * as cmdLib from "#cmd-lib";

cmdLib.registerInfo((cd) => {
    //"cd" is an instance of com.mojang.brigadier.CommandDispatcher
    cd.register(
        LiteralArgumentBuilder.literal("example").executes((ctx) => {
            //some code, to execute when /example is being ran
            return 1;
        })
    );
});

//removes the command once all scripts are being unloaded
cmdLib.registerRemoval("example"); //removes "/example" and all children
cmdLib.registerRemoval("example", "path"); //removes the "/example path" command (only path, not /example)
```
