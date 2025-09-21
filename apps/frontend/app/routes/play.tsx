import type { Route } from './+types/play';
import { useRoom } from '~/providers/ColyseusProvider';
import LoadingScreen from '~/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { MainContainer } from '~/components/MainContainer';
import type { Player } from '@c4n/gameserver/src/rooms/entities/Player';
import LobbyGroup from '~/components/game/lobby/LobbyGroup';
import { Info } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Five Suit Poker" },
        { name: "description", content: "five suit poker :)" },
    ];
}

export default function Play({
    params,
}: Route.ComponentProps) {
    const { room, join, isConnecting, isConnected, joinError, state } = useRoom();
    const [firstConnect, setFirstConnect] = useState<boolean>(true);

    useEffect(() => {
        if (isConnected) setFirstConnect(true);
        else if (firstConnect && !isConnected && !isConnecting) {
            setFirstConnect(false);
            join(params.roomId, false);
        }
    }, [firstConnect, isConnected, isConnecting]);

    if (joinError) {
        return (
            <MainContainer>
                <div className="w-full max-w-md mx-4">
                    <p className="text-md text-center text-red-500 mb-4">Failed to join room, please try again later.</p>
                    <div className="mx-auto w-max flex flex-row gap-2">
                        <Button className="cursor-pointer" onClick={() => {
                            join(params.roomId, false);
                        }}>
                            Retry
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/">Go Back</Link>
                        </Button>
                    </div>
                </div>
            </MainContainer>
        );
    }

    const selfPlayer: Player = Object.values(state?.players || {}).find((p: Player) => p.self);

    if (!isConnected || !room || !state || !selfPlayer) {
        return <LoadingScreen message="Connecting..." />;
    }

    return (
        <main className="w-screen h-screen overflow-hidden bg-background flex flex-col monospace">
            {/* header */}
            <div className="p-2 border-b flex-initial flex flex-row gap-2 justify-center items-center align-middle">
                <span className="block rounded-full w-2 h-2 bg-green-500" />
                <button className="hover:underline cursor-pointer">{window.location.hostname}/p/{room.roomId}</button>
                <span className="text-gray-500">({Object.values(state.players).filter((p: Player) => p.connected).length})</span>
            </div>

            {/* main views */}
            <div className="flex-grow">
                {/* lobby */}
                {state.roomState === 'lobby' && (
                    <div className="p-2 grid gap-4">
                        <h1 className="text-center font-semibold text-2xl mb-4">Lobby</h1>
                        <LobbyGroup players={Object.values(state.players).filter((p: Player) => p.connected && p.ready && !p.spectator)} name="Ready" />
                        <LobbyGroup players={Object.values(state.players).filter((p: Player) => p.connected && !p.ready && !p.spectator)} name="Not ready" />
                        <LobbyGroup players={Object.values(state.players).filter((p: Player) => p.connected && p.spectator)} name="Spectating" />
                    </div>
                )}

                {/* countdown */}
                {state.roomState === 'countdown' && (
                    <div className="h-full grid justify-center items-center">
                        <div className="h-max">
                            <h1 className="text-center font-semibold text-xl text-gray-500">Game starts in</h1>
                            <p className="text-center font-bold text-4xl mb-8">{state.roomCountdown} seconds</p>
                            {selfPlayer.spectator && (<div className="border rounded-lg border-yellow-400 bg-yellow-600/25 px-4 py-2 flex flex-row items-center gap-2">
                                <Info className="w-4 h-4 text-yellow-200" />
                                <span>You are a spectator</span>
                            </div>)}
                        </div>
                    </div>
                )}
            </div>

            {/* bottom action bar */}
            <div className="flex-initial p-4 border-t flex gap-2">
                {/* lobby action bar */}
                {(state.roomState === 'lobby' || state.roomState === 'countdown') && (
                    <div className="flex flex-row gap-2 w-full justify-center">
                        {!selfPlayer.spectator &&
                            <Button
                                onClick={() => {
                                    room.send('ready', { ready: !selfPlayer.ready });
                                }}
                                variant={selfPlayer.ready ? 'destructive' : 'default'}
                                className={!selfPlayer.ready ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                            >
                                {selfPlayer.ready ? 'Cancel' : 'Ready'}
                            </Button>
                        }
                        {!selfPlayer.ready &&
                            <Button
                                variant={selfPlayer.spectator ? 'destructive' : 'outline'}
                                onClick={() => {
                                    room.send('spectate', { spectate: !selfPlayer.spectator });
                                }}
                            >
                                {selfPlayer.spectator ? 'Cancel' : 'Spectate'}
                            </Button>}
                    </div>
                )}
            </div>
        </main>
    );
}