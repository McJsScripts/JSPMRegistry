import LiteralArgumentBuilder from "$com/mojang/brigadier/builder/LiteralArgumentBuilder";
import RequiredArgumentBuilder from "$com/mojang/brigadier/builder/RequiredArgumentBuilder";
import StringArgumentType from "$com/mojang/brigadier/arguments/StringArgumentType";
import MinecraftClient from "$net/minecraft/client/MinecraftClient";
import Class from "$java/lang/Class";
import * as cmdLib from "#cmd-lib";

const mc = MinecraftClient.getInstance();

cmdLib.registerInfo((cd) => {
    cd.register(
        LiteralArgumentBuilder.literal("shrug")
            .then(
                RequiredArgumentBuilder.argument("msg", StringArgumentType.greedyString()).executes((ctx) => {
                    mc.getNetworkHandler().sendChatMessage(ctx.getArgument("msg", Class.forName("java.lang.String")) + " ¯\\_(ツ)_/¯");
                    return 1;
                })
            )
            .executes((ctx) => {
                mc.getNetworkHandler().sendChatMessage("¯\\_(ツ)_/¯");
                return 1;
            })
    );
});
cmdLib.registerRemoval("shrug");
