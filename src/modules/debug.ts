import cbws from './websocket';

export enum logType{
    info="info",
    error="error",
    warning="warning"
}


export const debug={
    debug(log:string,type:logType) {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "debugEvent",
                message:{
                   log,
                   type
                }
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "debugEventResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            })
        })
      

    }
}


export default debug;


