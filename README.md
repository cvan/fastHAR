# fastHAR

A front-end UI that shows aggregated data (i.e., response sizes,
response times, and number of requests), using
[HTTP Archive (HAR)](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html)
data from captured network traffic. See
[fastHAR-api](https://github.com/cvan/fastHAR-api) (the API) and the
[phantomHAR](https://github.com/cvan/phantomHAR)
(the [phantom.js](http://phantomjs.org/) script).


## Installation

We use [gulp](http://gulpjs.com/):

    npm install gulp -g

To install the dependencies used for our development environment:

    npm install

To set up the URLs:

    cp src/api_urls.js.dist src/api_urls.js


## Development

Load from a page with an origin (i.e., a server). If you're running locally,
use `gulp` to fire up a local server:

    DEBUG=1 OPEN=1 gulp connect
