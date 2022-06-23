import ffprobe from "ffprobe-static";
import { fileTypeFromStream } from "file-type";
import ffmpeg from "fluent-ffmpeg";
import fetch from "node-fetch";
import probe from "probe-image-size";
ffmpeg.setFfprobePath(ffprobe.path);

export default async (req, res) => {
  const { url: raw } = req.query;
  if (!raw) throw Error("[MISSING] URL");

  const url = await ytdl
    .getInfo(raw)
    .then(({ formats }) => formats)
    .then((arr) =>
      arr
        .filter(({ hasVideo, hasAudio }) => hasVideo && hasAudio)
        .sort(({ bitrate: a }, { bitrate: b }) => b - a)
        .shift()
    )
    .then((video) => (video ? video.url : raw))
    .catch(() => raw);

  const mime = (await fileTypeFromStream((await fetch(url)).body)).mime;
  return res.writeHead(200).end(
    JSON.stringify({
      ...(mime.includes("image")
        ? await probe(url).then(({ width, height }) => ({ width, height }))
        : await new Promise((res) =>
            ffmpeg.ffprobe(
              url,
              (err, { streams: [{ width, height, duration }] }) =>
                err ? rej(err) : res({ width, height, duration })
            )
          )),
      size: await file_size_url(url),
      contentType: mime,
      name: url.split("/").pop()?.split(".")?.shift(),
      url,
    })
  );
};

import https from "https";
import http from "http";
import ytdl from "ytdl-core";

const file_size_url = async (url) => {
  if (!url) return Promise.reject(new Error("Invalid Url"));

  return new Promise(async (res, rej) => {
    try {
      if (url.startsWith("https://") || url.startsWith("http://")) {
        let req = url.startsWith("https://") ? https.get(url) : http.get(url);
        req.once("response", async (r) => {
          let c = parseInt(r.headers["content-length"]);
          if (!isNaN(c) && r.statusCode === 200) res(c);
          else rej("Couldn't get file size");
        });
        req.once("error", async (e) => rej(e));
      } else {
        throw "error: The address should be http or https";
      }
    } catch (error) {
      console.log(error);
    }
  });
};
