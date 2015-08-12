module.exports = Snapchat

var debug = require('debug')('snapchat')
var request = require('request')

var constants = require('./lib/constants')
var Session = require('./lib/session')
var Request = require('./lib/request')
var StringUtils = require('./lib/string-utils')

/**
 * Snapchat Client
 *
 * @param {Object} opts
 */
function Snapchat (opts) {
  var self = this
  if (!(self instanceof Snapchat)) return new Snapchat(opts)
  if (!opts) opts = {}

  debug('new snapchat client')
}

/**
 * The username of the currently signed in (or not yet singed in) user.
 * @note Always lowercase.
 *
 * @type {string}
 */
Object.defineProperty(Snapchat.prototype, 'username', {
  get: function () {
    var self = this
    return self._username
  }
})

/**
 * The username of the currently signed in (or not yet singed in) user.
 * @note Always lowercase.
 *
 * @type {Session}
 */
Object.defineProperty(Snapchat.prototype, 'currentSession', {
  get: function () {
    var self = this
    return self._currentSession
  },

  set: function (currentSession) {
    var self = this
    self._currentSession = currentSession
    self._username = currentSession.username
  }
})

/**
 * The size of your device's screen.
 *
 * @type {Object}
 */
Object.defineProperty(Snapchat.prototype, 'screenSize', {
  get: function () {
    var self = this
    return self._screenSize
  }
})

/**
 * The maximum size to load videos in
 *
 * @type {Object}
 */
Object.defineProperty(Snapchat.prototype, 'maxVideoSize', {
  get: function () {
    var self = this
    return self._maxVideoSize
  }
})

/**
 * Whether or not this client is signed in.
 *
 * @type {boolean}
 */
Object.defineProperty(Snapchat.prototype, 'isSignedIn', {
  get: function () {
    var self = this
    return self.googleAuthToken && self.authToken && self.username
  }
})

/**
 * Used internally to sign in.
 *
 * @type {string}
 */
Object.defineProperty(Snapchat.prototype, 'authToken', {
  get: function () {
    var self = this
    return self._authToken
  }
})

/**
 * Used internally to sign in.
 *
 * @type {string}
 */
Object.defineProperty(Snapchat.prototype, 'googleAuthToken', {
  get: function () {
    var self = this
    return self._googleAuthToken
  }
})

/**
 * Used internally.
 *
 * @type {string}
 */
Object.defineProperty(Snapchat.prototype, 'deviceToken1i', {
  get: function () {
    var self = this
    return self._deviceToken1i
  }
})

/**
 * Used internally.
 *
 * @type {string}
 */
Object.defineProperty(Snapchat.prototype, 'deviceToken1v', {
  get: function () {
    var self = this
    return self._deviceToken1v
  }
})

/**
 * Used internally to sign in and trick Snapchat into thinking we're using the first party client.
 *
 * @type {string}
 */
Object.defineProperty(Snapchat.prototype, 'googleAttestation', {
  get: function () {
    var self = this
    return self._googleAttestation
  }
})

/**
 * Signs into Snapchat.
 *
 * A valid GMail account is necessary to trick Snapchat into thinking we're using the first party client. Your data is only ever sent to Google, Scout's honor.
 *
 * @param {string} username The Snapchat username to sign in with.
 * @param {string} password The password to the Snapchat account to sign in with.
 * @param {string} gmailEmail A vaild GMail address.
 * @param {string} gmailPassword The password associated with \c gmailEmail.
 * @param {function} cb
 */
