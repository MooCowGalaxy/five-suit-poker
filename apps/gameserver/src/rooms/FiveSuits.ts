import { Client, Room } from "@colyseus/core";
import { FiveSuitsState } from "./schema/FiveSuitsState";
import { generateRoomId } from "../utils";

export class FiveSuits extends Room<FiveSuitsState> {
    state = new FiveSuitsState();

    onCreate(_options: any) {
        this.roomId = generateRoomId();
        this.state.room = this;
        this.state.clock = this.clock;
        this.clock.start();

        const eventHandlers = {
            ready: this.state.onReady,
            setConfig: this.state.setConfig,
            message: this.state.onMessage,
        };

        for (const [eventName, handler] of Object.entries(eventHandlers)) {
            this.onMessage(eventName, (client, data) => {
                handler.bind(this.state)(client.sessionId, data);
            });
        }
    }

    onJoin(client: Client, options: any) {
        this.state.createPlayer(client, options);
    }

    onLeave(client: Client, consented: boolean) {
        this.state.removePlayer(client, consented);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
