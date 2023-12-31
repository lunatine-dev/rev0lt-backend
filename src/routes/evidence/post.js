const axios = require("axios"),
    fs = require("fs"),
    path = require("path"),
    mime = require("mime-types"),
    hat = require("hat");

function extractFileTypeFromUrl(url) {
    // Use the path module to get the file extension
    const fileExtension = path.extname(new URL(url).pathname);

    // Remove the leading dot from the extension
    const fileType = fileExtension.slice(1);

    return fileType;
}

const downloadImage = (url) => {
    const fileType = extractFileTypeFromUrl(url);
    const downloadId = hat();
    const downloadPath = path.resolve(
        __dirname,
        `../../public/tmp`,
        `${downloadId}.${fileType}`
    );

    return new Promise(async (resolve) => {
        console.log(fileType);
        if (!mime.lookup(`.${fileType}`).startsWith("image/"))
            return resolve(null);

        try {
            const response = await axios({
                method: "get",
                url,
                responseType: "stream",
            });

            response.data.pipe(fs.createWriteStream(downloadPath));

            response.data.on("end", () => {
                resolve(`/public/tmp/${downloadId}.${fileType}`);
            });
            response.data.on("error", () => {
                resolve(null);
            });
        } catch (e) {
            resolve(null);
            console.error("Error downloading image");
        }
    });
};

const routes = (fastify, opts, done) => {
    fastify.post("/", async (req, res) => {
        const { url, urls } = req.body;
        let urlArr = [];
        let outputs = [];
        if (url) {
            urlArr.push(url);
        } else if (urls && urls.length) {
            urlArr = urls;
        }

        if (!urlArr.length) return [];

        for (const upload of urlArr) {
            let uploadedPath = await downloadImage(upload);
            if (uploadedPath) {
                outputs.push(uploadedPath);
            }
        }

        return outputs;
    });

    done();
};

module.exports = routes;
