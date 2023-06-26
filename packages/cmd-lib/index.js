import { print } from "#logging";
import { injectAtHead } from "#modify";
import { onTick } from "#tick-event";
import CommandDispatcher from "$com/mojang/brigadier/CommandDispatcher";
import CommandSyntaxException from "$com/mojang/brigadier/exceptions/CommandSyntaxException";
import ScriptManager from "$de/blazemcworld/jsscripts/ScriptManager";
import MinecraftClient from "$net/minecraft/client/MinecraftClient";

const mc = MinecraftClient.getInstance();

const registerCallbacks = [];
const cmdNames = [];
let currentDispatcher = null;
const execDispatcher = new CommandDispatcher();

export function registerInfo(cb) {
    registerCallbacks.push(cb);
    cb(execDispatcher);
    if (currentDispatcher) {
        cb(currentDispatcher);
    }
}

export function registerRemoval(...path) {
    cmdNames.push(path);
}

onTick(() => {
    const cd = mc.getNetworkHandler().getCommandDispatcher();
    if (cd != currentDispatcher) {
        currentDispatcher = cd;
        for (let cb of registerCallbacks) {
            try {
                cb(currentDispatcher);
            } catch (err) {
                print(err);
            }
        }
    }
});

injectAtHead("net.minecraft.client.network.ClientPlayNetworkHandler", "sendChatCommand", (data) => {
    try {
        execDispatcher.execute(data.info[1], null);
        data.cancel = true;
    } catch (err) {
        if (err instanceof CommandSyntaxException) {
            if (err.getCursor() > 0) {
                mc.player.sendMessage(Text.literal(err.getMessage()).formatted(Formatting.byName("RED")), false);
                data.cancel = true;
            }
            return;
        }
        print(err, "red");
        data.cancel = true;
    }
});

ScriptManager.onDisable(() => {
    if (currentDispatcher == null) {
        return;
    }
    removal: for (let path of cmdNames) {
        let node = currentDispatcher.getRoot();
        let last = path.pop();
        for (let elm of path) {
            node = Array.from(node.getChildren()).find((c) => c.getName() == elm);
            if (node == null) {
                continue removal;
            }
        }
        node.getChildren().removeIf((c) => c.getName() == last);
    }
});
