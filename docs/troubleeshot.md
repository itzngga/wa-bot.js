# Troubleshooting

<!-- GEN:toc -->
- [Troubleshooting](#troubleshooting)
  - [Chrome headless doesn't launch on Windows](#chrome-headless-doesnt-launch-on-windows)
  - [Chrome headless doesn't launch on UNIX](#chrome-headless-doesnt-launch-on-unix)
  - [Running Puppeteer in the cloud](#running-puppeteer-in-the-cloud)
    - [Running Puppeteer on Google App Engine](#running-puppeteer-on-google-app-engine)
    - [Running Puppeteer on Google Cloud Functions](#running-puppeteer-on-google-cloud-functions)
    - [Running Puppeteer on AWS Lambda](#running-puppeteer-on-aws-lambda)
<!-- GEN:stop -->


## Chrome headless doesn't launch on Windows

Some [chrome policies](https://support.google.com/chrome/a/answer/7532015) might enforce running Chrome/Chromium
with certain extensions.

Puppeteer passes `--disable-extensions` flag by default and will fail to launch when such policies are active.

To work around this, try running without the flag:

```js
const browser = await puppeteer.launch({
  ignoreDefaultArgs: ['--disable-extensions'],
});
```

## Chrome headless doesn't launch on UNIX

Make sure all the necessary dependencies are installed. You can run `ldd chrome | grep not` on a Linux
machine to check which dependencies are missing. The common ones are provided below.

<details>
<summary>Debian (e.g. Ubuntu) Dependencies</summary>

```
ca-certificates
fonts-liberation
gconf-service
libappindicator1
libappindicator3-1
libasound2
libatk-bridge2.0-0
libatk1.0-0
libc6
libcairo2
libcups2
libdbus-1-3
libexpat1
libfontconfig1
libgbm1
libgcc1
libgconf-2-4
libgdk-pixbuf2.0-0
libglib2.0-0
libgtk-3-0
libnspr4
libnss3
libpango-1.0-0
libpangocairo-1.0-0
libstdc++6
libx11-6
libx11-xcb1
libxcb1
libxcomposite1
libxcursor1
libxdamage1
libxext6
libxfixes3
libxi6
libxrandr2
libxrender1
libxss1
libxtst6
lsb-release
wget
xdg-utils
```
</details>

<details>
<summary>CentOS Dependencies</summary>

```
alsa-lib.x86_64
atk.x86_64
cups-libs.x86_64
gtk3.x86_64
ipa-gothic-fonts
libXcomposite.x86_64
libXcursor.x86_64
libXdamage.x86_64
libXext.x86_64
libXi.x86_64
libXrandr.x86_64
libXScrnSaver.x86_64
libXtst.x86_64
pango.x86_64
xorg-x11-fonts-100dpi
xorg-x11-fonts-75dpi
xorg-x11-fonts-cyrillic
xorg-x11-fonts-misc
xorg-x11-fonts-Type1
xorg-x11-utils
```

After installing dependencies you need to update nss library using this command

```
yum update nss -y
```
</details>


## Running Puppeteer in the cloud

### Running Puppeteer on Google App Engine

The Node.js runtime of the [App Engine standard environment](https://cloud.google.com/appengine/docs/standard/nodejs/) comes with all system packages needed to run Headless Chrome.

To use `puppeteer`, simply list the module as a dependency in your `package.json` and deploy to Google App Engine. Read more about using `puppeteer` on App Engine by following [the official tutorial](https://cloud.google.com/appengine/docs/standard/nodejs/using-headless-chrome-with-puppeteer).

### Running Puppeteer on Google Cloud Functions

The Node.js 10 runtime of [Google Cloud Functions](https://cloud.google.com/functions/docs/) comes with all system packages needed to run Headless Chrome.

To use `puppeteer`, simply list the module as a dependency in your `package.json` and deploy your function to Google Cloud Functions using the `nodejs10` runtime.

### Running Puppeteer on AWS Lambda

AWS Lambda [limits](https://docs.aws.amazon.com/lambda/latest/dg/limits.html) deployment package sizes to ~50MB. This presents challenges for running headless Chrome (and therefore Puppeteer) on Lambda. The community has put together a few resources that work around the issues:

- https://github.com/alixaxel/chrome-aws-lambda (kept updated with the latest stable release of puppeteer)
- https://github.com/adieuadieu/serverless-chrome/blob/master/docs/chrome.md (serverless plugin - outdated)
