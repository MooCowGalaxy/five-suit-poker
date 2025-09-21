import {
    Dialog, DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Settings } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useState } from 'react';
import { getUsername, setUsername as saveUsername } from '~/lib/utils';
import { toast } from 'sonner';

export default function SettingsModal() {
    const [username, setUsername] = useState(getUsername());
    const [originalUsername, setOriginalUsername] = useState(getUsername());

    const resetUsername = () => {
        setUsername(getUsername());
    };

    const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.currentTarget.value);
    };

    const onUsernameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSave();
        }
    };

    const isValid = (username: string): boolean => {
        return /^([a-zA-Z0-9]| |\.){1,18}$/.test(username);
    };

    const onSave = () => {
        if (isValid(username)) {
            saveUsername(username);
            setOriginalUsername(username);
            toast.success('Saved username');
        }
    };

    return (
        <Dialog onOpenChange={() => resetUsername()}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="cursor-pointer outline-solid outline outline-gray-700">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={username} onInput={onUsernameChange} onKeyDown={onUsernameKey} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={username === originalUsername} onClick={onSave}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}