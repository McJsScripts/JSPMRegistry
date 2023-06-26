import { print } from "#logging";
import Injector from "$de/blazemcworld/jsscripts/Injector";
import PrintWriter from "$java/io/PrintWriter";
import StringWriter from "$java/io/StringWriter";
import Opcodes from "$org/objectweb/asm/Opcodes";
import Type from "$org/objectweb/asm/Type";
import InsnList from "$org/objectweb/asm/tree/InsnList";
import InsnNode from "$org/objectweb/asm/tree/InsnNode";
import JumpInsnNode from "$org/objectweb/asm/tree/JumpInsnNode";
import LabelNode from "$org/objectweb/asm/tree/LabelNode";
import LdcInsnNode from "$org/objectweb/asm/tree/LdcInsnNode";
import MethodInsnNode from "$org/objectweb/asm/tree/MethodInsnNode";
import TypeInsnNode from "$org/objectweb/asm/tree/TypeInsnNode";
import VarInsnNode from "$org/objectweb/asm/tree/VarInsnNode";
import Textifier from "$org/objectweb/asm/util/Textifier";
import TraceMethodVisitor from "$org/objectweb/asm/util/TraceMethodVisitor";

const data = {
    load: {
        [Type.LONG]: Opcodes.LLOAD,
        [Type.BOOLEAN]: Opcodes.ILOAD,
        [Type.BYTE]: Opcodes.ILOAD,
        [Type.CHAR]: Opcodes.ILOAD,
        [Type.DOUBLE]: Opcodes.DLOAD,
        [Type.FLOAT]: Opcodes.FLOAD,
        [Type.INT]: Opcodes.ILOAD,
        [Type.SHORT]: Opcodes.ILOAD,
    },
    store: {
        [Type.LONG]: Opcodes.LSTORE,
        [Type.BOOLEAN]: Opcodes.ISTORE,
        [Type.BYTE]: Opcodes.ISTORE,
        [Type.CHAR]: Opcodes.ISTORE,
        [Type.DOUBLE]: Opcodes.DSTORE,
        [Type.FLOAT]: Opcodes.FSTORE,
        [Type.INT]: Opcodes.ISTORE,
        [Type.SHORT]: Opcodes.ISTORE,
    },
    return: {
        [Type.LONG]: Opcodes.LRETURN,
        [Type.BOOLEAN]: Opcodes.IRETURN,
        [Type.BYTE]: Opcodes.IRETURN,
        [Type.CHAR]: Opcodes.IRETURN,
        [Type.DOUBLE]: Opcodes.DRETURN,
        [Type.FLOAT]: Opcodes.FRETURN,
        [Type.INT]: Opcodes.IRETURN,
        [Type.SHORT]: Opcodes.IRETURN,
    },
    bytes: {
        [Type.LONG]: 2,
        [Type.BOOLEAN]: 1,
        [Type.BYTE]: 1,
        [Type.CHAR]: 1,
        [Type.DOUBLE]: 2,
        [Type.FLOAT]: 1,
        [Type.INT]: 1,
        [Type.SHORT]: 1,
    },
    classes: {
        [Type.LONG]: "java/lang/Long",
        [Type.BOOLEAN]: "java/lang/Boolean",
        [Type.BYTE]: "java/lang/Byte",
        [Type.CHAR]: "java/lang/Character",
        [Type.DOUBLE]: "java/lang/Double",
        [Type.FLOAT]: "java/lang/Float",
        [Type.INT]: "java/lang/Integer",
        [Type.SHORT]: "java/lang/Short",
    },
    descriptors: {
        [Type.LONG]: "J",
        [Type.BOOLEAN]: "Z",
        [Type.BYTE]: "B",
        [Type.CHAR]: "C",
        [Type.DOUBLE]: "D",
        [Type.FLOAT]: "F",
        [Type.INT]: "I",
        [Type.SHORT]: "S",
    },
    get: {
        [Type.LONG]: "longValue",
        [Type.BOOLEAN]: "booleanValue",
        [Type.BYTE]: "byteValue",
        [Type.CHAR]: "charValue",
        [Type.DOUBLE]: "doubleValue",
        [Type.FLOAT]: "floatValue",
        [Type.INT]: "intValue",
        [Type.SHORT]: "shortValue",
    },
};

