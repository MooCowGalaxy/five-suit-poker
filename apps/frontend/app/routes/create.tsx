import type { Route } from './+types/create';
import { MainContainer } from '~/components/MainContainer';
import { useEffect, useState } from 'react';
import { useRoom } from '~/providers/ColyseusProvider';
import { Button } from '~/components/ui/button';
import { Link, useNavigate } from 'react-router';

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Create Five Suit Poker Room" },
        { name: "description", content: "five suit poker :)" },
    ];
}

export default function CreateRoom() {
    const { join, joinError } = useRoom();
    const navigate = useNavigate();
    const [first, setFirst] = useState<boolean>(true);

    useEffect(() => {
        if (first) {
            setFirst(false);
            join('', true).then((r) => {
                if (r) navigate(`/p/${r}`);
            });
        }
    }, [first]);

    return (
        <MainContainer>
            <div className="w-full max-w-md mx-4">
                {joinError ? (
                    <>
                        <p className="text-md text-center text-red-500 mb-4">Failed to create room, please try again later.</p>
                        <div className="mx-auto w-max">
                            <Button asChild variant="outline">
                                <Link to="/">Go Back</Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className="text-md text-center font-semibold animate-pulse">Creating room...</p>
                )}
            </div>
        </MainContainer>
    );
}