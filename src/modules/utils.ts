import cbws from './websocket';


const cbutils = {


 editFileAndApplyDiff:(filePath: string, diff: string,diffIdentifier:string,prompt:string,applyModel?:string): Promise<any> => {
    return new Promise((resolve, reject) => {
        cbws.getWebsocket.send(JSON.stringify({
            "type": "fsEvent",
            "action": "editFileAndApplyDiff",
            message:{
                filePath,
                diff,
                diffIdentifier,
                prompt,
                applyModel
            }
        }));
        cbws.getWebsocket.on('message', (data: string) => {
            const response = JSON.parse(data);
            if (response.type === "editFileAndApplyDiffResponse") {
                resolve(response);
            }
        });
    });
 } 
}

export default cbutils;