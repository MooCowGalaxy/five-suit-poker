import { Schema, type } from '@colyseus/schema';

export class RoomConfig extends Schema {
    @type('uint32') startingChips: number = 1000;
    @type('uint32') blind: number = 50;
    @type('uint8') timePerTurn: number = 10;

    setRule(rule: string, value: number) {
        switch (rule) {
            case 'startingChips':
                this.startingChips = value;
                break;
            case 'blind':
                this.blind = value;
                break;
            case 'timePerTurn':
                this.timePerTurn = value;
                break;
        }
    }
}