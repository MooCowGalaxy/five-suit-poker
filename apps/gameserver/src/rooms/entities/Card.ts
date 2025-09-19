import { Schema, type } from '@colyseus/schema';

export class Card extends Schema {
    @type('uint8') value: number; // 1: ace, 2-10: number, 11-13: face
    @type('uint8') suit: number; // 0: moon, 1: diamonds, 2: clubs, 3: hearts, 4: spades

    constructor(value: number, suit: number) {
        super();
        this.value = value;
        this.suit = suit;
    }

    get sortValue(): number {
        return (this.value === 1 ? 14 : this.value) * 5 + this.suit;
    }
}