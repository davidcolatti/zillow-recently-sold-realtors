import { load } from "cheerio";
import fetchZillowWithProxy from "./fetchZillowWithProxy.js";
import _ from "lodash";

// const TOTAL_PAGE_COUNT = 20;
const TOTAL_PAGE_COUNT = 1;

const getZpids = async (cityStateSlug, page) => {
  while (true) {
    // to attempt to get page data
    const queryParams = JSON.stringify({
      pagination: {
        currentPage: page,
      },
      filterState: {
        doz: {
          value: "7",
        },
        fore: {
          value: false,
        },
        apa: {
          value: false,
        },
        sort: {
          value: "days",
        },
        auc: {
          value: false,
        },
        nc: {
          value: false,
        },
        rs: {
          value: true,
        },
        land: {
          value: false,
        },
        manu: {
          value: false,
        },
        fsbo: {
          value: false,
        },
        cmsn: {
          value: false,
        },
        fsba: {
          value: false,
        },
      },
    });

    const zillowUrl = `https://www.zillow.com/${cityStateSlug}/sold/${
      page === 1 ? "" : page + "_p/"
    }?searchQueryState=${encodeURIComponent(queryParams)}`;

    console.log({
      zillowUrl,
      message: `getting recently sold homes for page ${page} / ${TOTAL_PAGE_COUNT}`,
    });

    try {
      const response = await fetchZillowWithProxy(zillowUrl);

      const html = await response.text();

      if (!html) {
        throw new Error("no html to parse");
      }

      if (html.includes("Please verify you're a human to continue")) {
        throw new Error("blocked request");
      }

      if (
        html.includes(
          "Press & Hold to confirm you are<br>a human (and not a bot)."
        )
      ) {
        throw new Error("blocked by captcha");
      }

      const $ = load(html);

      const container = $(
        'script[data-zrr-shared-data-key="mobileSearchPageStore"]'
      );

      const scriptText = container.text();

      if (!scriptText) {
        throw new Error("no script tag found");
      }

      const jsonText = scriptText.replace(/^\<\!\-\-(.*)\-\-\>/g, "$1");

      if (jsonText) {
        const { listResults } = JSON.parse(jsonText)?.cat1?.searchResults ?? {};

        return listResults.map((lr) => {
          return {
            zpid: lr.zpid,
            zillowUrl: lr.detailUrl,
            street: lr.addressStreet,
            city: lr.addressCity,
            state: lr.addressState,
            zipCode: lr.addressZipcode,
            status: lr.variableData.type,
            soldDate: lr.variableData.text,
          };
        });
      }
    } catch (error) {
      console.error({
        zillowUrl,
        message: error?.message,
      });
    }
  }
};

export default async function (cityStateSlug) {
  const promises = new Array(TOTAL_PAGE_COUNT).fill(null).map((_, index) => {
    return getZpids(cityStateSlug, index + 1);
  });

  const responses = await Promise.all(promises);
  const filteredData = responses.flat().filter(Boolean);
  return _.uniqBy(filteredData, "zpid");
}
