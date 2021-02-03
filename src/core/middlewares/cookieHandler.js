let cookie = require("cookie");
let { isSameSiteNoneCompatible } = require("should-send-same-site-none");

module.exports = function(req, res, next) {
  requestCookieParser(req);
  //generateSameSiteSettingsCookie(req, res);
  //overrideExpressResponseCookieMethod(req, res);
  next();
};

function requestCookieParser(req) {
  var list = {};
  var rc = req.headers.cookie;

  try {
    list = cookie.parse(rc);
  } catch (e) {}

  req.mycookies = list;
}

function generateSameSiteSettingsCookie(req, res) {
  let cookieOptionsConfig = {
    domain: ".*.com",
    maxAge: 3600000,
    key: "sameSiteNoneSupported",
    secure: true
  };
  let sameSiteCookie = req.mycookies && req.mycookies[cookieOptionsConfig.key];

  // case 1: When cookie is already set
  if (sameSiteCookie) {
    req.cookieSameSiteNoneSupported = sameSiteCookie === "true";
    return;
  }

  // case 2: When cookie is not set
  let userAgent = req.headers["user-agent"];
  req.cookieSameSiteNoneSupported = isSameSiteNoneCompatible(userAgent);

  // generate cookie
  cookieOptionsConfig.secure = true;
  res.cookie(
    cookieOptionsConfig.key,
    req.cookieSameSiteNoneSupported,
    cookieOptionsConfig
  );
}

function overrideExpressResponseCookieMethod(req, res) {
  var _originalExpressCookieMethod = res.cookie;
  res.cookie = function(name, val, options) {
    // Let's make sure options is always set
    let cookieOptionsSpecificForThisRequest = options || {};

    // ============================================================================
    // CAUTION about `options` argument:
    // `options` variable is a single global variable that comes for ZK
    // If we set anything specific to a user/browser, then it will also
    // be visible to other users/browsers.
    // Ex: if set sameSite = None for a browser that supports sameSite,
    //   then this will also be set to None for a bworser that does not support it.
    //  This happens because options is a global ZK variable shared by all.
    // defaulting all the cookies to secure
    //
    // SOLUTION:
    // If we are setting anything specific to a requests/users/browsers, then we will have to clone it.
    // DO NOT ADD ANYTHING TO GLOBAL OBJECT
    // ============================================================================

    // set it for all cookies that we make for all requests/users/browsers
    cookieOptionsSpecificForThisRequest.secure = true;

    // NOTE: SameSite setting is something specific to a request/user/browser.
    // So cloning it and adding it
    // Refer:
    //  - PGIS-1210
    //  - https://www.chromium.org/updates/same-site
    if (req.cookieSameSiteNoneSupported === true) {
      cookieOptionsSpecificForThisRequest = {
        ...cookieOptionsSpecificForThisRequest
      };
      cookieOptionsSpecificForThisRequest.sameSite = "none";
    }

    return _originalExpressCookieMethod.call(
      res,
      name,
      val,
      cookieOptionsSpecificForThisRequest
    );
  };
}
