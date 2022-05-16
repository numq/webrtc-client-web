export const Session = (id, clientId, strangerId, isLastConnected) => {
    return {
        id: id,
        clientId: clientId,
        strangerId: strangerId,
        isLastConnected: isLastConnected
    };
};