export function injectAtHead(clazz, method, handler, config = {}) {
    config = {
        catchErrors: true,
        readArguments: true,
        writeArguments: true,
        returnHandler: true,
        ...config,
    };

    config.readArguments = config.readArguments || config.writeArguments;

    Injector.transformMethod(clazz, method, (node) => {
        let insn = new InsnList();

        let localTypes = Array.from(Type.getMethodType(node.desc).getArgumentTypes());

        if ((node.access & Opcodes.ACC_STATIC) == 0) {
            localTypes.unshift(Type.getObjectType("java/lang/Object"));
        }

        let dataIndex = 0;

        if (config.readArguments) {
            for (let i = 0; i < localTypes.length; i++) {
                const type = localTypes[i];

                if (type.getSort() == Type.OBJECT) {
                    insn.add(new VarInsnNode(Opcodes.ALOAD, dataIndex));
                    insn.add(new MethodInsnNode(Opcodes.INVOKESTATIC, "de/blazemcworld/jsscripts/Injector", "addCallbackInfo", "(Ljava/lang/Object;)V"));
                    dataIndex++;
                    continue;
                }
                if (type.getSort() in data.descriptors) {
                    insn.add(new TypeInsnNode(Opcodes.NEW, data.classes[type.getSort()]));
                    insn.add(new InsnNode(Opcodes.DUP));
                    insn.add(new VarInsnNode(data.load[type.getSort()], dataIndex));
                    insn.add(new MethodInsnNode(Opcodes.INVOKESPECIAL, data.classes[type.getSort()], "<init>", "(" + data.descriptors[type.getSort()] + ")V"));
                    insn.add(new MethodInsnNode(Opcodes.INVOKESTATIC, "de/blazemcworld/jsscripts/Injector", "addCallbackInfo", "(Ljava/lang/Object;)V"));
                    dataIndex += data.bytes[type.getSort()];
                    continue;
                }
                throw new Error("read not supported: " + type);
            }
        }

        let obj;
        insn.add(
            callbackInstructions((rawInfo) => {
                let theObj = { cancel: false, cancelValue: null, info: Array.from(rawInfo) };
                if (config.catchErrors) {
                    try {
                        handler(theObj);
                    } catch (err) {
                        print(err, "red");
                    }
                } else {
                    handler(theObj);
                }
                obj = theObj;
                return theObj.cancel ? "something" : null;
            }, !config.returnHandler)
        );

        if (config.returnHandler) {
            const endIfLabel = new LabelNode();
            insn.add(new JumpInsnNode(Opcodes.IFNULL, endIfLabel));

            insn.add(callbackInstructions(() => obj.cancelValue, false));

            const returnType = Type.getMethodType(node.desc).getReturnType();

            if (returnType.getSort() == Type.OBJECT) {
                insn.add(new TypeInsnNode(Opcodes.CHECKCAST, returnType.getInternalName()));
                insn.add(new InsnNode(Opcodes.ARETURN));
            } else if (returnType.getSort() == Type.VOID) {
                insn.add(new InsnNode(Opcodes.RETURN));
            } else if (returnType.getSort() in data.descriptors) {
                insn.add(new TypeInsnNode(Opcodes.CHECKCAST, data.classes[returnType.getSort()]));
                insn.add(new MethodInsnNode(Opcodes.INVOKEDYNAMIC, data.classes[returnType.getSort()], data.get[returnType.getSort()], "()" + data.descriptors[returnType.getSort()]));
                insn.add(new InsnNode(data.return[returnType.getSort()]));
            } else {
                throw new Error("return not supported: " + returnType);
            }

            insn.add(endIfLabel);
        }

        if (config.writeArguments) {
            dataIndex = 0;
            for (let i = 0; i < localTypes.length; i++) {
                const type = localTypes[i];
                const currentIndex = i;

                if (type.getSort() == Type.OBJECT) {
                    if (i == 0 && (node.access & Opcodes.ACC_STATIC) == 0) {
                        //cant overwrite "this"
                        dataIndex++;
                        continue;
                    }
                    insn.add(callbackInstructions(() => obj.info[currentIndex], false));
                    insn.add(new TypeInsnNode(Opcodes.CHECKCAST, type.getInternalName()));
                    insn.add(new VarInsnNode(Opcodes.ASTORE, dataIndex));
                    dataIndex++;
                } else if (type.getSort() in data.descriptors) {
                    insn.add(callbackInstructions(() => obj.info[currentIndex], false));
                    insn.add(new TypeInsnNode(Opcodes.CHECKCAST, data.classes[type.getSort()]));
                    insn.add(new MethodInsnNode(Opcodes.INVOKEVIRTUAL, data.classes[type.getSort()], data.get[type.getSort()], "()" + data.descriptors[type.getSort()]));
                    insn.add(new VarInsnNode(data.store[type.getSort()], dataIndex));
                    dataIndex += data.bytes[type.getSort()];
                } else {
                    throw new Error("store not supported: " + type);
                }
            }
        }

        node.instructions.insertBefore(node.instructions.getFirst(), insn);
    });
}

export function callbackInstructions(handler, discard = true) {
    const callback = Injector.registerCallback(handler);

    let instructions = new InsnList();
    instructions.add(new LdcInsnNode(callback));
    instructions.add(new MethodInsnNode(Opcodes.INVOKESTATIC, "de/blazemcworld/jsscripts/Injector", "invokeCallback", "(I)Ljava/lang/Object;"));

    if (discard) {
        instructions.add(new InsnNode(Opcodes.POP));
    }

    return instructions;
}

export function stringifyNode(node) {
    const textifier = new Textifier();
    node.accept(new TraceMethodVisitor(textifier));
    let sw = new StringWriter();
    textifier.print(new PrintWriter(sw));
    return sw.toString();
}
