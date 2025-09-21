import type { TPlayer } from '@c4n/gameserver/src/rooms/entities/Player';
import type { TFiveSuitsState } from '@c4n/gameserver/src/rooms/schema/FiveSuitsState';
import { useMemo, useState } from 'react';
import { GameState } from '@c4n/gameserver/src/rooms/schema/FiveSuitsGame';
import { FileX } from 'lucide-react';
import { Card, BlankCard } from '~/components/game/Card';
import { Progress } from '~/components/ui/progress';

const gameStateMap: { [key in GameState]: string } = {
    [GameState.PRE_HAND]: 'Dealing...',
    [GameState.PRE_FLOP]: 'Pre-Flop',
    [GameState.FLOP]: 'Flop',
    [GameState.TURN]: 'Turn',
    [GameState.RIVER]: 'River',
    [GameState.SHOWDOWN]: 'Showdown',
    [GameState.WINNER]: 'Showdown'
};

export default function GameView({ state, selfPlayer }: { state: TFiveSuitsState, selfPlayer: TPlayer }) {
    const { game } = state;
    const [isRevealing, setIsRevealing] = useState(false);

    const currentPlayer = game.players[game.playerTurn];

    // find next player who hasn't folded for the "upcoming player" text
    const nextPlayer = useMemo(() => {
        if (!game || game.players.length === 0) return null;
        let nextIndex = (game.playerTurn + 1) % game.players.length;
        let loopGuard = 0; // prevent infinite loops if all others folded
        while (game.playerFolded[game.players[nextIndex].playerId.toString()] && loopGuard < game.players.length) {
            nextIndex = (nextIndex + 1) % game.players.length;
            loopGuard++;
        }
        return nextIndex === game.playerTurn ? null : game.players[nextIndex];
    }, [game]);

    const otherPlayers = game.players.filter(p => p.playerId !== selfPlayer.playerId);
    const timerPercentage = (game.timeRemaining / state.config.timePerTurn) * 100;

    // todo: hide everything during showdown; create completely separate view

    return (
        <div className="h-full flex flex-col p-4 gap-4 text-white">
            {/* turn and timer */}
            <div className="flex-initial">
                <div className="text-center mb-2">
                    <p className="font-bold text-lg">{gameStateMap[game.gameState]}</p>
                    <p className="text-sm text-gray-400">
                        Turn: <span className="font-semibold text-yellow-400">{currentPlayer?.username}</span>
                        {nextPlayer && ` (Up next: ${nextPlayer.username})`}
                    </p>
                </div>
                <Progress value={timerPercentage} className={`w-full ${game.gameState > 0 && game.gameState < 5 ? '' : 'opacity-0'}`} />
            </div>

            {/* community cards */}
            <div className="flex-initial flex flex-col items-center gap-2">
                <div className="flex flex-row gap-2 h-24 items-center">
                    {game.communityCards.map((card, index) => (
                        <Card key={index} suit={card.suit} value={card.value} />
                    ))}
                    {Array(5 - game.communityCards.length).fill(0).map((_, index) => (
                        <BlankCard key={`blank-${index}`} />
                    ))}
                </div>
                <div className="text-center">
                    <p className="text-gray-300">Pot: <span className="font-bold text-green-400">${game.pot}</span></p>
                    <p className="text-gray-300">Current Bet: <span className="font-bold text-red-400">${game.currentBet}</span></p>
                </div>
            </div>

            {/* players */}
            <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 content-start overflow-y-auto">
                {otherPlayers.map(player => (
                    <div key={player.playerId} className="flex flex-col items-center gap-1 p-2 border border-gray-700 rounded-lg bg-gray-800/50">
                        <div className="flex flex-row items-center gap-2">
                            {game.playerFolded[player.playerId.toString()] && <FileX className="w-4 h-4 text-red-500" />}
                            <p className="font-semibold truncate">{player.username}</p>
                        </div>
                        <p className="text-sm text-green-400">${player.chips}</p>
                        <div className="flex flex-row gap-1 mt-1">
                            {new Array(2).fill(<BlankCard />).map((cur, index) => {
                                console.log(player.publicCards);
                                return player.publicCards[index] ? <Card value={player.publicCards[index].value} suit={player.publicCards[index].suit} /> : cur
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* self */}
            <div className="flex-initial flex flex-col items-center gap-1">
                <div
                    className="flex flex-row gap-2 cursor-pointer"
                    onPointerDown={() => setIsRevealing(true)}
                    onPointerUp={() => setIsRevealing(false)}
                    onMouseLeave={() => setIsRevealing(false)}
                >
                    {(isRevealing || (game.gameState >= GameState.SHOWDOWN && !game.playerFolded[selfPlayer.playerId])) ? (
                        selfPlayer.cards.map((card, index) => (
                            <Card key={index} suit={card.suit} value={card.value} />
                        ))
                    ) : (
                        selfPlayer.cards.map((_, index) => (
                            <BlankCard key={index} />
                        ))
                    )}
                </div>
                <p className="text-xs text-gray-500">Hold to reveal</p>
            </div>
        </div>
    );
};