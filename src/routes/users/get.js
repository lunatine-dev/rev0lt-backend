const Evidence = require("../../models/Evidence");
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

    fastify.get(
        "/:id",
        { onRequest: [fastify.verifyJWT, fastify.verifyUser] },
        async (req, res) => {
            if (req?.user.role !== "admin")
                return res
                    .code(403)
                    .send({ message: "You do not have permission" });

            const user = await User.findById(req.params.id);

            if (!user)
                return res.code(404).send({ message: "User does not exist" });

            const evidence = await Evidence.find({
                user: req.params.id,
            });

            delete user.accessToken;
            delete user.refreshToken;

            return { user, evidence };
        }
    );

    done();
};

module.exports = routes;
