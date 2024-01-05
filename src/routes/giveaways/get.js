const Giveaway = require("../../models/Giveaway");

const routes = (fastify, opts, done) => {
    fastify.get("/", async (req, res) => {
        let giveaways = await Giveaway.find({})
            .sort({
                deadline: -1,
            })
            .populate({
                path: "winner",
                select: "-evidence -accessToken -refreshToken",
            });

        return giveaways;
    });

    fastify.get("/active", async (req, res) => {
        let count = await Giveaway.countDocuments({ active: true });

        return count;
    });

    done();
};

module.exports = routes;
