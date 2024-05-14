import cbws from './websocket';

/**
 * A utility module for working with code.
 */
const cbcodeutils = {
  
    
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
    getJsTree: (filePath:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action":"getJsTree",
                payload:{
                    filePath
                }
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getgetJsTreeResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
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
    },
    matchProblem:(matcherDefinition:object, problemPatterns:[], problems:[])=>{
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action":"getJsTree",
                payload:{
                    matcherDefinition,
                    problemPatterns,
                    problems
                }
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getgetJsTreeResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
                } 
            });
        }); 
    }
};

export default cbcodeutils;
