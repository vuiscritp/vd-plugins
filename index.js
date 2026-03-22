import { metro, patcher, common } from "@vendetta";
const { findByProps, findByName } = metro;
const { toast } = common;

// Các module cần thiết của Discord
const MessageStore = findByProps("getMessage", "getMessages");
const { dispatch } = findByProps("dispatch");
const ActionSheet = findByProps("openLazy", "hideActionSheet");

// Lưu trữ bản gốc
const cache = new Map();

async function translate(text) {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(x => x[0]).join("");
    } catch (e) {
        return null;
    }
}

export default {
    onLoad: () => {
        // Patch vào MessageContextMenu (Menu khi nhấn giữ tin nhắn)
        const MessageContextMenu = findByName("MessageContextMenu", false);

        patcher.after("default", MessageContextMenu, ([{ message }], res) => {
            const isTranslated = cache.has(message.id);

            // Thêm tùy chọn vào cuối danh sách menu
            res.props.children.push(
                <ActionSheetItem
                    label={isTranslated ? "Xem bản gốc (Return)" : "Dịch sang tiếng Việt"}
                    onPress={async () => {
                        ActionSheet.hideActionSheet(); // Đóng menu sau khi chọn

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
