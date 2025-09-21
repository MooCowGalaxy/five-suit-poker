import type { Route } from './+types/join';
import { MainContainer } from '~/components/MainContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { useRoom } from '~/providers/ColyseusProvider';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Join Five Suit Poker Room" },
        { name: "description", content: "five suit poker :)" },
    ];
}

export default function JoinRoom() {
    const [roomCode, setRoomCode] = useState<string>('');
    const { join, isConnecting } = useRoom();
    const navigate = useNavigate();

    const onRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomCode(e.currentTarget.value);
    };

    const onRoomCodeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSave();
        }
    };

    const isValid = (roomCode: string): boolean => {
        return /^[A-Z0-9]{4}$/.test(roomCode);
    };

    const onSave = () => {
        if (isValid(roomCode)) {
            join(roomCode, false).then((r) => {
                if (r) navigate(`/p/${r}`);
            });
        }
    };

    return (
        <MainContainer>
            <div className="w-full max-w-md mx-4">
                <Card>
                    <Link to="/">
                        <span className="flex flex-row items-center gap-1 border-b border-b-gray-600 w-max ml-6 -mb-2">
                            <ArrowLeft className="h-3 w-3" />
                            <span className="text-xs">Back</span>
                        </span>
                    </Link>
                    <CardHeader>
                        <CardTitle>Join Room</CardTitle>
                        <CardDescription>Enter the room code below to join the room.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="roomId">Room Code</Label>
                            <Input id="roomId" name="roomId" value={roomCode} onInput={onRoomCodeChange} onKeyDown={onRoomCodeKey} disabled={isConnecting} />
                        </div>
                        <Button type="submit" disabled={isConnecting || !isValid(roomCode)} onClick={onSave}>Join</Button>
                    </CardContent>
                </Card>
            </div>
        </MainContainer>
    );
}