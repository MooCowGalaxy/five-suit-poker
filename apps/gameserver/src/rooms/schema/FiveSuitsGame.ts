import { ArraySchema, Schema, type } from '@colyseus/schema';
import { Player } from '../entities/Player';
import { RoomConfig } from './RoomConfig';
import { shuffle } from '../../utils';

export class FiveSuitsGame extends Schema {
    @type([Player]) players: ArraySchema<Player> = new ArraySchema<Player>();
    @type('uint8') playerTurn: number = 0;
    config: RoomConfig;

    constructor(players: Player[], config: RoomConfig) {
        super();
        this.players.push(...players);
        this.config = config;
        this.setup();
    }

    setup() {
        this.players.forEach(player => {
            player.reset(this.config.startingChips);
        });
        shuffle(this.players);
    }
}