import { metro, patcher, common } from "@vendetta";
const { findByProps, findByDisplayName } = metro;
const { toast } = common;
const React = common.React;

const { ActionSheetItem } = findByProps("ActionSheetItem");
const ActionSheet = findByProps("openLazy", "hideActionSheet");
const { dispatch } = findByProps("dispatch");

const cache = new Map();

async function translate(text: string) {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map((x: any) => x[0]).join("");
    } catch (e) {
        return null;
    }
}

export default {
    onLoad: () => {
        const MessageContextMenu = findByProps("MessageContextMenu")?.MessageContextMenu || findByDisplayName("MessageContextMenu");
        if (!MessageContextMenu) return;

        patcher.after("default", MessageContextMenu, ([{ message }], res) => {
            const isTranslated = cache.has(message.id);
            const items = res.props?.children?.props?.children || res.props?.children;

            if (Array.isArray(items)) {
                items.push(React.createElement(ActionSheetItem, {
                    label: isTranslated ? "Xem bản gốc" : "Dịch sang tiếng Việt",
                    onPress: async () => {
                        ActionSheet.hideActionSheet();
                        if (isTranslated) {
                            const original = cache.get(message.id);
                            dispatch({ type: "MESSAGE_UPDATE", message: { id: message.id, channel_id: message.channel_id, content: original } });
                            cache.delete(message.id);
                            toast.show("Đã khôi phục");
                        } else {
                            toast.show("Đang dịch...");
                            const result = await translate(message.content);
                            if (result) {
                                cache.set(message.id, message.content);
                                dispatch({ type: "MESSAGE_UPDATE", message: { id: message.id, channel_id: message.channel_id, content: result } });
                                toast.show("Đã dịch xong!");
                            } else {
                                toast.show("Lỗi kết nối!");
                            }
                        }
                    }
                }));
            }
        });
    },
    onUnload: () => {
        patcher.unpatchAll();
        cache.clear();
    }
};
                items.push(
                    <ActionSheetItem
                        label={isTranslated ? "Xem bản gốc" : "Dịch sang tiếng Việt"}
                        onPress={async () => {
                            ActionSheet.hideActionSheet();

                            if (isTranslated) {
                                const original = cache.get(message.id);
                                dispatch({
                                    type: "MESSAGE_UPDATE",
                                    message: { id: message.id, channel_id: message.channel_id, content: original }
                                });
                                cache.delete(message.id);
                                toast.show("Đã khôi phục");
                            } else {
                                toast.show("Đang dịch...");
                                const result = await translate(message.content);
                                if (result) {
                                    cache.set(message.id, message.content);
                                    dispatch({
                                        type: "MESSAGE_UPDATE",
                                        message: { id: message.id, channel_id: message.channel_id, content: result }
                                    });
                                    toast.show("Đã dịch xong!");
                                } else {
                                    toast.show("Lỗi kết nối!");
                                }
                            }
                        }}
                    />
                );
            }
        });
    },
    onUnload: () => {
        patcher.unpatchAll();
        cache.clear();
    }
};

                        if (isTranslated) {
                            // Khôi phục
                            const original = cache.get(message.id);
                            dispatch({
                                type: "MESSAGE_UPDATE",
                                message: { id: message.id, channel_id: message.channel_id, content: original }
                            });
                            cache.delete(message.id);
                            toast.show("Đã trả về bản gốc");
                        } else {
                            // Dịch
                            toast.show("Đang dịch...");
                            const result = await translate(message.content);
                            if (result) {
                                cache.set(message.id, message.content); // Lưu lại bản gốc
                                dispatch({
                                    type: "MESSAGE_UPDATE",
                                    message: { id: message.id, channel_id: message.channel_id, content: result }
                                });
                                toast.show("Dịch hoàn tất!");
                            } else {
                                toast.show("Lỗi dịch thuật!");
                            }
                        }
                    }}
                />
            );
        });
    },
    onUnload: () => {
        patcher.unpatchAll();
        cache.clear();
    }
};
