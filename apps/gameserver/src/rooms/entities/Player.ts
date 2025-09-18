import { Schema, type, view, ArraySchema } from '@colyseus/schema';
import { Client } from '@colyseus/core';
import { Card } from './Card';

export class Player extends Schema {
    client: Client;
    token: string;
    @type('boolean') connected: boolean;
    @type('number') playerId: number;
    @type('string') username: string;
    @type('boolean') ready: boolean = false;
    @type('boolean') inGame: boolean = false;
    @type('boolean') spectator: boolean = false;
    @type('number') chips: number;
    @view() @type([Card]) cards: ArraySchema<Card> = new ArraySchema<Card>();
    @type([Card]) publicCards: ArraySchema<Card> = new ArraySchema<Card>();

    constructor(client: Client, token: string, username: string, playerId: number) {
        super();
        this.client = client;
        this.token = token;
        this.connected = true;
        this.playerId = playerId;
        this.username = username;
    }

    reset(startingChips: number) {
        this.chips = startingChips;
        this.cards.clear();
        this.publicCards.clear();
    }
}