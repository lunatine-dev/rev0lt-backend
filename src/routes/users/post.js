const User = require("../../models/User");

const routes = (fastify, opts, done) => {
    fastify.post("/@me/refresh", async (req, res) => {
        //get refresh token from body
        const { refreshToken } = req.body;

        //verify it
        const decoded = fastify.jwt.verify(refreshToken);

        if (!decoded)
            return res.code(401).send({ message: "Invalid refresh token." });

        //find user
        const user = await User.findOne({ _id: decoded.id });

        if (!user)
            return res.code(401).send({ message: "Invalid refresh token." });

        //issue new access token
        const accessToken = fastify.jwt.sign(
            { id: user._id },
            {
                expiresIn: "15m",
            }
        );

        user.accessToken = accessToken;

        await user.save();

        return res.code(200).send({ accessToken });
    });
    done();
};

module.exports = routes;
