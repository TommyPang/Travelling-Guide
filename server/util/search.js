const puppeteer = require('puppeteer');
const xpath = require('xpath'), dom = require('xmldom').DOMParser;
const url = 'https://www.wikipedia.org/';

module.exports = {
    search: async function (name, longitude, latitude) {
        const browser = await puppeteer.launch({defaultViewport: null, headless: true});
        const page = await browser.newPage();
        await page.goto(url);
        const inputHandle = await page.waitForXPath("//input[@name = 'search']");
        await inputHandle.type(name, {delay: 100}); // 'delay' sets the time to wait between key presses in milliseconds.

        await page.waitForXPath("//*[@id=\"typeahead-suggestions\"]/div/a"); // wait for the XPath to appear
        //const possible_links = Promise.all((await page.$x('//a[@class="suggestion-link"]')).map(async item => await (await item.getProperty('href')).jsonValue()));
        const possible_links = Promise.all((await page.$x('//*[@id=\"typeahead-suggestions\"]/div/a')).map(async item => await (await item.getProperty('href')).jsonValue()));
        const links = [];
        await possible_links.then((v) => {
            for (const lnk of v) {
                links.push(lnk);
            }
        });

        /*
        // brute force, check every link's prefix
        const links = await page.evaluate(() => {
            let res = [];
            let possible_links = Array.from(document.body.querySelectorAll('a'), (el) => el.href);
            for (const v of possible_links) {
                if (v.startsWith("https://en.wikipedia.org/wiki/Mountain_View")) {
                    res.push(v);
                }
            }
            return res;
        });*/
        let info = "";
        for (const url of links) {
            await page.goto(url);
            let found = false;
            await page.waitForXPath("//a[contains(@href, 'geohack.toolforge.org/')]"); // wait for the XPath to appear
            const geo_hack_links = Promise.any((await page.$x("//a[contains(@href, 'geohack.toolforge.org/')]")).map(async item => await (await item.getProperty('href')).jsonValue()));
            await geo_hack_links.then(async (v) => {
                // console.log(v);
                if (await check_location(v)) {
                    // await page.waitForXPath("//*[@id=\"firstHeading\"]");
                    // const elements = await page.$x("//*[@id=\"firstHeading\"]");
                    // info = info.concat(await page.evaluate(name => name.textContent, elements[0])).concat("\n");

                    await page.waitForXPath("//*[@id=\"mw-content-text\"]/div[1]/p"); // wait for the XPath to appear
                    const paragraphs = Promise.all((await page.$x("//*[@id=\"mw-content-text\"]/div[1]/p")).map(async item => await (await item.getProperty('textContent')).jsonValue()));
                    await paragraphs.then((v) => {
                        for (const p of v) {
                            let s = ""
                            for (let i = 0; i < p.length; i++) {
                                if (p.charAt(i)==='[') {
                                    while (p.charAt(i)!==']') i++;
                                }
                                else s = s.concat(p.charAt(i));
                            }
                            info = info.concat(s).concat("\n");
                        }
                    });
                    // console.log(info);
                    found = true;
                }
            });
            /*
            // brute force, check every link's substrings
            page.evaluate(async () => {
                const possible_links = Array.from(document.body.querySelectorAll('a'), (el) => el.href);
                let res = ""
                for (const v of possible_links) {
                    if (v.indexOf("geohack.toolforge.org/") !== -1) {
                        res = v;
                    }
                }
                return res;
            }).then(async x => {
                if (await check_location(x)) {
                    await page.waitForXPath("//!*[@id=\"firstHeading\"]");
                    const elements = await page.$x("//!*[@id=\"firstHeading\"]");
                    for (let i = 0; i < elements.length; i++) {
                        info = info.concat(await page.evaluate(name => name.textContent, elements[i]));
                    }
                    console.log(info);
                    found = true;
                    console.log(found);
                }
            });*/
            if (found) break;
        }
        await browser.close();
        return info === "" ? `No Information Regarding ${name} was found` : info;

        async function check_location(x) {
            const browser = await puppeteer.launch({ defaultViewport: null, headless: true });
            const page = await browser.newPage();
            await page.goto(x);
            const threshold = 1e-3;
            let isValid = false;
            await page.evaluate(() => {
                let latitude = document.body.querySelector('.latitude').textContent;
                let longitude = document.body.querySelector('.longitude').textContent;
                return [parseFloat(latitude), parseFloat(longitude)];
            }).then((result) => {
                let lat = [result[0], latitude], lon = [result[1], longitude];
                lat.sort();
                lon.sort();
                // console.log(Math.abs(lat[1] - lat[0]) * Math.abs(lon[1] - lon[0]));
                browser.close();
                isValid = Math.abs(lat[1] - lat[0]) * Math.abs(lon[1] - lon[0]) <= threshold;
            });
            return isValid;
        }
    }
}