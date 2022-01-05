const { asyncWrapper } = require("../middleware/async.js");
const request = require("request-promise");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { minimal_args, redDot } = require("./utils");

const courseURL =
  "https://coursefinder.utoronto.ca/course-search/search/courseInquiry?methodToCall=start&viewId=CourseDetails-InquiryView&courseId=";

const getCourseURL = (id) => `${courseURL}${id}`;

const getCourse = asyncWrapper(async (req, res) => {
  const { courseId } = req.params;
  

  request(getCourseURL(courseId))
    .then(function (html) {
      //success!
      let data = {};
      let $ = cheerio.load(html);

      // data = { courseId,code, title, division, description, department, prerequisites, exclusions,level,  campus, term, recommendedPreperation, utscBreadth, utmDistribution, asBreadth, asDistribution }

      const placeholders = [
        { value: "title", id: "span[class=uif-headerText-span]" },
        { value: "division", id: "span[id=u23]" },
        { value: "description", id: "span[id=u32]" },
        { value: "department", id: "span[id=u41]" },
        { value: "prerequisites", id: "span[id=u50]" },
        { value: "exclusions", id: "span[id=u68]" },
        { value: "level", id: "span[id=u86]" },
        { value: "campus", id: "span[id=u149]" },
        { value: "term", id: "span[id=u158]" },
        { value: "recommendedPreperation", id: "span[id=u77]" },
        { value: "utscBreadth", id: "span[id=u104]" },
        { value: "utmDistribution", id: "span[id=u113]" },
        { value: "asBreadth", id: "span[id=u122]" },
        { value: "asDistribution", id: "span[id=u131]" },
      ];

      for (let i = 0; i < placeholders.length; i++) {
        $(placeholders[i].id).text().localeCompare("")
          ? data[placeholders[i].value] = $(placeholders[i].id).text().replace(/\n/g, "")
          : null;
        if (data.title === "Error" && i === 0) break;
      }

      if(data.title !== "Error") data.link = getCourseURL(courseId);

      res.json(data);
    })
    .catch(function (err) {
      //handle error
      res.send("failure");
    });
});

const getMeetingSections = asyncWrapper(async (req, res) => {
  const { courseId } = req.params;

  request(getCourseURL(courseId))
    .then(async function (html) {
      let $ = cheerio.load(html);
      const timetable = [];
      const data = {};

      $("span[class=uif-headerText-span]").text().localeCompare("")
        ? (data.title = $("span[class=uif-headerText-span]")
            .text()
            .replace(/\n/g, ""))
        : null;

      if (data.title !== "Error") {
        data.link = getCourseURL(courseId);
      }

      $("tbody > tr").each((index, element) => {
        const tds = $(element).find("td");
        const code = $(tds[0]).text().replace(/\n/g, "").trim();
        const time = $(tds[1]).text().replace(/\n/g, "").trim();
        const instructor = $(tds[2]).text().replace(/\n/g, "").trim();
        const location = $(tds[3]).text().replace(/\n/g, "").trim();
        const classSize = $(tds[4]).text().replace(/\n/g, "").trim();
        const currentEnrollment = $(tds[5]).text().replace(/\n/g, "").trim();
        const deliveryMode = $(tds[7]).text().replace(/\n/g, "").trim();
        const tableRow = {
          code,
          time,
          instructor,
          location,
          classSize,
          currentEnrollment,
          deliveryMode,
        };
        timetable.push(tableRow);
      });

      timetable.sort((a, b) =>
        a.code > b.code ? 1 : b.code > a.code ? -1 : 0
      );

      res.json({ timetable, data });
    })
    .catch(function (err) {
      // handle error
      res.send("failure");
    });
});

const getMeetingSectionsSS = asyncWrapper(async (req, res) => {
  const { courseId } = req.params;

  request(getCourseURL(courseId))
    .then(async function (html) {
      //success!
      let data = {};
      let $ = cheerio.load(html);

      $("span[class=uif-headerText-span]").text().localeCompare("")
        ? (data.title = $("span[class=uif-headerText-span]")
            .text()
            .replace(/\n/g, ""))
        : null;

      if (data.title !== "Error") {
        request(getCourseURL(courseId))
          .then(async function (html) {
            const Screenshot = async () => {
              // Define Screenshot function
              const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
              });
              // Launch a "browser"
              const page = await browser.newPage();
              // Open new page
              await page.goto(getCourseURL(courseId), {
                waitUntil: "domcontentloaded",
              });
              // Go website
              await page.waitForSelector("table"); // Method to ensure that the element is loaded
              let title = page.$("span[class=uif-headerText-span]");
              if (title === "Error") return "";
              const logo = await page.$("table"); // logo is the element you want to capture
              image = await logo.screenshot({
                type: "jpeg",
                encoding: "base64",
              });
              await page.close();
              await browser.close();
              return image;
            };
            data.image = await Screenshot();
            data.link = getCourseURL(courseId);

            res.json(data);
          })
          .catch(function (err) {
            // handle error
            res.send("failure");
          });
      } else {
        data.image = redDot;
        res.json(data);
      }
    })
    .catch(function (err) {
      // handle error
      res.send("failure");
    });
});

module.exports = {
  getMeetingSections,
  getCourse,
  getMeetingSectionsSS,
};

