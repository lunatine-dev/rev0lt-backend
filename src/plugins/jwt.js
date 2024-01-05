const fp = require("fastify-plugin");
const User = require("../models/User");

module.exports = fp(async function (fastify, opts) {
    fastify.register(require("@fastify/jwt"), {
        secret: process.env.JWT_SECRET,
    });

    fastify
        .decorate("verifyJWT", async function (request, reply) {
            try {
                // check if token is valid and then fetch user from database to make sure their current access token is valid
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        })
        .decorate("verifyUser", async function (request, reply) {
            try {
                const token = request.headers.authorization.split(" ")[1];
                const decoded = await fastify.jwt.verify(token);

                const user = await User.findById(decoded.id);

                if (!user || user.accessToken !== token) {
                    return reply.code(401).send({ message: "Token not valid" });
                }

                request.user = user;

                return true;
            } catch (e) {
                reply.send(e);
            }
        });
});
