import { Schema, type } from '@colyseus/schema';

export class RoomConfig extends Schema {
    @type('uint32') startingChips: number = 1000;
    @type('uint32') blind: number = 50;
    @type('uint8') timePerTurn: number = 10;

    private inRange(value: number, min: number, max: number) {
        return value >= min && value <= max;
    }

    setRule(rule: string, value: number) {
        value = Math.round(value);
        switch (rule) {
            case 'startingChips':
                if (!this.inRange(value, 100, 10000)) return;
                this.startingChips = value;
                break;
            case 'blind':
                if (!this.inRange(value, 100, 10000)) return;
                this.blind = value;
                break;
            case 'timePerTurn':
                if (!this.inRange(value, 2, 20)) return;
                this.timePerTurn = value;
                break;
        }
    }
}