Snapchat.prototype.signIn = function (username, password, gmailEmail, gmailPassword, cb) {
  var self = this
  debug('Snapchat.signIn (username %s)', username)

  self._getAuthToken(gmailEmail, gmailPassword, function (err, gauth) {
    if (err) {
      debug('could not retrieve google auth token')
      return cb(err)
    }

    var timestamp = StringUtils.timestamp()

    self._getAttestation(username, password, timestamp, function (err, attestation) {
      if (err) {
        debug('could not retrieve attestation')
        return cb(err)
      }

      self._getGoogleCloudMessagingIdentifier(function (err, ptoken) {
        if (err) {
          debug('could not google cloud messaging identifier')
          return cb(err)
        }


        throw new Error("TODO")
      })
    })
  })
                    [self getGoogleCloudMessagingIdentifier: ^(NSString *ptoken, NSError *error3) {
                        if (!error3) {
                            [self getDeviceToken: ^(NSDictionary *dict, NSError *error4) {
                                if (error4 || !dict) {
                                    completion(nil, [SKRequest errorWithMessage: "Could not retrieve Snapchat device token." code: error4.code?: 1])
                                } else {

                                    _googleAuthToken   = gauth
                                    _googleAttestation = attestation
                                    _deviceToken1i     = dict[SKConsts.deviceToken1i]
                                    _deviceToken1v     = dict[SKConsts.deviceToken1v]

                                    NSString *req_token = [NSString hashSCString: SKConsts.staticToken and: timestamp]
                                    NSString *string    = [NSString stringWithFormat: "%@|%@|%@|%", username, password, timestamp, req_token]
                                    NSString *deviceSig = [[NSString hashHMac: string key: self.deviceToken1v] substringWithRange: NSMakeRange(0, 20)]

                                    NSDictionary *post = @{"username": username,
                                                           "password": password,
                                                           "height": @(kScreenHeight),
                                                           "width": @(kScreenWidth),
                                                           "max_video_width": @480,
                                                           "max_video_height": @640,
                                                           "application_id": "com.snapchat.android",
                                                           "is_two_fa": "false",
                                                           "ptoken": ptoken ?: "ie",
                                                           "pre_auth": "",
                                                           "sflag": @1,
                                                           "dsig": deviceSig,
                                                           "dtoken1i": self.deviceToken1i,
                                                           "attestation": self.googleAttestation,
                                                           "timestamp": timestamp}

                                    NSDictionary *headers = @{SKHeaders.clientAuthToken: [NSString stringWithFormat: "Bearer %", self.googleAuthToken]}
                                    SKRequest *request    = [[SKRequest alloc] initWithPOSTEndpoint: SKEPAccount.login token: nil query: post headers: headers ts: timestamp]
                                    NSURLSession *session = [NSURLSession sessionWithConfiguration: [NSURLSessionConfiguration defaultSessionConfiguration]]

                                    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest: request completionHandler: ^(NSData *data, NSURLResponse *response, NSError *error5) {
                                        [self handleError: error5 data: data response: response completion: ^(NSDictionary *json, NSError *jsonerror) {
                                            dispatch_async(dispatch_get_main_queue(), ^{
                                                if (!jsonerror) {
                                                    self.currentSession = [SKSession sessionWithJSONResponse: json]
                                                    _authToken = self.currentSession.authToken
                                                    completion(json, nil)
                                                } else {
                                                    completion(nil, jsonerror)
                                                }
                                            })
                                        }]
                                    }]
                                    [dataTask resume]
                                }
                            }]
                        } else {
                            completion(nil, [SKRequest errorWithMessage: "Could not retrieve Snapchat push token." code: error3.code?: 1])
                        }
                    }]
                }
            }]
        }
    }]
}

/**
 * Use this to restore a session that ended within the last hour. The google auth token must be re-generated every hour.
 *
 * @param {string} username Your Snapchat username.
 * @param {string} authToken Your Snapchat auth token. Can be retrieved from the \c authToken property.
 * @param {string} googleAuthToken Your Google auth token. Can be retrieved from the \c googleAuthToken property.
 * @param {function} cb
 */
Snapchat.prototype.restoreSession = function (username, authToken, googleAuthToken, cb) {
  var self = this
  debug('Snapchat.restoreSession (username %s)', username)
}

/**
 * Signs out.
 *
 * @param {function} cb
 */
Snapchat.prototype.signOut = function (cb) {
  var self = this
  debug('Snapchat.signOut')
}

/**
 * Updates all information in the \c currentSession property.
 *
 * @param {function} cb
 */
Snapchat.prototype.updateSession = function (cb) {
  var self = this
  debug('Snapchat.updateSession')
}

/**
 * The first step in creating a new Snapchat account. Registers an email, password, and birthday in preparation for creating a new account.
 *
 * The result passed to cb has the following keys:
 *  - \c email: the email you registered with.
 *  - \c snapchat_phone_number: a number you can use to verify your phone number later.
 *  - \c username_suggestions: an array of available usernames for the next step.
 *
 * @param {string} email The email address to be associated with the account.
 * @param {string} password The password of the account to be created.
 * @param {string} birthday Your birthday, in the format YYYY-MM-DD.
 * @param {function} cb
 */
