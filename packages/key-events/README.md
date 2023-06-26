# key-events

Detect keyboard input

It is recommended to simply log the keys, and then see what string you get to figure out what key responds to which identifier.

Hold is not every tick, but the same as if you hold a key while typing, so first a pause, and then it repeats.

```js
import { onKey } from "#key-events";

onKey.down((key) => {});
onKey.up((key) => {});
onKey.hold((key) => {});
```
