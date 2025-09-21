import config from "@colyseus/tools";
import { matchMaker } from 'colyseus';
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { FiveSuits } from "./rooms/FiveSuits";

matchMaker.controller.getCorsHeaders = function(req) {
    return {
        'Access-Control-Allow-Origin': '*',
        'Vary': '*',
        // 'Vary': "<header-name>, <header-name>, ...",
    }
}

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('five-suits', FiveSuits);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        /*app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });*/

        if (process.env.NODE_ENV === "development") {
            app.use("/", playground());
            app.use("/monitor", monitor());
        }
    },


    beforeListen: () => {
        /**
         * Before gameServer.listen() is called.
         */
    }
});
