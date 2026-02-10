/**
 * 'api/project': API server initialization and general GET/POST
 */

const fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
const authJwt = require('./jwt-helper');
const rateLimit = require("express-rate-limit");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

var prjApi = require('./projects');
var authApi = require('./auth');
var usersApi = require('./users');
var alarmsApi = require('./alarms');
var pluginsApi = require('./plugins');
var diagnoseApi = require('./diagnose');
var scriptsApi = require('./scripts');
var resourcesApi = require('./resources');
var daqApi = require('./daq');
var commandApi = require('./command');
var playRestrictionsApi = require('./playrestrictions');
var defaultViewRestrictionsApi = require('./defaultViewRestrictions');
var userPreferencesApi = require('./userpreferences');
var deviceTemplatesApi = require('./deviceTemplates');
var dataPointsApi = require('./dataPoints');
var dataPointGroupsApi = require('./dataPointGroups');
var commandLibraryApi = require('./commandLibrary');
var dropdownApi = require('./dropdown');
const reports = require('../dist/reports.service');
const reportsApi = new reports.ReportsApiService();

var apiApp;
var server;
var runtime;

function init(_server, _runtime) {
    server = _server;
    runtime = _runtime;
    return new Promise(function (resolve, reject) {
        if (runtime.settings.disableServer !== false) {
            apiApp = express();
            apiApp.use(morgan(['combined', 'common', 'dev', 'short', 'tiny'].
                includes(runtime.settings.logApiLevel) ? runtime.settings.logApiLevel : 'combined'));

            var maxApiRequestSize = runtime.settings.apiMaxLength || '35mb';
            console.log('API Max Request Size:', maxApiRequestSize);
            apiApp.use(bodyParser.json({limit:maxApiRequestSize, strict: false}));
            apiApp.use(bodyParser.urlencoded({limit:maxApiRequestSize, extended:true, parameterLimit: 50000}));
            // 全域 CORS 設定：允許前端跨網域呼叫 API
            apiApp.use(function(req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-auth-user");
                res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
                if (req.method === 'OPTIONS') {
                    return res.sendStatus(204);
                }
                next();
            });
            authJwt.init(runtime.settings.secureEnabled, runtime.settings.secretCode, runtime.settings.tokenExpiresIn);
            prjApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(prjApi.app());
            usersApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(usersApi.app());
            alarmsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(alarmsApi.app());
            authApi.init(runtime, authJwt.secretCode, authJwt.tokenExpiresIn);
            apiApp.use(authApi.app());
            pluginsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(pluginsApi.app());
            diagnoseApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(diagnoseApi.app());
            daqApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(daqApi.app());
            scriptsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(scriptsApi.app());
            resourcesApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(resourcesApi.app());
            commandApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(commandApi.app());
            playRestrictionsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(playRestrictionsApi.app());
            defaultViewRestrictionsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(defaultViewRestrictionsApi.app());
            userPreferencesApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(userPreferencesApi.app());
            deviceTemplatesApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(deviceTemplatesApi.app());
            dataPointsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(dataPointsApi.app());
            dataPointGroupsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(dataPointGroupsApi.app());
            commandLibraryApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(commandLibraryApi.app());
            dropdownApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(dropdownApi.app());
            reportsApi.init(runtime, authJwt.verifyToken, verifyGroups);
            apiApp.use(reportsApi.app());

            const limiter = rateLimit({
                windowMs: 5 * 60 * 1000, // 5 minutes
                max: 100 // limit each IP to 100 requests per windowMs
            });

            //  apply to all requests
            apiApp.use(limiter);

            /**
             * Swagger API Documentation
             */
            apiApp.use('/api-docs', swaggerUi.serve);
            apiApp.get('/api-docs', swaggerUi.setup(swaggerSpec, {
                customCss: '.swagger-ui .topbar { display: none }',
                customSiteTitle: 'FUXA API Documentation'
            }));

            /**
             * Swagger JSON endpoint
             */
            apiApp.get('/api-docs.json', function(req, res) {
                res.setHeader('Content-Type', 'application/json');
                res.send(swaggerSpec);
            });

            /**
             * GET Server setting data
             */
            apiApp.get('/api/settings', function (req, res) {
                if (runtime.settings) {
                    let tosend = JSON.parse(JSON.stringify(runtime.settings));
                    delete tosend.secretCode;
                    if (tosend.smtp) {
                        delete tosend.smtp.password;
                    }
                    // res.header("Access-Control-Allow-Origin", "*");
                    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    res.json(tosend);
                } else {
                    res.status(404).end();
                    runtime.logger.error('api get settings: Value Not Found!');
                }
            });

            /**
             * POST Server user settings
             */
            apiApp.post("/api/settings", authJwt.verifyToken, function(req, res, next) {
                const permission = verifyGroups(req);
                if (res.statusCode === 403) {
                    runtime.logger.error("api post settings: Tocken Expired");
                } else if (!authJwt.haveAdminPermission(permission)) {
                    res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                    runtime.logger.error("api post settings: Unauthorized");
                } else {
                    try {
                        if (req.body.smtp && !req.body.smtp.password && runtime.settings.smtp && runtime.settings.smtp.password) {
                            req.body.smtp.password = runtime.settings.smtp.password;
                        }
                        fs.writeFileSync(runtime.settings.userSettingsFile, JSON.stringify(req.body, null, 4));
                        mergeUserSettings(req.body);
                        runtime.restart(true).then(function(result) {
                            res.end();
                        });
                    } catch (err) {
                        res.status(400).json({ error: "unexpected_error", message: err });
                        runtime.logger.error("api post settings: " + err);
                    }
                }
            });

            /**
             * GET Heartbeat to check token
             */
            apiApp.post('/api/heartbeat', authJwt.verifyToken, function (req, res) {
                if (!runtime.settings.secureEnabled) {
                    res.end();
                } else if (res.statusCode === 403) {
                    runtime.logger.error("api post heartbeat: Tocken Expired");
                } else if (req.body.params) {
                    const token = authJwt.getNewToken(req.headers)
                    if (token) {
                        res.status(200).json({
                            message: 'tokenRefresh',
                            token: token
                        });
                    } else {
                        res.end();
                    }
                } else if (req.userId === 'guest') {
                    res.status(200).json({
                        message: 'guest',
                        token: authJwt.getGuestToken()
                    });
                } else {
                    res.end();
                }
            });
            runtime.logger.info('api: init successful!', true);
        } else {
        }
        resolve();
    });
}

