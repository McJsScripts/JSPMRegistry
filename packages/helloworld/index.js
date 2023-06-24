import JsScripts from "$de/blazemcworld/jsscripts/JsScripts";
import String from "$java/lang/String";
import Text from "$net/minecraft/text/Text";
import Formatting from "$net/minecraft/util/Formatting";

let limit = 100;
let nextReset = Date.now();

export function print(msg, color = "GRAY") {
    limit--;
    if (limit == 0 && nextReset < Date.now()) {
        nextReset = Date.now() + 1000;
        limit = 100;
    }

    if (limit > 0) {
        if (msg instanceof Error) {
            msg = msg.stack;
        }
        color = Formatting.byName(color.toUpperCase());
        if (!color) {
            color = Formatting.byName("GRAY");
        }
        JsScripts.displayChat(Text.literal(String.valueOf(msg)).formatted(color));
    }
}
