# cmd-lib

A package for easier usage of the Injector class.

```js
import { injectAtHead } from "#modify";

//at the beginning of the java method, insert some code
injectAtHead("some.java.Class", "methodName", (data) => {
    data.cancel = true; // -> can be used to prevent further execution of the java method and return instantly

    data.cancelValue = anything; // -> can be used to specify the return value, if the execution is cancelled

    data.info; //an array of various objects depending on the function, containing "this" (if available) and the method parameters, can be modified to change the values in the java method
});
```
