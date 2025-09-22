import { TriangleAlert } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { getUsername, setUsername as saveUsername } from "~/lib/utils";

export default function UsernameInput() {
  const [username, setUsername] = useState(getUsername());

  const isValid = (username: string): boolean => {
    return /^([a-zA-Z0-9]| |\.){1,18}$/.test(username);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={username}
          onChange={(e) => {
            setUsername(e.currentTarget.value);
            if (isValid(e.currentTarget.value)) {
              saveUsername(e.currentTarget.value);
            }
          }}
        />
        {!isValid(username) && (
          <div className="inline-flex items-center text-xs text-destructive">
            <TriangleAlert className="mr-1 size-[1.2em]" />
            Invalid username
          </div>
        )}
      </div>
    </div>
  );
}
