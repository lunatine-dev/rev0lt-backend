require("dotenv").config();

const server = require("fastify")({
        logger:
            require("./modules/logger")[
                process.env.NODE_ENV || "development"
            ] ?? true,
        trustProxy:
            process.env.NODE_ENV === "production"
                ? process.env.NGINX_IP
                : false,
    }),
    autoload = require("@fastify/autoload"),
    cors = require("@fastify/cors");
const path = require("path"),
    mongoose = require("mongoose");

//app logic
(async () => {
    const port = process.env.PORT || 3000;
    try {
        //connect to db
        await mongoose.connect(process.env.MONGO_URI);
        server.addHook("onRequest", (request, reply, done) => {
            // Set CORS headers for all origins
            reply.header("Cross-Origin-Resource-Policy", "cross-origin");
            done();
        });

        // plugins
        await server.register(cors, {
            // allow from env.FRONTEND_URL
            origin: process.env.FRONTEND_URL,
        });
        server.register(require("@fastify/static"), {
            root: path.join(__dirname, "public"),
            prefix: "/public/", // optional: default '/'
        });
        server
            .register(autoload, {
                dir: path.join(__dirname, "routes"),
                dirNameRoutePrefix: function rewrite(folderParent, folderName) {
                    return folderName;
                },
            })
            .after(() => console.log("Routes loaded successfully"));

        server.ready().then(async () => {
            await server.listen({ port, host: "0.0.0.0" });
        });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
})();
