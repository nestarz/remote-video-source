const ytdl = require("ytdl-core");
const axios = require("axios");

const run = async (req, res) => {
  const { video_id: videoId, url: videoUrl, proxy = false } = req.query;
  if (!videoId || !videoUrl) throw Error("[MISSING] VIDEO_ID OR URL");

  const url = await ytdl
    .getInfo(videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoUrl)
    .then(({ formats }) => formats)
    .then((arr) =>
      arr
        .filter(({ hasVideo, hasAudio }) => hasVideo && hasAudio)
        .sort(({ bitrate: a }, { bitrate: b }) => b - a)
        .shift()
    )
    .then((video) => (video ? video.url : null));

  return proxy
    ? axios
        .get(url, { responseType: "stream" })
        .then((stream) =>
          stream.data.pipe(res.writeHead(stream.status, stream.headers))
        )
    : res.writeHead(301, { Location: url }).end();
};

module.exports = (req, res) =>
  run(req, res).catch((error) =>
    res
      .writeHead(500)
      .end(JSON.stringify(error, Object.getOwnPropertyNames(error)))
  );
