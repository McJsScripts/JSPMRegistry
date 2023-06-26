# receive-chat-event

A package for listening to all incoming chat messages, whether it be a mod, a chat message, or the server

```js
import { onReceiveChat } from "#receive-chat-event";

onReceiveChat((data) => {
    data.message; //instance of net.minecraf.text.Text
    data.cancel; //boolean, if set to true will not display the message in the chat
});
```
