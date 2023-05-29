import { load } from "cheerio";
import fetchZillowWithProxy from "./fetchZillowWithProxy.js";

export default async function (zpid) {
  while (true) {
    const zillowUrl = `https://www.zillow.com/homedetails/${zpid}_zpid`;

    try {
      const response = await fetchZillowWithProxy(zillowUrl);

      const html = await response.text();

      if (html.includes("Please verify you're a human to continue")) {
        throw new Error("blocked request");
      }

      const $ = load(html);

      try {
        const nextState = $("#__NEXT_DATA__");

        const { property } = JSON.parse(
          JSON.parse(nextState.text()).props.pageProps.gdpClientCache
        )[`NotForSaleShopperPlatformFullRenderQuery{"zpid":${zpid}}`];

        const { attributionInfo, city, state, zipcode, streetAddress } =
          property;

        const {
          buyerAgentName,
          buyerBrokerageName,
          buyerAgentMemberStateLicense,
        } = attributionInfo;

        if (
          !(buyerAgentName || buyerAgentName || buyerAgentMemberStateLicense)
        ) {
          return null;
        }

        return {
          zillowUrl,
          zpid,
          streetAddress,
          city,
          state,
          zipcode,
          buyerAgentName,
          buyerBrokerageName,
          buyerAgentMemberStateLicense,
        };
      } catch (error) {
        throw new Error("error parsing html next state into json");
      }
    } catch (error) {
      console.error({
        zpid,
        zillowUrl,
        message: error?.message,
      });
    }
  }
}
