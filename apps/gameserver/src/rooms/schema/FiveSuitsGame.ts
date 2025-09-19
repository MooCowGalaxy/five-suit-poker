import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { Player } from '../entities/Player';
import { RoomConfig } from './RoomConfig';
import { shuffle } from '../../utils';
import { Deck } from '../entities/Deck';
import { Card } from '../entities/Card';
import { Clock } from 'colyseus';

enum GameState {
    PRE_HAND = 0,
    PRE_FLOP = 1,
    FLOP = 2,
    TURN = 3,
    RIVER = 4,
    SHOWDOWN = 5,
}

export class FiveSuitsGame extends Schema {
    @type([Player]) players: ArraySchema<Player> = new ArraySchema<Player>();
    @type(Deck) deck: Deck = new Deck();
    @type('uint8') playerTurn: number = 0;
    config: RoomConfig;
    clock: Clock;

    @type('uint32') pot: number = 0;
    @type([Card]) communityCards: ArraySchema<Card> = new ArraySchema<Card>();
    @type('uint8') gameState: number = GameState.PRE_HAND;
    @type('uint8') dealerPosition: number = 0;
    @type('uint32') currentBet: number = 0;
    @type('int8') actionOn: number = -1; // index of player whose action would end the betting round
    @type({ map: 'uint32' }) playerBets = new MapSchema<number>();
    @type({ map: 'boolean' }) playerFolded = new MapSchema<boolean>();

    private turnTimeout: any;

    constructor(players: Player[], config: RoomConfig, clock: Clock) {
        super();
        this.players.push(...players);
        this.config = config;
        this.clock = clock;
        this.setup();
    }

    setup() {
        this.players.forEach(player => {
            player.reset(this.config.startingChips);
        });
        shuffle(this.players);
        // set the initial dealer to the last player in the shuffled array
        this.dealerPosition = this.players.length > 0 ? this.players.length - 1 : 0;
        this.startHand();
    }

    private startHand() {
        this.gameState = GameState.PRE_FLOP;
        this.pot = 0;
        this.deck.reset();
        this.communityCards.clear();
        this.playerBets.clear();
        this.playerFolded.clear();
        this.players.forEach(p => {
            p.cards.clear();
            p.publicCards.clear();
            this.playerFolded.set(p.playerId.toString(), false);
            this.playerBets.set(p.playerId.toString(), 0);
        });

        this.dealerPosition = (this.dealerPosition + 1) % this.players.length;

        const sbIndex = (this.dealerPosition + 1) % this.players.length;
        const bbIndex = (this.dealerPosition + 2) % this.players.length;

        this.postBlind(sbIndex, this.config.blind / 2);
        this.postBlind(bbIndex, this.config.blind);
        this.currentBet = this.config.blind;

        for (let i = 0; i < 2; i++) {
            for (const player of this.players) {
                player.cards.push(this.deck.draw());
            }
        }

        this.playerTurn = (bbIndex + 1) % this.players.length;
        this.actionOn = bbIndex; // betting ends when action gets back to big blind and bets are matched
        this.startTurn();
    }

    private postBlind(playerIndex: number, amount: number) {
        const player = this.players[playerIndex];
        const blindAmount = Math.min(player.chips, amount);
        player.chips -= blindAmount;
        this.pot += blindAmount;
        this.playerBets.set(player.playerId.toString(), blindAmount);
    }

    private startTurn() {
        // skip players who are folded or all-in
        while (this.playerFolded.get(this.players[this.playerTurn].playerId.toString()) || this.players[this.playerTurn].chips === 0) {
            if (this.playerTurn === this.actionOn) {
                this.clock.setTimeout(() => this.endBettingRound(), 100);
                return;
            }
            this.playerTurn = (this.playerTurn + 1) % this.players.length;
        }

        if (this.playerTurn === this.actionOn) {
            this.clock.setTimeout(() => this.endBettingRound(), 100);
            return;
        }

        this.turnTimeout = this.clock.setTimeout(() => {
            this.handlePlayerAction(this.players[this.playerTurn].playerId, 'fold', 0);
        }, this.config.timePerTurn * 1000);
    }

