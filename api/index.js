const ytdl = require("ytdl-core");
const axios = require("axios");

module.exports = async (req, res) => {
  const { video_id: videoId, url: videoUrl, proxy = false } = req.query;
  if (!url) throw Error("Missing video url");

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
