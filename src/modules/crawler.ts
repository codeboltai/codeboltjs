import cbws from './websocket';
import CbWS from './websocket';

class CustomEventEmitter extends EventEmitter { }
import { EventEmitter } from 'events';
/**
 * A module for controlling a web crawler through WebSocket messages.
 */
class Crawler{
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
    /**
     * Starts the crawler.
     */
    start=()=> {
       this.wsManager.send(JSON.stringify({
            "type": "crawlerEvent",
            action: 'start'
        }));
    }
    /**
     * Takes a screenshot using the crawler.
     */
    screenshot=()=> {
       this.wsManager.send(JSON.stringify({
            "type": "crawlerEvent",
            action: 'screenshot'
        }));
    }
    /**
     * Directs the crawler to navigate to a specified URL.
     * @param url - The URL for the crawler to navigate to.
     */
    goToPage= (url: string) => {
       this.wsManager.send(JSON.stringify({
            "type": "crawlerEvent",
            action: 'goToPage',
            url
        }));
    }
    /**
     * Scrolls the crawler in a specified direction.
     * @param direction - The direction to scroll ('up', 'down', 'left', 'right').
     */
    scroll= (direction: string) => {
       this.wsManager.send(JSON.stringify({
            "type": "crawlerEvent",
            action: 'scroll',
            direction
        }));
    }
    /**
     * Simulates a click event on an element with the specified ID.
     * @param id - The ID of the element to be clicked.
     * @returns {Promise<any>} A promise that resolves when the click action is complete.
     */
    click= (id: string) => {
        return new Promise((resolve, reject) => {
           this.wsManager.send(JSON.stringify({
                "type": "crawlerEvent",
                action: 'click',
                id
            }));
           this.wsManager.on( (data: string) => {
                const response = JSON.parse(data);
                if (response.event === "clickFinished") {
                    resolve(response);
                }
            });
        });
    }
    /**
     * Types the provided text into an element with the specified ID.
     * @param id - The ID of the element where text will be typed.
     * @param text - The text to type into the element.
     * @returns {Promise<any>} A promise that resolves when the type action is complete.
     */
    type= (id: string, text: string) => {
        return new Promise((resolve, reject) => {
           this.wsManager.send(JSON.stringify({
                "type": "crawlerEvent",
                action: 'type',
                id,
                text
            }));
           this.wsManager.on( (data: string) => {
                const response = JSON.parse(data);
                if (response.event === "typeFinished") {
                    resolve(response);
                }
            });
        });
    }
    /**
     * Simulates the Enter key press using the crawler.
     */
    enter=()=> {
       this.wsManager.send(JSON.stringify({
            "type": "crawlerEvent",
            action: 'enter'
        }));
    }
    /**
     * Initiates a crawl process.
     */
    crawl= (query:string) => {
        return new Promise((resolve, reject) => {
            this.wsManager.send(JSON.stringify({
                "type": "crawlerEvent",
                "action": 'crawl',
                "message":{
                    query
                }
            }));
            this.wsManager.on( (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "crawlResponse") {
                    resolve(response); // Resolve the Promise with the response data
                } 
            });
        });
  
    }
};

export default Crawler;
