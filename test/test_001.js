const assert = require('assert');
const puppeteer = require('puppeteer');

const C = require('../src/assets/js/constants.js');

const extensionPath = "./src";

let extensionPage = null;
let browser = null;

async function boot() {
  browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXEC_PATH, 	// set by docker container in github CI environment
    headless: false, 									// extension are allowed only in headful mode
    args: [
      `--no-sandbox`,									//Required for this to work in github CI environment
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  const dummyPage = await browser.newPage();
  await dummyPage.waitFor(2000); 							// arbitrary wait time.

  //Matches the name in the manifest (which is internationalized!!! I guess running this test in english only)
  const extensionName = "Witness This Media";

  // Pull out the extension signature so it can work locally or in github CI environment
  const targets = await browser.targets();
  const extensionTarget = targets.find(({ _targetInfo }) => {
    return _targetInfo.title === extensionName && _targetInfo.type === 'background_page';
  });

  //const extensionURL = "chrome-extension://laamipgenpgadjfhhhnmgcndkeaelhib/popup.html";
  //const extensionID = 'laamipgenpgadjfhhhnmgcndkeaelhib';
  const extensionUrl = extensionTarget._targetInfo.url || '';
  const [,, extensionID] = extensionUrl.split('/');

  const extensionPopupHTML = "popup.html";
  extensionPage = await browser.newPage();
  await extensionPage.goto(`chrome-extension://${extensionID}/${extensionPopupHTML}`);
}



describe('Extension UI Testing', function() {
  this.timeout(50000);
  before(async function() {
    //this.enableTimeouts(false)
    await boot();
  });

  describe('Extension Popup Basics', async function() {
    it('Find Manual Witness Button', async function() {
      const targetSelector = '#'+C.K_MANUAL_WITNESS+C.C_BUTTON;
      const target = await extensionPage.$(targetSelector);
      assert.ok(target, targetSelector+' is not rendered');
    })

    it('Find Auto Witness Button', async function() {
      const targetSelector = '#'+C.K_AUTO_WITNESS+C.C_SLIDER;
      const target = await extensionPage.$(targetSelector);
      assert.ok(target, targetSelector+' is not rendered');
    })
  });

  describe('Third Party Site Basics', async function() {
    it('Find Scrapeo #page section', async function() {
      const targetPage = await browser.newPage();
      await targetPage.goto('https://www.scrapeo.net');

      const pageSelector = '#page';
      const target = await targetPage.$(pageSelector);
      assert.ok(target, pageSelector+' is not rendered');
    })
  });

  describe('Content Script Basics', async function() {
    it('div#ext-content-script-injected should be injected to any page', async function() {
      const targetPage = await browser.newPage();
      await targetPage.goto('https://www.scrapeo.net');

      const elSelector = '#ext-content-script-injected';
      const target = await targetPage.$(elSelector);
      assert.ok(target, elSelector+' is not rendered');
    })
  });

  after(async function() {
    await browser.close();
  });
});