function mergeUserSettings(settings) {
    if (settings.language) {
        runtime.settings.language = settings.language;
    }
    runtime.settings.broadcastAll = settings.broadcastAll;
    runtime.settings.secureEnabled = settings.secureEnabled;
    runtime.settings.logFull = settings.logFull;
    runtime.settings.userRole = settings.userRole;
    if (settings.secureEnabled) {
        runtime.settings.tokenExpiresIn = settings.tokenExpiresIn;
    }
    if (settings.smtp) {
        runtime.settings.smtp = settings.smtp;
    }
    if (settings.daqstore) {
        runtime.settings.daqstore = settings.daqstore;
    }
    if (settings.alarms) {
        runtime.settings.alarms = settings.alarms;
    }
}

function verifyGroups(req) {
    if (runtime.settings && runtime.settings.secureEnabled) {
        if (req.tokenExpired) {
            return (runtime.settings.userRole) ? null : 0;
        }
        const userInfo = runtime.users.getUserCache(req.userId);
        return (runtime.settings.userRole && req.userId !== 'admin') ? userInfo : userInfo ? userInfo.groups : req.userGroups;
    } else {
        return authJwt.adminGroups[0];
    }
}

function start() {
}

function stop() {
}

module.exports = {
    init: init,
    start: start,
    stop: stop,

    get apiApp() { return apiApp; },
    get server() { return server; },
    get authJwt() { return authJwt; }
};
