const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const validUsername = /^([a-zA-Z0-9]| |\.){1,18}$/;
const validToken = /^[a-zA-Z0-9]{32}$/;

export function generateRoomId(): string {
    return new Array(4).map(() => characters[Math.floor(Math.random() * characters.length)]).join('');
}

export function validateUsername(username: string): boolean {
    return validUsername.test(username);
}

export function validateToken(token: string) {
    return validToken.test(token);
}

export function shuffle(array: any[]) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}