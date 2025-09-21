import type { TPlayer } from '@c4n/gameserver/src/rooms/entities/Player';

export default function LobbyGroup({ players, name }: { players: TPlayer[], name: string }) {
    return (
        <div className="grid gap-1">
            <p>{name} <span className="text-gray-500">&mdash;</span> {players.length}</p>
            {players.map(p => {
                return <div key={p.playerId} className="rounded-md border border-gray-800 p-2">
                    <p>{p.username} {p.self && <span className="text-gray-500">(you)</span>}</p>
                </div>;
            })}
        </div>
    );
}