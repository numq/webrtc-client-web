export const Message = (senderId, text, sentAt = Date.now()) => {
    return {
        senderId: senderId,
        text: text,
        sentAt: sentAt
    };
};