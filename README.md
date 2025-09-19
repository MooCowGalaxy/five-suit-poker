# Five Suit Poker

This project is an online, multiplayer five suit poker game. The fifth suit is moons. It allows users to create private rooms, invite friends with a room code, and customize game rules.

The application is built using a Turborepo monorepo, containing both the frontend client and the backend server.


### Tech Stack

* **Backend**:
    * **Framework**: Colyseus
* **Frontend**:
    * **Framework**: React
    * **Build Tool**: Vite
    * **Styling**: TailwindCSS
    * **UI Components**: shadcn/ui

### Project Structure

* `apps/frontend`: The React frontend application
* `apps/gameserver`: The Colyseus backend server
* `packages/eslint-config` and `packages/typescript-config`: Shared TypeScript configurations
