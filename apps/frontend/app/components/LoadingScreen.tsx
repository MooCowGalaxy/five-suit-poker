export default function LoadingScreen({ message }: { message?: string } = { message: 'Loading...' }) {
    return (
        <div className="w-screen h-screen flex justify-center align-middle items-center">
            <p className="text-md text-center font-semibold animate-pulse">{message}</p>
        </div>
    )
}