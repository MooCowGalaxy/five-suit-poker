import { Schema, type } from '@colyseus/schema';
import { Card } from './Card';
import { shuffle } from '../../utils';

export type TDeck = {
    remainingCards: number;
};

export class Deck extends Schema {
    @type('uint8') remainingCards: number;
    cards: Card[];

    constructor() {
        super();
        this.reset();
    }

    reset(decks: number = 1) {
        this.cards = [];

        for (let i = 0; i < decks; i++) {
            for (let value = 1; value <= 13; value++) {
                for (let suit = 0; suit <= 4; suit++) {
                    this.cards.push(new Card(value, suit));
                }
            }
        }

        // shuffle
        shuffle(this.cards);
        this.remainingCards = this.cards.length;
    }

    draw(): Card | null {
        if (this.remainingCards === 0) return null;

        this.remainingCards--;
        return this.cards.pop();
    }
}