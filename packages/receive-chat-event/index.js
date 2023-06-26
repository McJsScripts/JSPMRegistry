import { injectAtHead } from "#modify";
import System from "$java/lang/System";

const listeners = [];

export function onReceiveChat(cb) {
    listeners.push(cb);
}

injectAtHead("net.minecraft.client.gui.hud.ChatHud", "method_44811", (data) => {
    let forwarded = {
        cancel: false,
        message: data.info[1],
    };
    System.out.println(data);
    for (let l of listeners) {
        l(forwarded);
        if (forwarded.cancel) {
            break;
        }
    }
    data.cancel = forwarded.cancel;
    data.info[1] = forwarded.message;
});
