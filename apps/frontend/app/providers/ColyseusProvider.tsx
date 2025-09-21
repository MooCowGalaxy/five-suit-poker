import React, { createContext, useContext } from 'react';
import { Client, Room } from 'colyseus.js';
import type { FiveSuitsState } from "@c4n/gameserver/src/rooms/schema/FiveSuitsState";
import { BACKEND_BASE_URL } from '~/env';
import { getToken, getUsername } from '~/lib/utils';
import { toast } from 'sonner';

const client = new Client(BACKEND_BASE_URL);

interface RoomContextType {
    isConnecting: boolean;
    isConnected: boolean;
    room: Room;
    join: (roomId: string, create: boolean) => Promise<string | undefined>;
    joinError: boolean;
    state?: FiveSuitsState;
}

export const RoomContext = createContext<RoomContextType>({} as RoomContextType);

export function useRoom() {
    return useContext(RoomContext);
}

let room!: Room;

// Workaround for React.StrictMode, to avoid multiple join requests
let hasActiveJoinRequest: boolean = false;

export function RoomProvider({ children }: { children: React.ReactNode }) {
    const [joinError, setJoinError] = React.useState(false);
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [isConnected, setIsConnected] = React.useState(false);
    const [state, setState] = React.useState<ReturnType<FiveSuitsState['toJSON']>>();

    const join = async (roomId: string, create: boolean = false) => {
        if (hasActiveJoinRequest) {
            return;
        }
        hasActiveJoinRequest = true;

        setJoinError(false);
        setIsConnecting(true);
        setIsConnected(false);

        const joinOptions = {
            token: getToken(),
            username: getUsername()
        };

        let resolve: (value: unknown) => void = () => {};
        let reject: (error: unknown) => void = () => {};
        toast.promise(new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        }), {
            loading: create ? 'Creating room...' : 'Joining room...',
            success: 'Joined room!',
            error: (e) => `${e}`
        });

        try {
            if (create) {
                room = await client.create('five-suits', joinOptions);
            } else {
                room = await client.joinById(roomId, joinOptions);
            }
            setJoinError(false);
            resolve(true);
        } catch (e) {
            setJoinError(true);
            setIsConnecting(false);
            reject((e as any).toString());
            hasActiveJoinRequest = false;
            return;
        }

        localStorage.setItem("reconnection", JSON.stringify({
            token: room.reconnectionToken,
            roomId: room.roomId,
        }));

        room.onStateChange((state) => {
            console.log(state);
            setState(state.toJSON());
        });
        room.onLeave(() => setIsConnected(false));

        hasActiveJoinRequest = false;
        setIsConnecting(false);
        setIsConnected(true);
        return room.roomId;
    };

    return (
        <RoomContext.Provider value={{ isConnecting, isConnected, room, join, joinError, state: state as (FiveSuitsState | undefined) }}>
            {children}
        </RoomContext.Provider>
    );
}