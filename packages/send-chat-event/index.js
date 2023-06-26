import { injectAtHead } from "#modify";

const listeners = [];

export function onSendChat(cb) {
    listeners.push(cb);
}

injectAtHead("net.minecraft.client.network.ClientPlayNetworkHandler", "sendChatMessage", (data) => {
    let forwarded = {
        cancel: false,
        message: data.info[1],
    };
    for (let l of listeners) {
        l(forwarded);
        if (forwarded.cancel) {
            break;
        }
    }
    data.cancel = forwarded.cancel;
    data.info[1] = forwarded.message;
});
