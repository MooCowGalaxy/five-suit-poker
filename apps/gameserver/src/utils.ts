import { Card } from './rooms/entities/Card';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const validUsername = /^([a-zA-Z0-9]| |\.){1,18}$/;
const validToken = /^[a-zA-Z0-9]{32}$/;

export function generateRoomId(): string {
    return new Array(4).map(() => characters[Math.floor(Math.random() * characters.length)]).join('');
}

export function validateUsername(username: string): boolean {
    return validUsername.test(username);
}

export function validateToken(token: string) {
    return validToken.test(token);
}

export function shuffle(array: any[]) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

export function isDrain(cards: Card[]): boolean {
    if (cards.length !== 5) return false;
    const suits = new Set(cards.map(c => c.suit));
    return suits.size === 5;
}

export function findBestStraight(allCards: Card[]): Card[] | null {
    const uniqueCards = new Map<number, Card>();
    for (const card of allCards) {
        if (!uniqueCards.has(card.value)) {
            uniqueCards.set(card.value, card);
        }
    }
    if (uniqueCards.size < 5) return null;

    const ranks = [...uniqueCards.keys()].map(v => v === 1 ? 14 : v).sort((a, b) => b - a);
    let highRank = -1;

    // standard A-high to 6-high straights
    for (let i = 0; i <= ranks.length - 5; i++) {
        if (ranks[i] - ranks[i + 4] === 4) {
            highRank = ranks[i];
            break;
        }
    }

    // 5-high wheel straight (A-2-3-4-5)
    const hasWheel = ranks.includes(14) && ranks.includes(5) && ranks.includes(4) && ranks.includes(3) && ranks.includes(2);
    if (hasWheel && highRank < 5) {
        highRank = 5;
    }

    if (highRank === -1) return null;

    // reconstruct hand
    let straightRanks: number[];
    if (highRank === 5) { // wheel
        straightRanks = [5, 4, 3, 2, 1];
    } else { // normal
        straightRanks = [highRank, highRank - 1, highRank - 2, highRank - 3, highRank - 4]
            .map(r => r === 14 ? 1 : r);
    }
    return straightRanks.map(rank => uniqueCards.get(rank));
}

export function findBestFlush(suitSortedFreq: [number, Card[]][]): Card[] | null {
    if (suitSortedFreq[0]?.[1].length >= 5) {
        const flushCards = suitSortedFreq[0][1];
        // sort by value, return the top 5
        return flushCards
            .sort((a, b) => (b.value === 1 ? 14 : b.value) - (a.value === 1 ? 14 : a.value))
            .slice(0, 5);
    }
    return null;
}

export function findBestFullHouseDrain(allCards: Card[]): Card | null {
    const rankToCards = new Map<number, Card[]>();
    for (const card of allCards) {
        if (!rankToCards.has(card.value)) rankToCards.set(card.value, []);
        rankToCards.get(card.value).push(card);
    }

    const ranksByValue = [...rankToCards.keys()]
        .sort((a, b) => (b === 1 ? 14 : b) - (a === 1 ? 14 : a));

    const potentialTrips = ranksByValue.filter(r => rankToCards.get(r).length >= 3);
    const potentialPairs = ranksByValue.filter(r => rankToCards.get(r).length >= 2);

    for (const tripRank of potentialTrips) {
        for (const pairRank of potentialPairs) {
            if (tripRank === pairRank) continue;

            const tripCards = rankToCards.get(tripRank);
            const pairCards = rankToCards.get(pairRank);

            for (const c1 of tripCards) {
                for (const c2 of tripCards) {
                    if (c1 === c2) continue;
                    for (const c3 of tripCards) {
                        if (c1 === c3 || c2 === c3) continue;
                        const tripSuits = new Set([c1.suit, c2.suit, c3.suit]);
                        if (tripSuits.size !== 3) continue;

                        const availablePairCards = pairCards.filter(pc => !tripSuits.has(pc.suit));
                        if (availablePairCards.length >= 2) {
                            for (const p1 of availablePairCards) {
                                for (const p2 of availablePairCards) {
                                    if (p1 === p2) continue;
                                    if (p1.suit !== p2.suit) {
                                        // found full house drain
                                        return tripCards[0]; // high card of triple
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}