    handlePlayerAction(playerId: number, action: string, amount: number) {
        const playerIndex = this.players.findIndex(p => p.playerId === playerId);
        if (playerIndex !== this.playerTurn) return;

        if (this.turnTimeout) this.turnTimeout.clear();

        const player = this.players[playerIndex];
        const bet = this.playerBets.get(playerId.toString()) || 0;

        switch (action) {
            case 'fold':
                this.playerFolded.set(playerId.toString(), true);
                break;
            case 'call':
                const callAmount = Math.min(player.chips, this.currentBet - bet);
                player.chips -= callAmount;
                this.playerBets.set(playerId.toString(), bet + callAmount);
                this.pot += callAmount;
                break;
            case 'raise':
                const totalBet = amount;
                const raiseAmount = totalBet - bet;
                if (totalBet <= this.currentBet || player.chips < raiseAmount) return;

                player.chips -= raiseAmount;
                this.playerBets.set(playerId.toString(), totalBet);
                this.pot += raiseAmount;
                this.currentBet = totalBet;
                this.actionOn = playerIndex;
                break;
            case 'check':
                if (this.currentBet > bet) return;
                break;
            default:
                return;
        }

        const remainingPlayers = this.players.filter(p => !this.playerFolded.get(p.playerId.toString()));
        if (remainingPlayers.length <= 1) {
            this.endHand(remainingPlayers);
            return;
        }

        this.playerTurn = (this.playerTurn + 1) % this.players.length;
        this.startTurn();
    }

    private endBettingRound() {
        this.gameState++;
        this.playerBets.forEach((_, clientId) => this.playerBets.set(clientId, 0));
        this.currentBet = 0;
        this.actionOn = -1;

        if (this.gameState > GameState.RIVER) {
            this.showdown();
            return;
        }

        if (this.gameState === GameState.FLOP) {
            this.deck.draw(); // burn card
            this.communityCards.push(this.deck.draw(), this.deck.draw(), this.deck.draw());
        } else if (this.gameState === GameState.TURN || this.gameState === GameState.RIVER) {
            this.deck.draw(); // burn card
            this.communityCards.push(this.deck.draw());
        }

        this.playerTurn = (this.dealerPosition + 1) % this.players.length;
        this.actionOn = this.playerTurn;
        this.startTurn();
    }

    private showdown() {
        this.gameState = GameState.SHOWDOWN;
        const contenders = this.players.filter(p => !this.playerFolded.get(p.playerId.toString()));

        contenders.forEach(p => {
            p.cards.forEach(card => p.publicCards.push(card));
        });

        // check hands
        const winners = this.calculateWinners(contenders);
        this.endHand(winners);
    }

    private endHand(winners: Player[]) {
        if (winners.length > 0) {
            const prize = this.pot / winners.length;
            winners.forEach(winner => {
                winner.chips += prize;
            });
        }

        this.gameState = GameState.PRE_HAND;
        this.clock.setTimeout(() => this.startHand(), 5000);
    }

    private calculateWinners(contenders: Player[]): Player[] {
        // logic for determining value of hand, each player is assigned 2-length number array [hand, highCard], sorted by hand and then high card
        if (contenders.length === 1) return contenders;

        const playerHands: [Player, [number, number]][] = [];

        contenders.forEach(contender => {
            playerHands.push([contender, contender.detectHand(this.communityCards)]);
        });

        playerHands.sort((a, b) => {
            if (a[1][0] !== b[1][0]) return b[1][0] - a[1][0]; // sort by hand
            return b[1][1] - a[1][1]; // sort by high card
        });

        return playerHands.filter(p => p[1][0] === playerHands[0][1][0] && p[1][1] === playerHands[0][1][1]).map(p => p[0]);
    }
}