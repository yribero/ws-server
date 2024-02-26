import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage, ClientRequest } from 'http';

export default class RandomWs {

    private static nextId = 0;

    private port: number;
    private wss: WebSocketServer;

    private sockets: {
        "id": number,
        "ws": WebSocket
    } [] = [];

    constructor(port: number) {
        this.port = port;
    }

    public stop(): void {
        this.wss.close(e => {
            console.error('While closing the server', e);
        })
    }

    public start() {
        this.wss = new WebSocketServer({ port: this.port });

        console.log('listening on port: ' + this.port);

        const message = JSON.stringify({"message": "random"});

        const sendMessageAfterRandomTime = (id: number, counter: number) => {
            const wsRecord = this.sockets.find(s => s.id === id);

            if (wsRecord == null) {
                return;
            }

            setTimeout(() => {
                wsRecord.ws.send(JSON.stringify({"message": "random", "id": counter}));
                sendMessageAfterRandomTime(id, counter + 1);
            }, 1000 + Math.random() * 5000);
        }

        this.wss.on('connection', (ws: WebSocket, request: any) => {
            const id = RandomWs.nextId++;

            this.sockets.push({id, ws});

            ws.on('message', (... args) => {
                try {
                    this.onMessage(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('close', (... args) => {
                try {
                    this.onClose(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('error', (... args) => {
                try {
                    this.onError(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('upgrade', (... args) => {
                try {
                    this.onUpgrade(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('open', (... args) => {
                try {
                    this.onOpen(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('ping', (... args) => {
                try {
                    this.onPing(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('pong', (... args) => {
                try {
                    this.onPong(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('unexpected-response', (... args) => {
                try {
                    this.onUnexpectedResponse(id, ws, ...args);
                } catch (e) {
                    console.error(e);
                }
            });

            console.log('new client connected!');

            ws.send(JSON.stringify({"message": "connected"}));

            sendMessageAfterRandomTime(id, 1);
        });
    }

    private closeClientSocket(id: number) {
        const index = this.sockets.findIndex(record => record.id === id);

        if (index === -1) {
            console.log(`Client ${id} not found. Was it closed before?`);
            return;
        }

        const wsRecord = this.sockets[index];

        wsRecord.ws.close();

        this.sockets.splice(index, 1);
    }

    private onMessage(id: number, ws: WebSocket, message: WebSocket.RawData, isBinary: boolean) {
        console.log(`message (from ${id}, binary: ${!!isBinary}): ${message}`);
        ws.send(message);
    }

    private onClose(id: number, ws: WebSocket, code: number, reason: Buffer) {
        console.log(`Goodbye, ${id}. Code: ${code}, Reason: ${reason.toString()}`);

        this.closeClientSocket(id);
    }

    private onError(id: number, ws: WebSocket, err: Error) {
        console.error(`Error on socket ${id}`, err);
        this.closeClientSocket(id);
    }

    private onUpgrade(id: number, ws: WebSocket, im: IncomingMessage) {
        //TODO
    }

    private onOpen(id: number, ws: WebSocket) {
        //TODO
    }

    private onPing(id: number, ws: WebSocket, data: Buffer) {
        console.log('PING');
    }

    private onPong(id: number, ws: WebSocket, data: Buffer) {
        console.log('PONG');
    }

    private onUnexpectedResponse(id: number, ws: WebSocket, request: ClientRequest, response: IncomingMessage) {
        //TODO
    }
}