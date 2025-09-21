import type { Route } from "./+types/home";
import { MainContainer } from "~/components/MainContainer";
import {
    Card, CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { SquarePlus, UserRoundPlus } from 'lucide-react';
import SettingsModal from '~/components/SettingsModal';
import { Link } from 'react-router';

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Five Suit Poker" },
        { name: "description", content: "five suit poker :)" },
    ];
}

export default function Home() {
    return (
        <MainContainer>
            <div className="w-full max-w-md mx-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Five Suit Poker</CardTitle>
                        <CardDescription>Create a room or enter a room code below to start playing.</CardDescription>
                        <CardAction>
                            <SettingsModal />
                        </CardAction>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/create">
                            <div className="flex flex-col align-middle justify-center gap-2 hover:bg-gray-600/25 p-4 rounded-lg cursor-pointer border border-gray-700 transition-colors duration-200">
                                <div className="flex justify-center">
                                    <SquarePlus className="h-8 w-8" />
                                </div>
                                <h2 className="text-xl text-center font-semibold">Create a Room</h2>
                            </div>
                        </Link>
                        <Link to="/join">
                            <div className="flex flex-col align-middle justify-center gap-2 hover:bg-gray-600/25 p-4 rounded-lg cursor-pointer border border-gray-700 transition-colors duration-200">
                                <div className="flex justify-center">
                                    <UserRoundPlus className="h-8 w-8" />
                                </div>
                                <h2 className="text-xl text-center font-semibold">Join a Room</h2>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </MainContainer>
    );
}