Snapchat.prototype.registerEmail = function (email, password, birthday, cb) {
  var self = this
  debug('Snapchat.registerEmail (email %s)', email)
}

/**
 * The second step in creating a new Snapchat account.
 * Registers a username with an email that was registered in the first step.
 * You must call this method after successfully completing the first step in registration.
 *
 * @param {string} username The username of the account to be created, trimmed to the first 15 characters.
 * @param {string} registeredEmail The email address to be associated with the account, used in the first step of registration.
 * @param {string} gmailEmail A valid GMail address. Required to make Snapchat think this is an official client.
 * @param {string} gmailPassword The password to the Google account associated with gmailEmail.
 * @param {function} cb
 */
Snapchat.prototype.registerUsername = function (username, registeredEmail, gmailEmail, gmailPassword, cb) {
  var self = this
  debug('Snapchat.registerUsername (username %s, email %s)', username, registeredEmail)
}

/**
 * The third and final step in registration.
 * If you don't want to verify your humanity a phone number,
 * you can verify it by with a 'captcha' image of sorts.
 *
 * @param {string} mobile A 10-digit (+ optional country code, defaults to 1) mobile phone number to be associated with the account, in any format. i.e. +11234567890, (123) 456-7890, 1-1234567890
 * @param {boolean} sms YES if you want a code sent via SMS, NO if you want to be called for verification.
 * @param {function} cb
 */
Snapchat.prototype.sendPhoneVerification = function (mobile, sms, cb) {
  var self = this
  debug('Snapchat.sendPhoneVerification (mobile %s, sms %d)', mobile, sms)
}

/**
 * Verifies your phone number, completing registration.
 *
 * @warning cb is not called in this implementaiton because I haven't tested it yet.
 * @todo: document response, get cb working
 * @param {string} code The code sent to verify your number.
 * @param {function} cb
*/
Snapchat.prototype.verifyPhoneNumber = function (code, cb) {
  var self = this
  debug('Snapchat.verifyPhoneNumber (code %s)', code)
}

/**
 * Downloads captcha images to verify a new account with.
 * cb will be called with an array of 9 Blobs representing captcha images.
 *
 * @param {function} cb
 */
Snapchat.prototype.getCaptcha = function (cb) {
  var self = this
  debug('Snapchat.getCaptcha')
}

/**
 * Use this to 'solve' a captcha.
 * @warning Seems to not be working.
 * @todo: document response
 *
 * @param {string} solution The solution to the captcha as a binary string. If the first, second, and last images contain ghosts, the solution would be \c '110000001'.
 * @param {function} cb
 */
Snapchat.prototype.solveCaptcha = function (solution, cb) {
  var self = this
  debug('Snapchat.solveCaptcha')
}

/**
 * internal
 */
Snapchat.prototype._post = function (endpoint, params, cb) {
}

/**
 * internal
 */
Snapchat.prototype._get = function (endpoint, cb) {
}

/**
 * internal
 */
Snapchat.prototype._sendEvents = function (events, snapInfo, cb) {
}

/**
 * internal
 */
Snapchat.prototype._getAuthToken = function (gmailEmail, gmailPassword, cb) {
  var self = this
  var params = {
    'google_play_services_version': '7097038',
    'device_country': 'us',
    'operatorCountry': 'us',
    'lang': 'en_US',
    'sdk_version': '19',
    'accountType': 'HOSTED_OR_GOOGLE',
    'Email': gmailEmail,
    'Passwd': gmailPassword,
    'service': 'audience: server: client_id: 694893979329-l59f3phl42et9clpoo296d8raqoljl6p.apps.googleusercontent.com',
    'source': 'android',
    'androidId': '378c184c6070c26c',
    'app': 'com.snapchat.android',
    'client_sig': '49f6badb81d89a9e38d65de76f09355071bd67e7',
    'callerPkg': 'com.snapchat.android',
    'callerSig': '49f6badb81d89a9e38d65de76f09355071bd67e7'
  }

  var headers = {
    'device': '378c184c6070c26c',
    'app': 'com.snapchat.android',
    'Accept-Encoding': 'gzip'
  }

  headers[constants.headers.userAgent] = 'GoogleAuth/1.4 (mako JDQ39)'

  request.post({
    url: 'https://android.clients.google.com/auth',
    form: params,
    headers: headers
  }, function (err, httpResponse, body) {
    // TODO
    console.error(err, httpResponse, body)
    process.exit(1)

    if (err) {
      cb(err)
    } else {
      cb(err, body)
    }
  })
}

