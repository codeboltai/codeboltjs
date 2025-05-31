import cbws from '../core/websocket';


const cbutils = {


 editFileAndApplyDiff:(filePath: string, diff: string,diffIdentifier:string,prompt:string,applyModel?:string): Promise<any> => {
    return cbws.messageManager.sendAndWaitForResponse(
            {
            "type": "fsEvent",
            "action": "editFileAndApplyDiff",
            message:{
                filePath,
                diff,
                diffIdentifier,
                prompt,
                applyModel
            }
        },
            "editFileAndApplyDiffResponse"
        );
 } 
}

export default cbutils;