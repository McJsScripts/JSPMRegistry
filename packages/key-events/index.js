import { injectAtHead } from "#modify";
import InputUtil from "$net/minecraft/client/util/InputUtil";

const listeners = {
    up: [],
    down: [],
    hold: [],
};

export const onKey = {
    up: (l) => listeners.up.push(l),
    down: (l) => listeners.down.push(l),
    hold: (l) => listeners.hold.push(l),
};

const types = ["up", "down", "hold"];

injectAtHead("net.minecraft.client.Keyboard", "onKey", ({ info }) => {
    let id = InputUtil.fromKeyCode(info[2], info[3]).toString();
    let list = listeners[types[info[4]]];
    for (let l of list) {
        l(id);
    }
});
