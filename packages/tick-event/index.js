import { injectAtHead } from "#modify";

const listeners = [];

export function onTick(listener) {
    listeners.push(listener);
}

injectAtHead("net.minecraft.client.MinecraftClient", "tick", (info) => {
    for (let listener of listeners) {
        listener();
    }
});
