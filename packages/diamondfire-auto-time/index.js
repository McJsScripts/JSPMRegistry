import MinecraftClient from "$net/minecraft/client/MinecraftClient"
import { onReceiveChat } from "#receive-chat-event";

const mc = MinecraftClient.getInstance();

onReceiveChat(
		(data) => {
        let msg = data.message
        if (msg.getString().endsWith("» You are now in dev mode.") || msg.getString().endsWith("» You are now in build mode.")) {
            mc.getNetworkHandler().sendCommand("time 6000");
        }
});