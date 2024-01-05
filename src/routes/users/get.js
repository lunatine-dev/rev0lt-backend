const User = require("../../models/User");

const routes = (fastify, opts, done) => {
    fastify.get(
        "/@me",
        { onRequest: [fastify.verifyJWT, fastify.verifyUser] },
        async (req, res) => {
            const user = req.user;

            return user;
        }
    );
    fastify.get("/", async (req, res) => {
        let users = await User.find(
            {},
            {
                role: 1,
                displayName: 1,
                username: 1,
                identifier: 1,
                avatar: 1,
                points: 1,
                total_points: 1,
            }
        ).sort({
            total_points: -1,
        });

        return users;
    });

    done();
};

module.exports = routes;
