const issueRefresh = (refresh, id, fastify) => {
    if (refresh) {
        const decoded = fastify.jwt.verify(refresh);
        if (decoded) {
            return refresh;
        } else {
            return fastify.jwt.sign({ id }, { expiresIn: "90d" });
        }
    } else {
        return fastify.jwt.sign({ id }, { expiresIn: "90d" });
    }
};

const validateAndIssueTokens = async (user, fastify) => {
    //user logs in, let's generate them a new access token and refresh token
    let accessToken, refreshToken;

    try {
        accessToken = fastify.jwt.sign(
            { id: user._id },
            {
                expiresIn: "15m",
            }
        );

        refreshToken = issueRefresh(user?.refreshToken, user._id, fastify);
    } catch (e) {
        console.log(e);
        throw new Error("Internal server error.");
    }

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    try {
        await user.save();
    } catch (e) {
        console.log(e);
        throw new Error("Internal server error.");
    }

    if (!accessToken || !refreshToken)
        throw new Error("Internal server error.");

    return { accessToken, refreshToken };
};

module.exports = { validateAndIssueTokens };
