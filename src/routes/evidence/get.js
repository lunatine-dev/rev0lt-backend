const Evidence = require("../../models/Evidence");

const routes = (fastify, opts, done) => {
    fastify.get("/:id", async (req, res) => {
        return await Evidence.findById(req.params.id).populate({
            path: "user",
            select: "-evidence -accessToken -refreshToken",
        });
    });

    done();
};

module.exports = routes;
