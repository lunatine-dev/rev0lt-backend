const User = require("../../models/User");

const routes = (fastify, opts, done) => {
    fastify.get("/", async (req, res) => {
        let users = await User.find({}).sort({
            total_points: -1,
        });

        return users;
    });

    done();
};

module.exports = routes;
