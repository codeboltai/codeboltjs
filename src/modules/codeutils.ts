import cbws from './websocket';

/**
 * A utility module for working with code.
 */
const cbcodeutils = {
    /**
     * Asynchronously generates a code tree from the provided source code.
     * @param {any} fileName - The name of the file.
     * @param {any} source - The source code to generate the tree from.
     * @param {any} filePath - The file path where the source code is located.
     * @returns {Promise<any>} A promise that resolves with the code tree.
     */
    getCodeTree: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action":"getCodeTree"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getCodeTreeResponse") {
                    resolve(response.markdown); // Resolve the Promise with the response data
                } 
            });
        });
    },
    getAllFilesAsMarkDown:()=>{
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action":"getAllFilesMarkdown"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getAllFilesMarkdownResponse") {
                    resolve(response.markdown); // Resolve the Promise with the response data
                } 
            });
        });
    }
};

export default cbcodeutils;