/**
 * internal
 */
Snapchat.prototype._getDeviceToken = function (cb) {
  // TODO
  var dt1i = null
  var dt1v = null

  function completion () {
    var result = { }
    result[constants.core.deviceToken1i] = dt1i
    result[constants.core.deviceToken1v] = dt1v

    cb(null, result)
  }

  if (dt1i && dt1v) {
    completion()
  } else {
    var headers = {}
    // TODO

    Request.postTo(constants.endpoints.device.identifier, { }, headers, null, function (err, response, body) {
      cb('TODO')
    })
  }
}

/**
 * ptoken value
 * internal
 */
Snapchat.prototype._getGoogleCloudMessagingIdentifier = function (cb) {
  var params = {
    "X-google.message_id": "google.rpc1",
    "device": 4343470343591528399,
    "sender": 191410808405,
    "app_ver": 706,
    "gcm_ver": 7097038,
    "app": "com.snapchat.android",
    "iat": (new Date()).value,
    "cert": "49f6badb81d89a9e38d65de76f09355071bd67e7"
  }

  var headers = {
    'Accept-Language': 'en',
    'Accept-Locale': 'en_US',
    'app': 'com.snapchat.android',
    'Authorization': 'AidLogin 4343470343591528399: 5885638743641649694',
    'Gcm-ver': '7097038',
    'Accept-Encoding': 'gzip'
  }

  headers[constants.headers.userAgent] = "Android-GCM/1.5 (A116 _Quad KOT49H)"

  request.post({
    url: "https://android.clients.google.com/c2dm/register3",
    form: params,
    headers: headers
  }, function (err, httpResponse, body) {
    if (err) {
      cb(err)
    } else if (body) {
      // TODO: parse token=
    }
  })

      if (error) {
          callback(nil, error)
      } else if (data) {
          NSString *string = [[NSString alloc] initWithData: data encoding: NSUTF8StringEncoding]
          string = [string matchGroupAtIndex: 1 forRegex: "token=([\\w\\.-]+)"]
          callback(string, nil)
      } else {
          callback(nil, [SKRequest errorWithMessage: "Unknown error" code: [(NSHTTPURLResponse *)response statusCode]])
      }
  }]
  [dataTask resume]
}

/**
 * Attestation, courtesy of \c casper.io
 * internal
 */
Snapchat.prototype._getAttestation = function (username, password, ts, cb) {
  var hashString = uesrname + "|" + password + "|" + ts + "|" + constants.endpoints.account.login
  NSString *nonce          = [hashString.sha256HashRaw base64EncodedStringWithOptions: 0];

  NSDictionary *query = @{@"nonce": nonce,
                          @"authentication": SKAttestation.auth,
                          @"apk_digest": SKAttestation.digest9_12_2,
                          @"timestamp": ts};
  NSData *queryData  = [[NSString queryStringWithParams: query] dataUsingEncoding: NSUTF8StringEncoding];

  NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL: [NSURL URLWithString: SKAttestation.URLCasper]];
  request.HTTPMethod  = @"POST";
  request.HTTPBody    = queryData;
  [request setValue: @"application/x-www-form-urlencoded" forHTTPHeaderField: @"Content-type"];

  NSURLSession *session = [NSURLSession sessionWithConfiguration: [NSURLSessionConfiguration defaultSessionConfiguration]];
  NSURLSessionDataTask *dataTask = [session dataTaskWithRequest: request completionHandler: ^(NSData *data, NSURLResponse *response, NSError *error) {
      if (error) {
          completion(nil, error);
      } else if (data) {
          NSError *jsonError;
          NSDictionary *json = [NSJSONSerialization JSONObjectWithData: data options: 0 error: &jsonError];

          if (jsonError)
              completion(nil, jsonError);
          else if ([json[@"code"] integerValue] == 200)
              completion(json[@"signedAttestation"], nil);
          else
              completion(nil, [SKRequest unknownError]);
      } else {
          completion(nil, [SKRequest unknownError]);
      }
  }];

  [dataTask resume];

}