const version = require("../../package.json").version;

const routes = (fastify, opts, done) => {
    fastify.get("/", async (req, res) => {
        return {
            version,
        };
    });

    done();
};

module.exports = routes;
