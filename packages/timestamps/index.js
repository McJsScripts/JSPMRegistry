import Text from "$net/minecraft/text/Text";
import { onReceiveChat } from "#receive-chat-event";
import SimpleDateFormat from "$java/text/SimpleDateFormat"

onReceiveChat((data) => {
    if (!data.message.getString().includes("\n")) {
        let timestamp = Date.now();
        let formatter = new SimpleDateFormat("HH:mm:ss");
        let time = formatter.format(timestamp);
        data.message = Text.literal(`§7${time} §r`).append(data.message);
    }
});
