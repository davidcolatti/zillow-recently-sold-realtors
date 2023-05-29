import fetch from "node-fetch";
import proxyAgent from "proxy-agent";
import { config } from "dotenv";

config();

const agent = proxyAgent(process.env.PROXY_URL);

export default function (url) {
  return fetch(url, {
    agent,
    headers: {
      authority: "www.zillow.com",
      accept: "/",
      "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
      referer:
        "https://www.zillow.com/homedetails/7776-NW-25th-St-Pompano-Beach-FL-33063/42849047_zpid/",
      "sec-ch-ua":
        '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
  });
}
