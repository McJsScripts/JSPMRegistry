# send-chat-event

Detect whenver the user send a message into the chat.

```js
import { onSendChat } from "#send-chat-event";

onSendChat((data) => {
    data.message; //string, what the user typed into the chat
    data.cancel; //boolean, if set to true will not send the message
});
```
