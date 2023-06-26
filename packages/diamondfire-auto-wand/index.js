import MinecraftClient from "$net/minecraft/client/MinecraftClient"
import { onReceiveChat } from "#receive-chat-event";

const mc = MinecraftClient.getInstance();

onReceiveChat(
		(data) => {
        let msg = data.message
        if (msg.getString().endsWith("» You are now in build mode.")) {
            let hasaxe = 0;
            for (let i = 0; i < 27; i++) {
                if (mc.player.getInventory().getStack(i).getName().getString() == "Wooden Axe") {
                    hasaxe += 1;
                    return;
                }
            }
            if (hasaxe == 0) {
                mc.getNetworkHandler().sendCommand("/wand");
            }
        }
});