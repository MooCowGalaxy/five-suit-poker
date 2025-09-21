import { Client } from "@colyseus/core";
import { Schema, type, MapSchema, StateView } from "@colyseus/schema";
import { Player, TPlayer } from '../entities/Player';
import { DisconnectCode } from '../../constants';
import { validateToken, validateUsername } from '../../utils';
import { FiveSuits } from '../FiveSuits';
import { RoomConfig, TRoomConfig } from './RoomConfig';
import { Clock, Delayed } from 'colyseus';
import { FiveSuitsGame, TFiveSuitsGame } from './FiveSuitsGame';

export type TFiveSuitsState = {
    roomState: string;
    roomCountdown: number;
    players: { [key: string]: TPlayer };
    game: TFiveSuitsGame;
    config: TRoomConfig;
};

const COUNTDOWN_TIMER = 3;

export class FiveSuitsState extends Schema {
    room: FiveSuits;
    clock: Clock;
    playerIdCounter: number = 0;
    countdownInterval: Delayed;
    tokenPlayerIdMap: { [key: string]: number } = {};
    @type("string") roomState: string = 'lobby'; // lobby, countdown, or game
    @type("int8") roomCountdown: number = -1; // tenths of a second
    @type({ map: Player }) players = new MapSchema<Player>();
    @type(FiveSuitsGame) game: FiveSuitsGame;
    @type(RoomConfig) config: RoomConfig = new RoomConfig();

    generatePlayerId(token: string): number {
        return this.tokenPlayerIdMap[token] !== undefined ? this.tokenPlayerIdMap[token] : this.playerIdCounter++;
    }

    getPlayer(sessionId: string): Player | null {
        return this.players.values().find(player => player.client.sessionId === sessionId) || null;
    }

    checkForCountdown(reset: boolean = false) {
        if (this.roomState === 'game') return;

        if (this.players.values().every(player => !player.connected || player.spectator || player.ready) &&
            this.players.values().filter(p => p.connected && !p.spectator && p.ready).toArray().length >= 2) {
            if (this.roomState === 'countdown' && !reset) return;

            this.roomCountdown = COUNTDOWN_TIMER;
            this.roomState = 'countdown';
            this.countdownInterval?.clear();
            this.countdownInterval = this.clock.setInterval(this.countdownTick.bind(this), 1000);
        } else {
            this.roomCountdown = -1;
            this.roomState = 'lobby';
            this.countdownInterval?.clear();
        }
    }

    countdownTick() {
        if (this.roomState !== 'countdown') {
            this.countdownInterval?.clear();
            return;
        }

        if (this.roomCountdown > 0) {
            this.roomCountdown--;
        } else if (this.roomCountdown === 0) {
            this.countdownInterval?.clear();
            this.roomCountdown = -1;
            this.roomState = 'game';
            this.game = new FiveSuitsGame([...this.players.values().filter(player => player.ready)], this.config, this.clock);
        } else {
            this.countdownInterval?.clear();
        }
    }

    createPlayer(client: Client, options: any) {
        if (!options.token || typeof options.token !== 'string' || !validateToken(options.token) ||
            !options.username || typeof options.username !== 'string' || !validateUsername(options.username)) {
            client.leave(DisconnectCode.BAD_AUTH);
            return;
        }

        let existingPlayer = this.players.values().find(player => player.token === options.token);
        let playerId: number;
        if (!existingPlayer) {
            playerId = this.generatePlayerId(options.token);
            existingPlayer = new Player(client, options.token, options.username, playerId);
            this.players.set(playerId.toString(), existingPlayer);
        } else {
            if (existingPlayer.connected) {
                existingPlayer.client.leave(DisconnectCode.NEW_CONNECTION);
            }

            existingPlayer.client = client;
            existingPlayer.connected = true;
            playerId = existingPlayer.playerId;
        }

        client.view = new StateView(true);
        client.view.add(this.players.get(playerId.toString()));
        existingPlayer.ready = false;
        this.checkForCountdown(true);

        if (this.roomState === 'game' && !this.game.players.some(player => player.playerId === existingPlayer.playerId)) {
            // we are currently in a game, but new player is spectating
            existingPlayer.spectator = true;
        }
    }

    removePlayer(client: Client, _consented: boolean) {
        const existingPlayer = this.players.values().find(player => player.client.sessionId === client.sessionId);
        if (!existingPlayer) return;

        existingPlayer.connected = false;

        if (this.roomState === 'lobby' || this.roomState === 'countdown') {
            if (existingPlayer.ready) {
                existingPlayer.ready = false;
                this.checkForCountdown(true);
            }
        }
        if (existingPlayer.spectator) {
            this.players.delete(existingPlayer.playerId.toString());
            return;
        }
    }

    onReady(sessionId: string, { ready }: { ready: boolean }) {
        const player = this.getPlayer(sessionId);
        if (!player) return;

        player.ready = !!ready;

        this.checkForCountdown();
    }

    onSpectate(sessionId: string, { spectate }: { spectate: boolean }) {
        const player = this.getPlayer(sessionId);
        if (!player) return;

        player.spectator = !!spectate;
        if (player.spectator) {
            player.ready = false;
        }

        this.checkForCountdown();
    }

    setConfig(sessionId: string, { rule, value }: { rule: string, value: number }) {
        const player = this.getPlayer(sessionId);
        if (!player) return;
        if (player.playerId !== 0) return; // basic check for admin
        if (!rule || rule?.length > 20) return;
        if (this.roomState !== 'lobby') return;

        this.config.setRule(rule, value);
    }

    onMessage(sessionId: string, { message }: { message: string }) {
        const player = this.getPlayer(sessionId);
        if (!player) return;
        if (!message || message.length > 250) return;

        this.room.broadcast('message', {
            playerId: player.playerId,
            username: player.username,
            message
        });
    }

    onAction(sessionId: string, { action, amount }: { action: string; amount: number }) {
        const player = this.getPlayer(sessionId);
        if (!player) return;
        if (!action || action.length > 20) return;

        this.game?.handlePlayerAction(player.playerId, action, amount);
    }
}
