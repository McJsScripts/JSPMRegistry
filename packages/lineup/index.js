import * as cmdLib from "#cmd-lib";
import MinecraftClient from "$net/minecraft/client/MinecraftClient"
import LiteralArgumentBuilder from "$com/mojang/brigadier/builder/LiteralArgumentBuilder";

const mc = MinecraftClient.getInstance();

cmdLib.registerInfo((cd) => {
    cd.register(
        LiteralArgumentBuilder.literal("lineup").executes(() => {
                    let pos = mc.player.getPos();
                    mc.player.setPos(Math.round(pos.x), pos.y, Math.round(pos.z) + 0.001);
                    mc.player.setYaw(90);
                    return 1;
                }));
});
cmdLib.registerRemoval("lineup");