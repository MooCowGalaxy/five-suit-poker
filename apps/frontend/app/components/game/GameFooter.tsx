import type { Room } from 'colyseus.js';
import type { TFiveSuitsState } from '@c4n/gameserver/src/rooms/schema/FiveSuitsState';
import type { TPlayer } from '@c4n/gameserver/src/rooms/entities/Player';
import { useEffect, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

export default function GameFooter({ room, state, selfPlayer }: { room: Room, state: TFiveSuitsState, selfPlayer: TPlayer }) {
    const { game } = state;
    const isMyTurn = game.players[game.playerTurn]?.playerId === selfPlayer.playerId && game.gameState > 0 && game.gameState < 5;
    const myBet = game.playerBets[selfPlayer.playerId.toString()] || 0;
    const callAmount = Math.min(selfPlayer.chips, game.currentBet - myBet);

    const [isRaising, setIsRaising] = useState(false);
    const [raiseAmount, setRaiseAmount] = useState(game.currentBet + state.config.minRaise);

    useEffect(() => {
        if (!isMyTurn) {
            setIsRaising(false);
        }

        setRaiseAmount(Math.min(selfPlayer.chips + myBet, state.config.minRaise));
    }, [isMyTurn, game.currentBet]);

    const handleAction = (action: string, amount?: number) => {
        room.send('action', { action, amount });
        setIsRaising(false);
    };

    const handleRaiseValueChange = (delta: number) => {
        setRaiseAmount(prev => Math.max(0, prev + delta));
    };

    // view for when not current turn
    if (!isMyTurn) {
        return (
            <div className="w-full flex justify-center items-center gap-4">
                <div className="text-center">
                    <p className="text-sm text-gray-400">Your Chips</p>
                    <p className="font-bold text-lg text-green-400">${selfPlayer.chips}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-400">Your Bet</p>
                    <p className="font-bold text-lg text-red-400">${myBet}</p>
                </div>
            </div>
        );
    }

    // when player is raising
    if (isRaising) {
        return (
            <div className="w-full flex flex-col items-center gap-2">
                <div className="flex flex-row items-center gap-2">
                    <span className="font-bold text-lg">$</span>
                    <Input
                        type="number"
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)}
                        className="w-32 text-center text-lg font-bold"
                    />
                </div>
                <div className="flex flex-row gap-2">
                    {[-100, -50, -10].map(val => (
                        <Button key={val} variant="outline" size="sm" onClick={() => handleRaiseValueChange(val)}>{val}</Button>
                    ))}
                    {[10, 50, 100].map(val => (
                        <Button key={val} variant="outline" size="sm" onClick={() => handleRaiseValueChange(val)}>+{val}</Button>
                    ))}
                </div>
                <div className="flex flex-row gap-2 mt-2">
                    <Button
                        onClick={() => handleAction('raise', raiseAmount)}
                        disabled={raiseAmount <= game.currentBet || raiseAmount > (selfPlayer.chips + myBet)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Raise to ${raiseAmount}
                    </Button>
                    <Button variant="ghost" onClick={() => setIsRaising(false)}>Cancel</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center items-center gap-4">
            <div className="text-center">
                <p className="text-sm text-gray-400">Your Chips</p>
                <p className="font-bold text-lg text-green-400">${selfPlayer.chips}</p>
            </div>
            <div className="flex flex-row gap-2">
                <Button variant="destructive" onClick={() => handleAction('fold')}>Fold</Button>
                {callAmount > 0 ? (
                    <Button variant="outline" onClick={() => handleAction('call')} disabled={selfPlayer.chips < callAmount}>
                        Call ${callAmount}
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => handleAction('check')}>Check</Button>
                )}
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsRaising(true)}
                    disabled={selfPlayer.chips <= callAmount} // Cannot raise if you can't even call
                >
                    Raise
                </Button>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-400">Your Bet</p>
                <p className="font-bold text-lg text-red-400">${myBet}</p>
            </div>
        </div>
    );
};