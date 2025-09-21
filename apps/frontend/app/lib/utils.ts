import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createUsername() {
    return `Player ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

export function createToken() {
    const base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

    let result = '';
    for (let i = 0; i < 32; i++) {
        result += base62[Math.floor(Math.random() * base62.length)];
    }

    return result;
}

export function getUsername() {
    let username = localStorage.getItem('username');
    if (!username) {
        username = createUsername();
        localStorage.setItem('username', username);
    }
    return username;
}

export function setUsername(username: string) {
    localStorage.setItem('username', username);
}

export function getToken(): string {
    let token = localStorage.getItem('token');
    if (!token) {
        token = createToken();
        localStorage.setItem('token', token);
    }
    return token;
}