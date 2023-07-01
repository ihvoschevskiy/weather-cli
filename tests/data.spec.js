const { getGeoLocation, getWeather } = require("../services/data");
const { ENV_PATH } = require("../services/constants");

require("dotenv").config({ path: ENV_PATH });

const itIf = () => {
  return process.env.OPEN_WEATHER_TOKEN ? it : it.skip;
};

describe("data.js", () => {
  const city = {
    name: "Abakan, RU, Republic of Khakassia",
    lat: 53.7206497,
    lon: 91.4403553,
  };

  describe("getGeolocation", () => {
    itIf()(
      "вернет массив объектов с геолокационными данными для указанного города",
      async () => {
        const data = await getGeoLocation("abakan");
        expect(data[0]).toEqual(city);
      }
    );
    itIf()("проверит количество элементов в списке городов", async () => {
      expect(await getGeoLocation("abakan")).toHaveLength(1);
      expect(await getGeoLocation("moskow")).toHaveLength(3);
    });
  });

  describe("getWeather", () => {
    itIf()("вернет текущую погоду для заданного города", async () => {
      const data = await getWeather(city, "current");
      expect(data).toHaveProperty("current");
    });

    itIf()("вернет данные о погоде на неделю", async () => {
      const data = await getWeather(city, "daily");
      expect(data).toHaveProperty("daily");
      expect(data.daily).toHaveLength(8);
    });
  });
});
