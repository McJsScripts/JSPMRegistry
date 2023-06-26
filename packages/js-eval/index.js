import MinecraftClient from "$net/minecraft/client/MinecraftClient";
import Text from "$net/minecraft/text/Text";
import LiteralArgumentBuilder from "$com/mojang/brigadier/builder/LiteralArgumentBuilder";
import RequiredArgumentBuilder from "$com/mojang/brigadier/builder/RequiredArgumentBuilder";
import StringArgumentType from "$com/mojang/brigadier/arguments/StringArgumentType";
import Class from "$java/lang/Class";
import Context from "$org/graalvm/polyglot/Context";
import Formatting from "$net/minecraft/util/Formatting";
import ScriptFS from "$de/blazemcworld/jsscripts/ScriptFS";
import ScriptManager from "$de/blazemcworld/jsscripts/ScriptManager";
import * as cmdLib from "#cmd-lib";

const mc = MinecraftClient.getInstance();

let id = 0;
let jsCtx;

cmdLib.registerInfo((cd) => {
    cd.register(
        LiteralArgumentBuilder.literal("jseval")
            .then(
                LiteralArgumentBuilder.literal("reset").executes((ctx) => {
                    if (jsCtx) {
                        jsCtx.close();
                    }
                    jsCtx = null;
                    id = 0;
                    mc.player.sendMessage(Text.literal("Reset Context!").formatted(Formatting.byName("GREEN")), false);
                    return 1;
                })
            )
            .then(
                RequiredArgumentBuilder.argument("code", StringArgumentType.greedyString()).executes((ctx) => {
                    if (!jsCtx) {
                        jsCtx = Context.newBuilder().allowAllAccess(true).fileSystem(new ScriptFS()).build();
                    }
                    let code = ctx.getArgument("code", Class.forName("java.lang.String"));
                    id++;
                    try {
                        mc.player.sendMessage(Text.literal("In: " + code).formatted(Formatting.byName("DARK_AQUA")), false);
                        let out = jsCtx.eval("js", code);
                        jsCtx.getBindings("js")["$" + id] = out;
                        mc.player.sendMessage(Text.literal("$" + id + " = " + out).formatted(Formatting.byName("AQUA")), false);
                    } catch (err) {
                        jsCtx.getBindings("js")["$" + id] = err;
                        mc.player.sendMessage(Text.literal("$" + id + " = " + err).formatted(Formatting.byName("RED")), false);
                    }
                    return 1;
                })
            )
    );
});
cmdLib.registerRemoval("jseval");

ScriptManager.onDisable(() => {
    if (jsCtx) {
        jsCtx.close();
    }
});
