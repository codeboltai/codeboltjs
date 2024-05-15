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
                if (response.type === "getJsTreeResponse") {
                    resolve(resolve); // Resolve the Promise with the response data
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
    performMatch:(matcherDefinition:object, problemPatterns:[], problems:[])=>{
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action":"performMatch",
                payload:{
                    matcherDefinition,
                    problemPatterns,
                }
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getgetJsTreeResponse") {
                    resolve(resolve); // Resolve the Promise with the response data
                } 
            });
        }); 
    },
    getMatcherList:()=>{
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action":"getMatcherList",
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getMatcherListTreeResponse") {
                    resolve(resolve); // Resolve the Promise with the response data
                } 
            });
        }); 
    },
    matchDetail:(matcher:string)=>{
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action":"getMatchDetail",
                payload:{
                    match:matcher
                }
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "matchDetailTreeResponse") {
                    resolve(resolve); // Resolve the Promise with the response data
                } 
            });
        }); 
    }

};

export default cbcodeutils;
