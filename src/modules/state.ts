import cbws from './websocket';


const cbstate = {
    getApplicationState: async (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "getAppState",
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getAppStateResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    }
};

export default cbstate;

