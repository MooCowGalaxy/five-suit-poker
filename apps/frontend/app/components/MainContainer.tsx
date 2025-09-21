import type { ReactNode } from 'react';

export function MainContainer({ children }: { children: ReactNode }) {
    return (
        <main className="flex items-center justify-center w-screen min-h-screen">
            {children}
        </main>
    );
}