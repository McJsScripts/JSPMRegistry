import MinecraftClient from "$net/minecraft/client/MinecraftClient"
import { onReceiveChat } from "#receive-chat-event";

const mc = MinecraftClient.getInstance();

onReceiveChat(
		(data) => {
        let msg = data.message
        if (msg.getString().endsWith("» You are now in dev mode.")) {
            if (mc.player.getInventory().getStack(0).getName().getString() == "Player Event") {
                if (mc.player.getInventory().getStack(7).getName().getString() == "Air") {
                    mc.getNetworkHandler().sendCommand("rc");
                }
            }
        }
});