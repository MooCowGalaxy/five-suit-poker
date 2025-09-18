import { Client } from "@colyseus/core";
import { Schema, type, MapSchema, StateView } from "@colyseus/schema";
import { Player } from '../entities/Player';
import { DisconnectCode } from '../../constants';
import { validateToken, validateUsername } from '../../utils';
import { FiveSuits } from '../FiveSuits';
import { RoomConfig } from './RoomConfig';
import { Clock } from 'colyseus';

export class FiveSuitsState extends Schema {
    room: FiveSuits;
    clock: Clock;
    playerIdCounter: number = 0;
    @type("string") roomState: string = 'lobby'; // lobby, countdown, or game
    @type("int8") roomCountdown: number = -1;
    @type({ map: Player }) players = new MapSchema<Player>();
    @type(RoomConfig) config: RoomConfig = new RoomConfig();

    createPlayer(client: Client, options: any) {
        if (!options.token || typeof options.token !== 'string' || !validateToken(options.token) ||
            !options.username || typeof options.username !== 'string' || !validateUsername(options.username)) {
            client.leave(DisconnectCode.BAD_AUTH);
            return;
        }

        const existingPlayer = this.players.values().find(player => player.token === options.token);
        let playerId: number;
        if (!existingPlayer) {
            playerId = this.playerIdCounter++;
            this.players.set(playerId.toString(), new Player(client, options.token, options.username, playerId));
        } else {
            if (existingPlayer.connected) {
                existingPlayer.client.leave(DisconnectCode.NEW_CONNECTION);
            }

            existingPlayer.client = client;
            existingPlayer.connected = true;
            playerId = existingPlayer.playerId;
        }

        client.view = new StateView();
        client.view.add(this.players.get(playerId.toString()));
    }

    removePlayer(client: Client, _consented: boolean) {
        const existingPlayer = this.players.values().find(player => player.client.sessionId === client.sessionId);
        if (!existingPlayer) return;

        existingPlayer.connected = false;

        if (this.roomState === 'lobby' || this.roomState === 'countdown') {
            existingPlayer.ready = false;
        }
        if (existingPlayer.spectator) {
            this.players.delete(existingPlayer.playerId.toString());
            return;
        }
    }

    onReady(sessionId: string, data: any) {

    }

    setConfig(sessionId: string, data: any) {

    }

    onMessage(sessionId: string, data: any) {

    }
}
