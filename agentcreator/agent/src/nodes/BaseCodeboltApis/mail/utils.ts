export const handleMailResponse = (node: any, response: any, successIndex: number, errorIndex: number, dataIndices: { [key: string]: number }) => {
    if (response.success) {
        node.setOutputData(successIndex, true);
        node.setOutputData(errorIndex, null);
        for (const [key, index] of Object.entries(dataIndices)) {
            if (response[key] !== undefined) {
                node.setOutputData(index, response[key]);
            }
        }
        node.triggerSlot(0, response);
    } else {
        node.setOutputData(successIndex, false);
        node.setOutputData(errorIndex, response.error || "Unknown error");
        node.triggerSlot(0, null);
    }
};
