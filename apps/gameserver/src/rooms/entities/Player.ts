import { Schema, type, view, ArraySchema } from '@colyseus/schema';
import { Client } from '@colyseus/core';
import { Card } from './Card';
import { isDrain, findBestFlush, findBestStraight, findBestFullHouseDrain } from '../../utils';

export class Player extends Schema {
    client: Client;
    token: string;
    @type('boolean') connected: boolean;
    @type('number') playerId: number;
    @type('string') username: string;
    @type('boolean') ready: boolean = false;
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

    detectHand(community: Card[], drain: boolean = true): [number, number] {
        const combined = [...community, ...this.cards];

        // precompute count of cards by rank and suit
        const rankCount = new Map<number, Card[]>();
        const suitCount = new Map<number, Card[]>();
        for (const card of combined) {
            rankCount.set(card.value, [...(rankCount.get(card.value) || []), card]);
            suitCount.set(card.suit, [...(suitCount.get(card.suit) || []), card]);
        }

        // sorted by frequency (most common first)
        const rankSortedFreq = Array.from(rankCount.entries()).sort((a, b) => b[1].length - a[1].length);
        const suitSortedFreq = Array.from(suitCount.entries()).sort((a, b) => b[1].length - a[1].length);

        // pre-evaluate for straights and flushes
        const bestStraightCards = findBestStraight(combined);
        const bestFlushCards = findBestFlush(suitSortedFreq);

        // 12: five of a kind
        if (rankSortedFreq[0]?.[1].length >= 5) {
            return [12, rankSortedFreq[0][1][0].sortValue];
        }

        // 11: straight flush
        if (bestStraightCards && bestFlushCards) {
            const flushSuit = bestFlushCards[0].suit;
            // check if the cards forming the best straight are all of the flush suit
            if (bestStraightCards.every(c => c.suit === flushSuit)) {
                return [11, bestStraightCards[0].sortValue];
            }
        }

        // 10: four of a kind
        if (rankSortedFreq[0]?.[1].length >= 4) {
            return [10, rankSortedFreq[0][1][0].sortValue];
        }

        // 9: straight drain
        if (drain && bestStraightCards && isDrain(bestStraightCards)) {
            return [9, bestStraightCards[0].sortValue];
        }

        // 8: full house drain
        if (drain) {
            const fhdHighCard = findBestFullHouseDrain(combined);
            if (fhdHighCard) {
                return [8, fhdHighCard.sortValue];
            }
        }

        // 7: flush
        if (bestFlushCards) {
            return [7, bestFlushCards[0].sortValue];
        }

        // 6: full house
        const trips = rankSortedFreq.filter(entry => entry[1].length >= 3);
        const pairs = rankSortedFreq.filter(entry => entry[1].length >= 2);
        if (trips.length > 0 && pairs.length > 1) { // 555 forms both a triple and pair, so we need at least two pairs
            // find best trip (sorted by rank)
            trips.sort((a, b) => (b[0]===1 ? 14 : b[0]) - (a[0]===1 ? 14 : a[0]));
            return [6, trips[0][1][0].sortValue];
        }

        // 5: straight
        if (bestStraightCards) {
            return [5, bestStraightCards[0].sortValue];
        }

        // 4: three of a kind
        if (rankSortedFreq[0]?.[1].length >= 3) {
            return [4, rankSortedFreq[0][1][0].sortValue];
        }

        // 3: two pair
        if (rankSortedFreq[0]?.[1].length >= 2 && rankSortedFreq[1]?.[1].length >= 2) {
            const pair1Val = rankSortedFreq[0][0];
            const pair2Val = rankSortedFreq[1][0];
            const highPairRank = Math.max(pair1Val === 1 ? 14 : pair1Val, pair2Val === 1 ? 14 : pair2Val);
            const highPairVal = highPairRank === 14 ? 1 : highPairRank;
            const highPairCard = combined.find(c => c.value === highPairVal);
            return [3, highPairCard.sortValue];
        }

        // 2: pair
        if (rankSortedFreq[0]?.[1].length >= 2) {
            return [2, rankSortedFreq[0][1][0].sortValue];
        }

        // 1: high card
        const sortedCombined = combined.sort((a, b) => b.sortValue - a.sortValue);
        return [1, sortedCombined[0].sortValue];
    }
}