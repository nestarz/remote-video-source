import https from "https";
import http from "http";

export default async (url) => {
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