const axios = require("axios");
const User = require("../../models/User"),
    { validateAndIssueTokens } = require("../../utils/jwt");

const baseUrl = "https://discord.com/api/v10";

const getUser = (accessToken, type) => {
    return new Promise(async (resolve, reject) => {
        if (!accessToken) return reject("No access token provided");
        let user, serverData;
        try {
            const { data } = await axios.get(`${baseUrl}/users/@me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!data) return reject("Error fetching user");

            user = data;
        } catch (e) {
            console.log(e);
            return reject("Unknown error getting user");
        }

        try {
            const { data } = await axios.get(`${baseUrl}/users/@me/guilds`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!data) return reject("Error fetching server data");

            serverData = data;
        } catch (e) {
            console.log(e);
            return reject("Unknown error getting server data");
        }

        resolve({
            user,
            serverData,
        });
    });
};

const tempAccessToken = (discord_id, fastify) => {
    //generate a temporary access token for the user, this is used for the frontend to set the cookies
    return fastify.jwt.sign(
        { discord_id },
        {
            expiresIn: "15m",
        }
    );
};

const routes = (fastify, opts, done) => {
    fastify.post("/discord/return", async (req, res) => {
        //get accessToken & refreshToken from cookies and return them,
        //if they don't exist, return 401
        const { token } = req.body;

        //verify token
        const decoded = fastify.jwt.verify(token);

        if (!decoded)
            return res.code(401).send({ message: "Invalid refresh token." });

        //find user
        const user = await User.findOne({ identifier: decoded.identifier });

        if (!user)
            return res.code(401).send({ message: "Invalid refresh token." });

        return res.code(200).send({
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        });
    });
    fastify.get("/discord/callback", async (req, res) => {
        const { token } =
            await fastify.discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(
                req
            );

        //now that we have t he users accessToken, we can use it to get:
        // - User information
        // - Servers they are in (used to check if they are in our server)

        const { user, serverData } = await getUser(token.access_token);

        //check if user is in our server
        const isInServer = serverData.some(
            (server) => server.id === process.env.DISCORD_SERVER_ID
        );

        if (!isInServer)
            return res.code(401).send({
                message: "Not authorized to use this website",
            });

        //save user to database if they don't exist
        const existingUser = await User.findOne({ identifier: user.id });

        if (!existingUser) {
            const newUser = new User({
                identifier: user.id,
                username: user.username,
                avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`,
                displayName: user.global_name,
            });

            await newUser.save();

            //generate jwt tokens
            const { accessToken, refreshToken } = await validateAndIssueTokens(
                newUser,
                fastify
            );

            newUser.acessToken = accessToken;
            newUser.refreshToken = refreshToken;

            await newUser.save();

            const tempToken = tempAccessToken(newUser.identifier, fastify);

            //redirect to frontend with temp token
            return res.redirect(
                `${process.env.FRONTEND_URL}/callback?user=${tempToken}`
            );
        } else {
            //generate jwt tokens
            const { accessToken, refreshToken } = await validateAndIssueTokens(
                existingUser,
                fastify
            );
            //update user tokens
            existingUser.accessToken = accessToken;
            existingUser.refreshToken = refreshToken;

            await existingUser.save();

            const tempToken = tempAccessToken(existingUser.identifier, fastify);

            //redirect to frontend with temp token
            return res.redirect(
                `${process.env.FRONTEND_URL}/callback?user=${tempToken}`
            );
        }
    });

    done();
};

module.exports = routes;
