import { callbackInstructions } from "#modify";
import Injector from "$de/blazemcworld/jsscripts/Injector";
import MinecraftClient from "$net/minecraft/client/MinecraftClient";
import Scoreboard from "$net/minecraft/scoreboard/Scoreboard";
import Opcodes from "$org/objectweb/asm/Opcodes";
import InsnNode from "$org/objectweb/asm/tree/InsnNode";
import JumpInsnNode from "$org/objectweb/asm/tree/JumpInsnNode";
import LabelNode from "$org/objectweb/asm/tree/LabelNode";
import LdcInsnNode from "$org/objectweb/asm/tree/LdcInsnNode";

const mc = MinecraftClient.getInstance();
const trim = 6;

function shouldHide() {
    let sb = mc.world.getScoreboard();
    let scores = Array.from(sb.getAllPlayerScores(sb.getObjectiveForSlot(Scoreboard.SIDEBAR_DISPLAY_SLOT_ID)))
        .map((s) => s.getScore())
        .sort((a, b) => b - a);

    for (let i = 1; i < scores.length; i++) {
        if (scores[i - 1] - 1 != scores[i]) return null;
    }
    return "hide";
}

Injector.transformMethod("net.minecraft.client.gui.hud.InGameHud", "renderScoreboardSidebar", (method) => {
    let arr = Array.from(method.instructions);
    let i = arr.findIndex((m) => {
        if (m.getOpcode() != Opcodes.INVOKESTATIC) return false;
        if (m.name != "toString") return false;
        if (m.owner != "java/lang/Integer") return false;
        return true;
    });
    i += 2;
    let skipLabel = new LabelNode();
    method.instructions.insertBefore(arr[i], callbackInstructions(shouldHide, false));
    method.instructions.insertBefore(arr[i], new JumpInsnNode(Opcodes.IFNULL, skipLabel));
    method.instructions.insertBefore(arr[i], new InsnNode(Opcodes.POP));
    method.instructions.insertBefore(arr[i], new LdcInsnNode(-trim));
    method.instructions.insertBefore(arr[i], skipLabel);

    let first = false;
    skipLabel = new LabelNode();
    i = arr.findIndex((m) => {
        if (m.getOpcode() != Opcodes.INVOKEVIRTUAL) return false;
        if (m.name != "method_1126") return false;
        if (m.owner != "net/minecraft/class_267") return false;
        first = !first;
        return !first;
    });
    i += 2;
    method.instructions.insertBefore(arr[i], callbackInstructions(shouldHide, false));
    method.instructions.insertBefore(arr[i], new JumpInsnNode(Opcodes.IFNULL, skipLabel));
    method.instructions.insertBefore(arr[i], new InsnNode(Opcodes.POP));
    method.instructions.insertBefore(arr[i], new LdcInsnNode(""));
    method.instructions.insertBefore(arr[i], skipLabel);
});
