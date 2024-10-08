import CbWS from './websocket';

class CustomEventEmitter extends EventEmitter { }
import { EventEmitter } from 'events';

class CBKnowledge{
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }

}

export default CBKnowledge;
