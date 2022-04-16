import { ChannelID } from "ittai";
import { Messages, CurrentChannels } from "ittai/stores";
import { Dispatcher } from "ittai/webpack";

export default function (channelId: ChannelID = CurrentChannels.getChannelId()) {
    const messages = Messages.getMessages(channelId);
    if (!messages._array?.length) return;
    for (const message of messages._array) {
        Dispatcher.dispatch({
            type: "MESSAGE_UPDATE",
            message: message
        });
    }
}