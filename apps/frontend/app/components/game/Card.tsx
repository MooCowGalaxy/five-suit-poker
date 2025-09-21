import { Club, Diamond, Heart, Moon, Spade } from 'lucide-react';

export function Card({ suit, value }: { suit: number, value: number }) {
    const iconClass = 'w-4 h-4';
    const suitIcon = [
        <Moon fill='var(--color-yellow-400)' className={`${iconClass} text-yellow-400`} />,
        <Diamond fill='var(--color-red-600)' className={`${iconClass} text-red-600`} />,
        <Club fill='var(--color-black)' className={`${iconClass} text-black`} />,
        <Heart fill='var(--color-red-600)' className={`${iconClass} text-red-600`} />,
        <Spade fill='var(--color-black)' className={`${iconClass} text-black`} />,
    ][suit];

    return (
        <div className="w-16 h-24 rounded-lg border-2 bg-white flex items-center justify-center relative text-black font-bold text-2xl shadow-md select-none">
            <span className="absolute top-1.5 left-1.5">{suitIcon}</span>
            {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][value - 1]}
            <span className="absolute bottom-1.5 right-1.5">{suitIcon}</span>
        </div>
    );
}

export function BlankCard() {
    return <div className="w-16 h-24 rounded-lg bg-blue-800 border-2 border-blue-500 shadow-md"></div>;
}