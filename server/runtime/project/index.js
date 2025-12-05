/*
* Project manager: read, write, add, remove, ... and save
*/

'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');

var events = require('../events');
var utils = require('../utils');
const prjstorage = require('./prjstorage');
const DeviceType = require('../devices/device').DeviceType;

const version = '1.02';
var settings;                   // Application settings
var logger;                     // Application logger
var runtime;

var data = {};                  // Project data

/**
 * Init Project resource and update project
 * @param {*} _settings
 * @param {*} log
 */
function init(_settings, log, _runtime) {
    settings = _settings;
    logger = log;
    runtime = _runtime;

    // Init Project database
    return new Promise(function (resolve, reject) {
        prjstorage.init(settings, logger).then(result => {
            logger.info('project.prjstorage-init-successful!', true);
            if (result) {
                resolve();
            } else {
                prjstorage.setDefault().then(result => {
                    logger.info('project.prjstorage-set-default-successful!', true);
                    resolve();
                }).catch(function (err) {
                    logger.error(`project.prjstorage-set-default failed! ${err}`);
                    resolve();
                });
            }
        }).catch(function (err) {
            logger.error(`project.prjstorage-failed-to-init! ${err}`);
            reject(err);
        });
    });
}

/**
 * Load project resource in a local data
 * Read all storaged sections and fill in local data
 */
function load() {
    return new Promise(function (resolve, reject) {
        data = { devices: {}, hmi: { views: [], templates: [] }, texts: [], alarms: [] };
        // load general data
        prjstorage.getSection(prjstorage.TableType.GENERAL).then(grows => {
            for (var ig = 0; ig < grows.length; ig++) {
                if (grows[ig].name === ProjectDataCmdType.HmiLayout) {
                    data.hmi[grows[ig].name] = JSON.parse(grows[ig].value);
                } else {
                    data[grows[ig].name] = JSON.parse(grows[ig].value);
                }
            }
            // load views
            prjstorage.getSection(prjstorage.TableType.VIEWS).then(vrows => {
                for (var iv = 0; iv < vrows.length; iv++) {
                    var view = JSON.parse(vrows[iv].value);
                    // Add visibility_scope from database column to view object
                    view.visibility_scope = vrows[iv].visibility_scope || 'global';
                    data.hmi.views.push(view);
                }
                // load templates
                prjstorage.getSection(prjstorage.TableType.TEMPLATES).then(trows => {
                    for (var it = 0; it < trows.length; it++) {
                        data.hmi.templates.push(JSON.parse(trows[it].value));
                    }
                // load devices
                prjstorage.getSection(prjstorage.TableType.DEVICES).then(drows => {
                    for (var id = 0; id < drows.length; id++) {
                        if (drows[id].name === 'server') {
                            data[drows[id].name] = JSON.parse(drows[id].value);
                        } else {
                            data.devices[drows[id].name] = JSON.parse(drows[id].value);
                        }
                    }
                    async.series([
                        // step 1 get texts
                        function (callback) {
                            getTexts().then(texts => {
                                data.texts = texts;
                                callback();
                            }).catch(function (err) {
                                logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.TEXTS}' ${err}`);
                                callback(err);
                            });
                        },
                        // step 2 get alarms
                        function (callback) {
                            getAlarms().then(alarms => {
                                data.alarms = alarms;
                                callback();
                            }).catch(function (err) {
                                logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.ALARMS}' ${err}`);
                                callback(err);
                            });
                        },
                        // step 3 get notifications
                        function (callback) {
                            getNotifications().then(notifications => {
                                data.notifications = notifications;
                                callback();
                            }).catch(function (err) {
                                logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.NOTIFICATIONS}' ${err}`);
                                callback(err);
                            });
                        },
                        // step 4 get scripts
                        function (callback) {
                            getScripts().then(scripts => {
                                data.scripts = scripts;
                                callback();
                            }).catch(function (err) {
                                logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.SCRIPTS}' ${err}`);
                                callback(err);
                            });
                        },
                        // step 5 get reports
                        function (callback) {
                            getReports().then(reports => {
                                data.reports = reports;
                                callback();
                            }).catch(function (err) {
                                logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.REPORTS}' ${err}`);
                                callback(err);
                            });
                        },
                        // step 6 get MapsLocations
                        function (callback) {
                            getMapsLocations().then(locations => {
                                data.mapsLocations = locations;
                                callback();
                            }).catch(function (err) {
                                logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.LOCATIONS}' ${err}`);
                                callback(err);
                            });
                        }
                    ],
                    async function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            await _mergeDefaultConfig();
                            resolve();
                        }
                    });
                }).catch(function (err) {
                    logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.DEVICES}' ${err}`);
                    reject(err);
                });
                }).catch(function (err) {
                    logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.TEMPLATES}' ${err}`);
                    reject(err);
                });
            }).catch(function (err) {
                logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.VIEWS}' ${err}`);
                reject(err);
            });
        }).catch(function (err) {
            logger.error(`project.prjstorage-failed-to-load! '${prjstorage.TableType.GENERAL}' ${err}`);
            reject(err);
        });
    });
}

/**
 * Save the value in project storage
 * First set the value in local data, then save in storage
 * @param {*} cmd
 * @param {*} data
 */
function setProjectData(cmd, value) {
    return new Promise(function (resolve, reject) {
        try {
            var toremove = false;
            var section = { table: '', name: '', value: value };

            // Generate short GUID helper function
            function getShortGUID(prefix) {
                return (prefix || '') + Math.random().toString(36).substring(2, 15) +
                       Math.random().toString(36).substring(2, 15);
            }

            if (cmd === ProjectDataCmdType.SetView) {
                section.table = prjstorage.TableType.VIEWS;
                section.name = value.id;
                section.visibility_scope = value.visibility_scope || 'global';
                setView(value);
            } else if (cmd === ProjectDataCmdType.AddView) {
                // Auto-generate ID if not provided or empty
                if (!value.id || value.id.trim() === '') {
                    value.id = getShortGUID('v_');
                }
                section.table = prjstorage.TableType.VIEWS;
                section.name = value.id;
                section.visibility_scope = value.visibility_scope || 'global';
                setView(value);
            } else if (cmd === ProjectDataCmdType.DelView) {
                section.table = prjstorage.TableType.VIEWS;
                section.name = value.id;
                toremove = removeView(value);
            } else if (cmd === ProjectDataCmdType.SetTemplate) {
                section.table = prjstorage.TableType.TEMPLATES;
                section.name = value.id;
                setTemplate(value);
            } else if (cmd === ProjectDataCmdType.AddTemplate) {
                // Auto-generate ID if not provided or empty
                if (!value.id || value.id.trim() === '') {
                    value.id = getShortGUID('t_');
                }
                section.table = prjstorage.TableType.TEMPLATES;
                section.name = value.id;
                setTemplate(value);
            } else if (cmd === ProjectDataCmdType.DelTemplate) {
                section.table = prjstorage.TableType.TEMPLATES;
                section.name = value.id;
                toremove = removeTemplate(value);
            } else if (cmd === ProjectDataCmdType.CloneView) {
                var clonedView = cloneView(value.viewId, value.newName);
                section.table = prjstorage.TableType.VIEWS;
                section.name = clonedView.id;
                section.value = clonedView;
            } else if (cmd === ProjectDataCmdType.HmiLayout) {
                section.table = prjstorage.TableType.GENERAL;
                section.name = cmd;
                setHmiLayout(value);
            } else if (cmd === ProjectDataCmdType.SetDevice) {
                section.table = prjstorage.TableType.DEVICES;
                section.name = value.id;
                setDevice(value);
            } else if (cmd === ProjectDataCmdType.DelDevice) {
                section.table = prjstorage.TableType.DEVICES;
                section.name = value.id;
                toremove = removeDevice(value);
            } else if (cmd === ProjectDataCmdType.Charts) {
                section.table = prjstorage.TableType.GENERAL;
                section.name = cmd;
                setCharts(value);
            } else if (cmd === ProjectDataCmdType.Languages) {
                section.table = prjstorage.TableType.GENERAL;
                section.name = cmd;
                setLanguages(value);
            } else if (cmd === ProjectDataCmdType.ClientAccess) {
                section.table = prjstorage.TableType.GENERAL;
                section.name = cmd;
                setClientAccess(value);
            } else if (cmd === ProjectDataCmdType.Graphs) {
                section.table = prjstorage.TableType.GENERAL;
                section.name = cmd;
                setGraphs(value);
            } else if (cmd === ProjectDataCmdType.SetText) {
                section.table = prjstorage.TableType.TEXTS;
                section.name = value.id;
                setText(value);
            } else if (cmd === ProjectDataCmdType.DelText) {
                section.table = prjstorage.TableType.TEXTS;
                section.name = value.id;
                toremove = removeText(value);
            } else if (cmd === ProjectDataCmdType.SetAlarm) {
                section.table = prjstorage.TableType.ALARMS;
                section.name = value.name;
                setAlarm(value);
            } else if (cmd === ProjectDataCmdType.DelAlarm) {
                section.table = prjstorage.TableType.ALARMS;
                section.name = value.name;
                toremove = removeAlarm(value);
            } else if (cmd === ProjectDataCmdType.SetNotification) {
                section.table = prjstorage.TableType.NOTIFICATIONS;
                section.name = value.id;
                setNotification(value);
            } else if (cmd === ProjectDataCmdType.DelNotification) {
                section.table = prjstorage.TableType.NOTIFICATIONS;
                section.name = value.id;
                toremove = removeNotification(value);
            } else if (cmd === ProjectDataCmdType.SetScript) {
                section.table = prjstorage.TableType.SCRIPTS;
                section.name = value.id;
                setScript(value);
            } else if (cmd === ProjectDataCmdType.DelScript) {
                section.table = prjstorage.TableType.SCRIPTS;
                section.name = value.id;
                toremove = removeScript(value);
            } else if (cmd === ProjectDataCmdType.SetReport) {
                section.table = prjstorage.TableType.REPORTS;
                section.name = value.id;
                setReport(value);
            } else if (cmd === ProjectDataCmdType.DelReport) {
                section.table = prjstorage.TableType.REPORTS;
                section.name = value.id;
                toremove = removeReport(value);
            } else if (cmd === ProjectDataCmdType.SetMapsLocation) {
                section.table = prjstorage.TableType.LOCATIONS;
                section.name = value.id;
                setMapsLocation(value);
            } else if (cmd === ProjectDataCmdType.DelMapsLocation) {
                section.table = prjstorage.TableType.LOCATIONS;
                section.name = value.id;
                toremove = removeMapsLocation(value);
            } else {
                logger.error(`prjstorage.setdata failed! '${section.table}'`);
                reject('prjstorage.failed-to-setdata: Command not found!');
            }
            if (toremove) {
                prjstorage.deleteSection(section).then(result => {
                    resolve(true);
                }).catch(function (err) {
                    logger.error(`prjstorage.deletedata failed! '${section.table}'`);
                    reject(err);
                });
            } else {
                prjstorage.setSection(section).then(result => {
                    resolve(true);
                }).catch(function (err) {
                    logger.error(`prjstorage.setdata failed! '${section.table}'`);
                    reject(err);
                });
            }
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Set or add if not exist (check with view.id) the View in Project
 * @param {*} view
 */
function setView(view) {
    var pos = -1;
    for (var i = 0; i < data.hmi.views.length; i++) {
        if (data.hmi.views[i].id === view.id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.hmi.views[pos] = view;
    } else {
        data.hmi.views.push(view);
    }
}

/**
 * Clone a View in Project
 * @param {*} viewId - ID of the view to clone
 * @param {*} newName - Optional new name for the cloned view
 * @returns {*} The cloned view object
 */
function cloneView(viewId, newName) {
    // Find the source view
    var sourceView = null;
    for (var i = 0; i < data.hmi.views.length; i++) {
        if (data.hmi.views[i].id === viewId) {
            sourceView = data.hmi.views[i];
            break;
        }
    }

    if (!sourceView) {
        throw new Error('View not found: ' + viewId);
    }

    // Generate short GUID (similar to client-side Utils.getShortGUID)
    function getShortGUID() {
        return Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
    }

    // Deep clone the view
    var clonedView = JSON.parse(JSON.stringify(sourceView));

    // Generate new IDs
    clonedView.id = 'v_' + getShortGUID();

    // Generate new name if not provided
    if (!newName) {
        var nn = 'View_';
        var idx = 1;
        for (idx = 1; idx < data.hmi.views.length + 2; idx++) {
            var found = false;
            for (var i = 0; i < data.hmi.views.length; i++) {
                if (data.hmi.views[i].name === nn + idx) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                break;
            }
        }
        clonedView.name = nn + idx;
    } else {
        clonedView.name = newName;
    }

    // Change all gauge IDs in items
    if (clonedView.items) {
        var newItems = {};
        for (var oldId in clonedView.items) {
            var newId = getShortGUID();
            newItems[newId] = clonedView.items[oldId];

            // Update svgcontent to replace old IDs with new IDs
            if (clonedView.svgcontent) {
                var regex = new RegExp(oldId, 'g');
                clonedView.svgcontent = clonedView.svgcontent.replace(regex, newId);
            }
        }
        clonedView.items = newItems;
    }

    // Add the cloned view to the project
    data.hmi.views.push(clonedView);

    return clonedView;
}

/**
 * Remove the View from Project
 * @param {*} view
 */
function removeView(view) {
    var pos = -1;
    for (var i = 0; i < data.hmi.views.length; i++) {
        if (data.hmi.views[i].id === view.id) {
            data.hmi.views.splice(i, 1);
            return true;
        }
    }
    return false;
}

/**
 * Set/Update Template in Project
 * @param {*} template
 */
function setTemplate(template) {
    var pos = -1;
    for (var i = 0; i < data.hmi.templates.length; i++) {
        if (data.hmi.templates[i].id === template.id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.hmi.templates[pos] = template;
    } else {
        data.hmi.templates.push(template);
    }
}

/**
 * Remove Template from Project
 * @param {*} template
 * @returns {boolean} true if removed
 */
function removeTemplate(template) {
    for (var i = 0; i < data.hmi.templates.length; i++) {
        if (data.hmi.templates[i].id === template.id) {
            data.hmi.templates.splice(i, 1);
            return true;
        }
    }
    return false;
}

/**
 * Get all Templates
 * @returns {Array} Array of templates
 */
function getTemplates() {
    return data.hmi.templates || [];
}

/**
 * Convert Template to View
 * @param {*} templateId - ID of the template to convert
 * @param {*} newName - Optional new name for the view
 * @returns {*} The new view object
 */
function convertTemplateToView(templateId, newName) {
    var sourceTemplate = null;
    for (var i = 0; i < data.hmi.templates.length; i++) {
        if (data.hmi.templates[i].id === templateId) {
            sourceTemplate = data.hmi.templates[i];
            break;
        }
    }

    if (!sourceTemplate) {
        throw new Error('Template not found: ' + templateId);
    }

    // Generate short GUID (similar to client-side Utils.getShortGUID)
    function getShortGUID() {
        return Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
    }

    // Deep clone the template
    var newView = JSON.parse(JSON.stringify(sourceTemplate));

    // Generate new ID for view
    newView.id = 'v_' + getShortGUID();

    // Handle name
    if (newName) {
        newView.name = newName;
    } else {
        // Generate unique name based on template name
        var baseName = sourceTemplate.name || 'View';
        var name = baseName;
        var counter = 1;
        var nameExists = true;

        while (nameExists) {
            nameExists = false;
            for (var i = 0; i < data.hmi.views.length; i++) {
                if (data.hmi.views[i].name === name) {
                    nameExists = true;
                    name = baseName + ' (' + counter + ')';
                    counter++;
                    break;
                }
            }
        }
        newView.name = name;
    }

    // Change all gauge IDs in items
    if (newView.items) {
        var newItems = {};
        for (var oldId in newView.items) {
            var newId = getShortGUID();
            newItems[newId] = newView.items[oldId];
            newItems[newId].id = newId;

            // Update svgcontent to replace old IDs with new IDs
            if (newView.svgcontent) {
                var regex = new RegExp(oldId, 'g');
                newView.svgcontent = newView.svgcontent.replace(regex, newId);
            }
        }
        newView.items = newItems;
    }

    // Note: Do NOT add to data.hmi.views here
    // The API endpoint will handle adding it via setProjectData after this returns
    // This ensures proper state management and avoids duplicate entries

    // Note: Do NOT remove from templates here
    // The API endpoint will handle removing it via setProjectData after this returns

    return newView;
}

/**
 * Set Device to local data
 * @param {*} device
 * @param {*} merge merge with exist (tags)
 */
function setDevice(device, merge) {
    if (merge && data.devices[device.id]) {
        device.enabled = data.devices[device.id].enabled;
        data.devices[device.id] = {...data.devices[device.id], ...device};
    } else {
        data.devices[device.id] = device;
    }
}

/**
 * Remove Device from local data
 * @param {*} device
 */
function removeDevice(device) {
    delete data.devices[device.id];
    return true;
}

/**
 * Set HMI Layout to local data
 * @param {*} layout
 */
function setHmiLayout(layout) {
    data.hmi.layout = layout;
}

/**
 * Set Charts
 * @param {*} charts
 */
function setCharts(charts) {
    data.charts = charts;
}

/**
 * Set Graphs
 * @param {*} graphs
 */
 function setGraphs(graphs) {
    data.graphs = graphs;
}

/**
 * Set Languages
 * @param {*} languages
 */
function setLanguages(languages) {
    data.languages = languages;
}

/**
 * Set ClientAccess
 * @param {*} clientAccess
 */
function setClientAccess(clientAccess) {
    data.clientAccess = clientAccess;
}

/**
 * Set or add if not exist (check with taxt.name) the Text in Project
 * @param {*} text
 */
function setText(text) {
    if (!data.texts) {
        data.texts = [];
    }
    var pos = -1;
    for (var i = 0; i < data.texts.length; i++) {
        if (data.texts[i].id === text.id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.texts[pos] = text;
    } else {
        data.texts.push(text);
    }
}

/**
 * Remove the Text from Project
 * @param {*} text
 */
function removeText(text) {
    if (data.texts) {
        for (var i = 0; i < data.texts.length; i++) {
            if (data.texts[i].id === text.id) {
                data.texts.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}

/**
 * Set or add if not exist (check with alarm.name) the Alarm in Project
 * @param {*} alarm
 */
function setAlarm(alarm) {
    if (!data.alarms) {
        data.alarms = [];
    }
    var pos = -1;
    for (var i = 0; i < data.alarms.length; i++) {
        if (data.alarms[i].name === alarm.name) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.alarms[pos] = alarm;
    } else {
        data.alarms.push(alarm);
    }
}

/**
 * Remove the Alarm from Project
 * @param {*} alarm
 */
function removeAlarm(alarm) {
    if (data.alarms) {
        for (var i = 0; i < data.alarms.length; i++) {
            if (data.alarms[i].name === alarm.name) {
                data.alarms.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}

/**
 * Set or add if not exist (check with notification.id) the Notification in Project
 * @param {*} notification
 */
 function setNotification(notification) {
    if (!data.notifications) {
        data.notifications = [];
    }
    var pos = -1;
    for (var i = 0; i < data.notifications.length; i++) {
        if (data.notifications[i].id === notification.id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.notifications[pos] = notification;
    } else {
        data.notifications.push(notification);
    }
}

/**
 * Remove the Notification from Project
 * @param {*} notification
 */
function removeNotification(notification) {
    if (data.notifications) {
        for (var i = 0; i < data.notifications.length; i++) {
            if (data.notifications[i].id === notification.id) {
                data.notifications.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}

/**
 * Set or add if not exist (check with script.id) the Script in Project
 * @param {*} script
 */
 function setScript(script) {
    if (!data.scripts) {
        data.scripts = [];
    }
    var pos = -1;
    for (var i = 0; i < data.scripts.length; i++) {
        if (data.scripts[i].id === script.id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.scripts[pos] = script;
    } else {
        data.scripts.push(script);
    }
}

/**
 * Remove the Script from Project
 * @param {*} script
 */
 function removeScript(script) {
    if (data.scripts) {
        for (var i = 0; i < data.scripts.length; i++) {
            if (data.scripts[i].id === script.id) {
                data.scripts.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}

/**
 * Set or add if not exist (check with report.id) the Report in Project
 * @param {*} report
 */
 function setReport(report) {
    if (!data.reports) {
        data.reports = [];
    }
    var pos = -1;
    for (var i = 0; i < data.reports.length; i++) {
        if (data.reports[i].id === report.id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.reports[pos] = report;
    } else {
        data.reports.push(report);
    }
}

/**
 * Remove the Report from Project
 * @param {*} script
 */
 function removeReport(report) {
    if (data.reports) {
        for (var i = 0; i < data.reports.length; i++) {
            if (data.reports[i].id === report.id) {
                data.reports.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}

/**
 * Set or add if not exist (check with location.id) the MapsLocation in Project
 * @param {*} location
 */
function setMapsLocation(location) {
    if (!data.mapsLocations) {
        data.mapsLocations = [];
    }
    var pos = -1;
    for (var i = 0; i < data.mapsLocations.length; i++) {
        if (data.mapsLocations[i].id === location.id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        data.mapsLocations[pos] = location;
    } else {
        data.mapsLocations.push(location);
    }
}

/**
 * Remove the Maps Locations from Project
 * @param {*} location
 */
function removeMapsLocation(location) {
    if (data.mapsLocations) {
        for (var i = 0; i < data.mapsLocations.length; i++) {
            if (data.mapsLocations[i].id === location.id) {
                data.mapsLocations.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}
/**
 * Get the project data in accordance with autorization
 * When playRestrictionEnabled is true, views will be filtered based on user/role restrictions
 * @param {*} userId - FUXA internal user ID
 * @param {*} userPermission - User permission object
 * @param {*} dmsUserId - DMS external user ID for play restriction filtering
 * @param {*} dmsRoleId - DMS external role ID for play restriction filtering
 */
function getProject(userId, userPermission, dmsUserId, dmsRoleId) {
    return new Promise(async function (resolve, reject) {
            logger.info('project.getProject: Called with dmsUserId=' + dmsUserId + ', dmsRoleId=' + dmsRoleId + ', playRestrictionEnabled=' + settings.playRestrictionEnabled);
        try {
            let pdata = _filterProjectPermission(userPermission);

            // Apply play restrictions filter if enabled and DMS user info is provided
            if (settings.playRestrictionEnabled && (dmsUserId || dmsRoleId)) {
                const allowedViewsResult = await getAllowedViewsForUser(dmsUserId, dmsRoleId);
                if (allowedViewsResult && allowedViewsResult.views) {
                    if (allowedViewsResult.views.length > 0) {
                        // Filter views based on allowed views
                        const allowedViewIds = new Set(allowedViewsResult.views);
                        pdata.hmi.views = pdata.hmi.views.filter(view => allowedViewIds.has(view.id));

                        // Also filter navigation items that reference restricted views
                        if (pdata.hmi.layout && pdata.hmi.layout.navigation && pdata.hmi.layout.navigation.items) {
                            pdata.hmi.layout.navigation.items = pdata.hmi.layout.navigation.items.filter(item => {
                                // Keep items without view reference or with allowed view reference
                                return !item.view || allowedViewIds.has(item.view);
                            });
                        }
                        logger.info('project.getProject: Filtered ' + pdata.hmi.views.length + ' views for dmsUserId=' + dmsUserId + ', dmsRoleId=' + dmsRoleId);
                    } else if (!allowedViewsResult.isSuperAdmin) {
                        // No views allowed and not super admin - return empty views
                        pdata.hmi.views = [];
                        if (pdata.hmi.layout && pdata.hmi.layout.navigation) {
                            pdata.hmi.layout.navigation.items = [];
                        }
                        logger.info('project.getProject: No views allowed for dmsUserId=' + dmsUserId + ', dmsRoleId=' + dmsRoleId);
                    }
                }
            }

            resolve(pdata);
        } catch (err) {
            logger.error('project.getProject failed: ' + err);
            // Fallback to filtered permission data without play restrictions
            const pdata = _filterProjectPermission(userPermission);
            resolve(pdata);
        }
    });
}

/**
 * Set the new Project, clear all from database and add the new content
 * When playRestrictionEnabled is true, merges filtered views from client with complete views from server
 * @param {*} prjcontent
 */
function setProject(prjcontent) {
    return new Promise(async function (resolve, reject) {
        try {
            // If play restriction is enabled, merge views before clearing
            let mergedViews = null;
            if (settings.playRestrictionEnabled && prjcontent.hmi && prjcontent.hmi.views) {
                // Get existing views from database before clearing
                const existingViews = await prjstorage.getSection(prjstorage.TableType.VIEWS);
                if (existingViews && existingViews.length > 0) {
                    // Create a map of existing views by ID
                    const existingViewsMap = new Map();
                    existingViews.forEach(row => {
                        try {
                            const view = JSON.parse(row.value);
                            existingViewsMap.set(view.id, view);
                        } catch (e) {
                            logger.warn('Failed to parse existing view: ' + e);
                        }
                    });

                    // Create a map of incoming views by ID
                    const incomingViewsMap = new Map();
                    prjcontent.hmi.views.forEach(view => {
                        incomingViewsMap.set(view.id, view);
                    });

                    // Merge: update existing views with incoming, keep restricted views unchanged
                    mergedViews = [];
                    existingViewsMap.forEach((existingView, viewId) => {
                        if (incomingViewsMap.has(viewId)) {
                            // View was sent by client, use the updated version
                            mergedViews.push(incomingViewsMap.get(viewId));
                        } else {
                            // View was not sent (restricted), keep the existing version
                            mergedViews.push(existingView);
                        }
                    });

                    // Add any new views that were not in existing (newly created by client)
                    incomingViewsMap.forEach((view, viewId) => {
                        if (!existingViewsMap.has(viewId)) {
                            mergedViews.push(view);
                        }
                    });

                    logger.info('project.setProject: Merged ' + mergedViews.length + ' views (' + incomingViewsMap.size + ' from client, ' + (existingViewsMap.size - incomingViewsMap.size) + ' restricted)');
                }
            }

            prjstorage.clearAll().then(result => {
                var scs = [];
                Object.keys(prjcontent).forEach((key) => {
                    if (key === 'devices') {
                        // devices
                        var devices = prjcontent[key];
                        if (devices) {
                            Object.values(prjcontent[key]).forEach((device) => {
                                scs.push({ table: prjstorage.TableType.DEVICES, name: device.id, value: device });
                            });
                        }
                    } else if (key === 'hmi') {
                        // hmi
                        var hmi = prjcontent[key];
                        if (hmi) {
                            Object.keys(hmi).forEach((hk) => {
                                if (hk === 'views') {
                                    // views - use merged views if available
                                    var viewsToSave = mergedViews || hmi[hk];
                                    if (viewsToSave && viewsToSave.length > 0) {
                                        for (var i = 0; i < viewsToSave.length; i++) {
                                            var view = viewsToSave[i];
                                            scs.push({ table: prjstorage.TableType.VIEWS, name: view.id, value: view });
                                        }
                                    }
                                } else if (hk === 'templates') {
                                    // templates
                                    if (hmi[hk] && hmi[hk].length > 0) {
                                        for (var i = 0; i < hmi[hk].length; i++) {
                                            var template = hmi[hk][i];
                                            scs.push({ table: prjstorage.TableType.TEMPLATES, name: template.id, value: template });
                                        }
                                    }
                                } else {
                                    // layout
                                    scs.push({ table: prjstorage.TableType.GENERAL, name: hk, value: hmi[hk] });
                                }
                            });
                        }
                    } else if (key === 'server') {
                        // server
                        scs.push({ table: prjstorage.TableType.DEVICES, name: key, value: prjcontent[key] });
                    } else if (key === 'texts') {
                        // texts
                        var texts = prjcontent[key];
                        if (texts && texts.length) {
                            for (var i = 0; i < texts.length; i++) {
                                scs.push({ table: prjstorage.TableType.TEXTS, name: texts[i].name, value: texts[i] });
                            }
                        }
                    } else if (key === 'alarms') {
                        // alarms
                        var alarms = prjcontent[key];
                        if (alarms && alarms.length) {
                            for (var i = 0; i < alarms.length; i++) {
                                scs.push({ table: prjstorage.TableType.ALARMS, name: alarms[i].name, value: alarms[i] });
                            }
                        }
                    } else if (key === 'notifications') {
                        // notifications
                        var notifications = prjcontent[key];
                        if (notifications && notifications.length) {
                            for (var i = 0; i < notifications.length; i++) {
                                scs.push({ table: prjstorage.TableType.NOTIFICATIONS, name: notifications[i].id, value: notifications[i] });
                            }
                        }
                    } else if (key === 'scripts') {
                        // scripts
                        var scripts = prjcontent[key];
                        if (scripts && scripts.length) {
                            for (var i = 0; i < scripts.length; i++) {
                                scs.push({ table: prjstorage.TableType.SCRIPTS, name: scripts[i].id, value: scripts[i] });
                            }
                        }
                    } else if (key === 'reports') {
                        // reports
                        var reports = prjcontent[key];
                        if (reports && reports.length) {
                            for (var i = 0; i < reports.length; i++) {
                                scs.push({ table: prjstorage.TableType.REPORTS, name: reports[i].id, value: reports[i] });
                            }
                        }
                    } else if (key === 'mapsLocations') {
                        var locations = prjcontent[key];
                        if (locations && locations.length) {
                            for (var i = 0; i < locations.length; i++) {
                                scs.push({ table: prjstorage.TableType.LOCATIONS, name: locations[i].id, value: locations[i] });
                            }
                        }
                    } else {
                        // charts, graphs, version
                        scs.push({ table: prjstorage.TableType.GENERAL, name: key, value: prjcontent[key] });
                    }
                });
                prjstorage.setSections(scs).then(() => {
                    logger.info('project.prjstorage.set-project successfull!', true);
                    resolve(true);
                }).catch(function (err) {
                    reject(err);
                });
            }).catch(function (err) {
                logger.error('project.prjstorage.clear failed! ' + err);
                reject(err);
            });
        } catch (err) {
            logger.error('project.setProject failed: ' + err);
            reject(err);
        }
    });
}

/**
 * Return Devices list
 */
function getDevices() {
    return data.devices;
}

/**
 * Return Device from name
 */
function getDevice(name) {
    return Object.values(data.devices).find(device => device.name === name);
}

/**
 * Get the device property
 */
function getDeviceProperty(query) {
    return new Promise(function (resolve, reject) {
        if (query.query === 'security') {
            prjstorage.getSection(prjstorage.TableType.DEVICESSECURITY, query.name).then(drows => {
                if (drows.length > 0) {
                    resolve(drows[0]);
                } else {
                    resolve();
                }
            }).catch(function (err) {
                logger.error(`project.prjstorage.getdevice-property failed! '${prjstorage.TableType.DEVICESSECURITY} ${err}'`);
                reject(err);
            });
        } else {
            reject();
        }
    });
}

/**
 * Get the texts
 */
function getTexts() {
    return new Promise(function (resolve, reject) {
        prjstorage.getSection(prjstorage.TableType.TEXTS).then(drows => {
            if (drows.length > 0) {
                var texts = [];
                for (var id = 0; id < drows.length; id++) {
                    texts.push(JSON.parse(drows[id].value));
                }
                resolve(texts);
            } else {
                resolve();
            }
        }).catch(function (err) {
            logger.error(`project.prjstorage.get-texts failed! '${prjstorage.TableType.TEXTS} ${err}'`);
            reject(err);
        });
    });
}

/**
 * Get the alarms
 */
function getAlarms() {
    return new Promise(function (resolve, reject) {
        prjstorage.getSection(prjstorage.TableType.ALARMS).then(drows => {
            if (drows.length > 0) {
                var alarms = [];
                for (var id = 0; id < drows.length; id++) {
                    alarms.push(JSON.parse(drows[id].value));
                }
                resolve(alarms);
            } else {
                resolve();
            }
        }).catch(function (err) {
            logger.error(`project.prjstorage.get-alarms failed! '${prjstorage.TableType.ALARMS} ${err}'`);
            reject(err);
        });
    });
}

/**
 * Get the notifications
 */
 function getNotifications() {
    return new Promise(function (resolve, reject) {
        prjstorage.getSection(prjstorage.TableType.NOTIFICATIONS).then(drows => {
            if (drows.length > 0) {
                var notifications = [];
                for (var id = 0; id < drows.length; id++) {
                    notifications.push(JSON.parse(drows[id].value));
                }
                resolve(notifications);
            } else {
                resolve();
            }
        }).catch(function (err) {
            logger.error(`project.prjstorage.get-notifications failed! '${prjstorage.TableType.NOTIFICATIONS} ${err}'`);
            reject(err);
        });
    });
}

/**
 * Get the scripts
 */
 function getScripts() {
    return new Promise(function (resolve, reject) {
        prjstorage.getSection(prjstorage.TableType.SCRIPTS).then(drows => {
            if (drows.length > 0) {
                var scripts = [];
                for (var id = 0; id < drows.length; id++) {
                    scripts.push(JSON.parse(drows[id].value));
                }
                resolve(scripts);
            } else {
                resolve();
            }
        }).catch(function (err) {
            logger.error(`project.prjstorage.get-scripts failed! '${prjstorage.TableType.SCRIPTS} ${err}'`);
            reject(err);
        });
    });
}

/**
 * Get the reports
 */
 function getReports() {
    return new Promise(function (resolve, reject) {
        prjstorage.getSection(prjstorage.TableType.REPORTS).then(drows => {
            if (drows.length > 0) {
                var reports = [];
                for (var id = 0; id < drows.length; id++) {
                    reports.push(JSON.parse(drows[id].value));
                }
                resolve(reports);
            } else {
                resolve();
            }
        }).catch(function (err) {
            logger.error(`project.prjstorage.get-reports failed! '${prjstorage.TableType.REPORTS} ${err}'`);
            reject(err);
        });
    });
}

/**
 * Get the Maps Locations
 */
function getMapsLocations() {
    return new Promise(function (resolve, reject) {
        prjstorage.getSection(prjstorage.TableType.LOCATIONS).then(drows => {
            if (drows.length > 0) {
                var locations = [];
                for (var id = 0; id < drows.length; id++) {
                    locations.push(JSON.parse(drows[id].value));
                }
                resolve(locations);
            } else {
                resolve();
            }
        }).catch(function (err) {
            logger.error(`project.prjstorage.get-mapsLocations failed! '${prjstorage.TableType.LOCATIONS} ${err}'`);
            reject(err);
        });
    });
}

/**
 * Set the device property
 */
function setDeviceProperty(query) {
    return new Promise(function (resolve, reject) {
        if (query.query === 'security') {
            if (!query.value) {
                resolve();
                return;
            }
            prjstorage.setSection({ table: prjstorage.TableType.DEVICESSECURITY, name: query.name, value: query.value }).then(() => {
                resolve();
            }).catch(function (err) {
                logger.error(`project.prjstorage.setdevice-property failed! '${prjstorage.TableType.DEVICESSECURITY} ${err}'`);
                reject(err);
            });
        } else {
            reject();
        }
    });
}

/**
 * Return Project demo from file
 */
function getProjectDemo() {
    var demoProject = path.join(settings.appDir, 'project.demo.fuxap');
    return JSON.parse(fs.readFileSync(demoProject, 'utf8'));;
}

function _filterProjectPermission(userPermission) {
    var result = JSON.parse(JSON.stringify(data));// = { devices: {}, hmi: { views: [] } };
    const projectPermission = runtime.checkPermission(userPermission, false);
    if (!projectPermission.show || !projectPermission.enabled) {   // is admin or secure disabled
        // from device remove the not used (no permission)
        // delete result.devices;
        delete result.server;
        // check navigation permission
        if (result.hmi.layout && result.hmi.layout.navigation.items) {
            for (var i = result.hmi.layout.navigation.items.length - 1; i >= 0; i--) {
                const itemPermission = runtime.checkPermission(userPermission, result.hmi.layout.navigation.items[i]);
                if (!itemPermission.enabled) {
                    result.hmi.layout.navigation.items.splice(i, 1);
                }
            }
        }
        // check header permission
        if (result.hmi.layout && result.hmi.layout.header.items) {
            for (var i = result.hmi.layout.header.items.length - 1; i >= 0; i--) {
                const itemPermission = runtime.checkPermission(userPermission, result.hmi.layout.header.items[i].property, true);
                if (!itemPermission.enabled || !itemPermission.show) {
                    result.hmi.layout.header.items.splice(i, 1);
                }
            }
        }
        // check view item permission show / enabled
        for (var i = 0; i < result.hmi.views.length; i++) {
            var view = result.hmi.views[i];
            if (result.hmi.views[i].items) {
                Object.values(result.hmi.views[i].items).forEach((item) => {
                    if (item.property) {
                        const itemPermission = runtime.checkPermission(userPermission, item.property, false, true);
                        if (!itemPermission.show) {
                            var position = view.svgcontent.indexOf(item.id);
                            if (position >= 0) {
                                position += item.id.length + 1;
                                var hidetext = ' visibility="hidden" ';
                                view.svgcontent = view.svgcontent.slice(0, position) + hidetext + view.svgcontent.slice(position);
                            }
                        } else if (!itemPermission.enabled) {
                            item.property.events = [];
                            // disable the html controls (select, input, button)
                            const indexInContent = view.svgcontent.indexOf(item.id);
                            if (indexInContent >= 0) {
                                var splitted = utils.domStringSplitter(view.svgcontent, 'foreignobject', indexInContent);
                                if (splitted.tagcontent && splitted.tagcontent.length) {
                                    var disabled = utils.domStringSetAttribute(splitted.tagcontent, ['select', 'input', 'button'], 'disabled');
                                    // disabled = utils.domStringSetOverlay(disabled, ['ngx-switch']);
                                    view.svgcontent = splitted.before + disabled + splitted.after;
                                }
                            }
                        }
                    }
                });
            }
        }
    }
    return result;
}

function _mergeDefaultConfig() {
    return new Promise(async function (resolve, reject) {
        try {
            if (process.env.DEVICES && typeof process.env.DEVICES === 'string') {
                try {
                    logger.info('project.merge-config: in progress!');
                    var devices = JSON.parse(process.env.DEVICES);
                    devices.forEach(device => {
                        try {
                            // check device required
                            if (!device || !device.id || !device.name || !device.type || !device.configs) {
                                logger.error(`project.merge-config: DEVICES${JSON.stringify(device)} missing property!`);
                            } else {
                                var existDevice = data.devices[device.id];
                                var deviceToAdd = new Device(device);
                                if (existDevice) {
                                    deviceToAdd.tags = existDevice.tags;
                                }
                                setDevice(deviceToAdd, true);
                                logger.info(`project.merge-config: Device ${deviceToAdd.name} added!`);
                            }
                        } catch (err) {
                            logger.error(`project.merge-config: DEVICES${JSON.stringify(device)} failed! ${err}`);
                            reject();
                        }
                    });
                } catch (err) {
                    logger.error(`project.merge-config: DEVICES failed! ${err}`);
                }
            }
            resolve();
        } catch (err) {
            logger.error(`project.merge-config: failed! ${err}`);
            reject();
        }
    });

    function Device(device, tags) {
        this.id = device.id;
        this.name = device.name;
        this.enabled = true;
        this.type = device.type;
        this.polling = 1000 || device.configs.requestIntervalMs;
        this.tags = tags || {};
        this.property = device.configs;

        var a = Object.values(DeviceType);
        if (Object.values(DeviceType).indexOf(device.type) === -1) {
            throw new Error('DeviceType unknow');
        }
    }
}

/**
 * Verify Project data structure
 * @param {*} prj - project data to verify
 * @returns {object} - { valid: boolean, error: string }
 */
function verifyProject(prj) {
    let result = { valid: true, error: null };

    if (!prj) {
        result.valid = false;
        result.error = 'Project data is null or undefined';
        return result;
    }

    if (!prj.version) {
        result.valid = false;
        result.error = 'Project version is missing';
        return result;
    }

    if (!prj.hmi) {
        result.valid = false;
        result.error = 'Project hmi data is missing';
        return result;
    }

    if (!prj.devices) {
        result.valid = false;
        result.error = 'Project devices data is missing';
        return result;
    }

    // Additional validations
    if (prj.hmi && !prj.hmi.views) {
        prj.hmi.views = [];
    }

    return result;
}

/**
 * Verify View data structure
 * @param {*} view - view data to verify
 * @returns {object} - { valid: boolean, error: string }
 */
function verifyView(view) {
    let result = { valid: true, error: null };
    let errors = [];

    if (!view) {
        result.valid = false;
        result.error = 'View data is null or undefined';
        return result;
    }

    if (!view.svgcontent) {
        errors.push('View svgcontent is missing');
        result.valid = false;
    }

    if (!view.id) {
        errors.push('View id is missing');
        result.valid = false;
    }

    if (!view.profile) {
        errors.push('View profile is missing');
        result.valid = false;
    }

    if (!view.type) {
        errors.push('View type is missing');
        result.valid = false;
    }

    if (!view.items) {
        errors.push('View items is missing');
        result.valid = false;
    }

    if (!result.valid) {
        result.error = errors.join(', ');
    }

    return result;
}

/**
 * Import a View to Project (with name conflict resolution)
 * @param {*} viewData - view data to import
 * @param {*} newName - optional new name for the view
 * @param {*} conflictAction - how to handle name conflicts: 'create-new' (default), 'replace', 'skip'
 * @returns {*} The imported view object or null if skipped
 */
function importView(viewData, newName, conflictAction) {
    // Verify view structure
    const verification = verifyView(viewData);
    if (!verification.valid) {
        throw new Error('Invalid view format: ' + verification.error);
    }

    // Generate short GUID (similar to client-side Utils.getShortGUID)
    function getShortGUID() {
        return Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
    }

    // Deep clone the view
    var importedView = JSON.parse(JSON.stringify(viewData));

    // Handle name conflicts (same as client's logic)
    if (newName) {
        importedView.name = newName;
    }

    // Check for existing view with same name
    let existingView = data.hmi.views.find((v) => v.name === importedView.name);

    // Handle conflict based on conflictAction
    if (existingView) {
        if (conflictAction === 'replace') {
            // Replace existing view: keep the same ID, update content
            importedView.id = existingView.id;
            const existingIndex = data.hmi.views.findIndex((v) => v.id === existingView.id);
            if (existingIndex !== -1) {
                data.hmi.views[existingIndex] = importedView;
            }
            return importedView;
        } else if (conflictAction === 'skip') {
            // Skip import if name exists
            return null;
        }
        // Default: 'create-new' - add suffix to name
        let idx = 1;
        let startname = importedView.name;
        while (existingView = data.hmi.views.find((v) => v.name === importedView.name)) {
            importedView.name = startname + '_' + idx++;
        }
    }

    // Generate new ID
    importedView.id = 'v_' + getShortGUID();

    // Add the imported view to the project
    data.hmi.views.push(importedView);

    return importedView;
}

/**
 * Verify template structure
 * @param {*} template - template to verify
 * @returns {*} Object with valid (boolean) and error (string) properties
 */
function verifyTemplate(template) {
    let result = { valid: true, error: null };
    let errors = [];

    if (!template) {
        result.valid = false;
        result.error = 'Template data is null or undefined';
        return result;
    }

    if (!template.svgcontent) {
        errors.push('Template svgcontent is missing');
        result.valid = false;
    }

    if (!template.id) {
        errors.push('Template id is missing');
        result.valid = false;
    }

    if (!template.profile) {
        errors.push('Template profile is missing');
        result.valid = false;
    }

    if (!template.type) {
        errors.push('Template type is missing');
        result.valid = false;
    }

    if (!template.items) {
        errors.push('Template items is missing');
        result.valid = false;
    }

    if (!result.valid) {
        result.error = errors.join(', ');
    }

    return result;
}

/**
 * Import a Template to Project (with name conflict resolution)
 * @param {*} templateData - template data to import
 * @param {*} newName - optional new name for the template
 * @returns {*} The imported template object
 */
function importTemplate(templateData, newName) {
    // Verify template structure
    const verification = verifyTemplate(templateData);
    if (!verification.valid) {
        throw new Error('Invalid template format: ' + verification.error);
    }

    // Generate short GUID (similar to client-side Utils.getShortGUID)
    function getShortGUID() {
        return Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
    }

    // Deep clone the template
    var importedTemplate = JSON.parse(JSON.stringify(templateData));

    // Generate new ID
    importedTemplate.id = 't_' + getShortGUID();

    // Handle name conflicts (same as client's logic)
    if (newName) {
        importedTemplate.name = newName;
    }

    let idx = 1;
    let startname = importedTemplate.name;
    let existingTemplate = null;

    // Check for name conflicts and add suffix if needed
    while (existingTemplate = data.hmi.templates.find((t) => t.name === importedTemplate.name)) {
        importedTemplate.name = startname + '_' + idx++;
    }

    // Add the imported template to the project
    data.hmi.templates.push(importedTemplate);

    return importedTemplate;
}

/**
 * Get play restrictions
 * @param {*} viewId - Optional view ID to filter restrictions
 */
function getPlayRestrictions(viewId) {
    return prjstorage.getPlayRestrictions(viewId);
}

/**
 * Set play restriction
 * @param {*} restriction - Restriction object
 */
function setPlayRestriction(restriction) {
    return prjstorage.setPlayRestriction(restriction);
}

/**
 * Delete play restriction
 * @param {*} id - Restriction ID
 */
function deletePlayRestriction(id) {
    return prjstorage.deletePlayRestriction(id);
}

/**
 * Get default view restrictions
 * @param {*} filters - Optional filters {type, user_id, role_id, enabled}
 */
function getDefaultViewRestrictions(filters) {
    return prjstorage.getDefaultViewRestrictions(filters);
}

/**
 * Get default view for a specific user/role
 * Priority: user > role > default
 * @param {*} userId - User ID
 * @param {*} roleId - Role ID
 */
function getDefaultViewForUser(userId, roleId) {
    return prjstorage.getDefaultViewForUser(userId, roleId);
}

/**
 * Set default view restriction
 * @param {*} restriction - Restriction object {type, user_id, role_id, default_view_id, priority, enabled, creator}
 */
function setDefaultViewRestriction(restriction) {
    return prjstorage.setDefaultViewRestriction(restriction);
}

/**
 * Delete default view restriction
 * @param {*} id - Restriction ID
 */
function deleteDefaultViewRestriction(id) {
    return prjstorage.deleteDefaultViewRestriction(id);
}

/**
 * Get allowed views for user based on play restrictions
 * Priority: userId match first, then roleId match
 * @param {*} dmsUserId - DMS external user ID
 * @param {*} dmsRoleId - DMS external role ID
 */
function getAllowedViewsForUser(dmsUserId, dmsRoleId) {
    return new Promise(function (resolve, reject) {
        // Check if play restriction is enabled
        if (!settings.playRestrictionEnabled) {
            // If disabled, return all views
            const allViews = data.hmi.views.map(v => v.id);
            resolve({ allowed: true, views: allViews, isSuperAdmin: false });
            return;
        }

        // Super admin check (roleId = '1')
        if (dmsRoleId === '1') {
            const allViews = data.hmi.views.map(v => v.id);
            logger.info('project.getAllowedViewsForUser: Super admin detected (roleId=1), allowing all views');
            resolve({ allowed: true, views: allViews, isSuperAdmin: true });
            return;
        }

        // Get all play restrictions
        prjstorage.getPlayRestrictions().then(restrictions => {
            if (!restrictions || restrictions.length === 0) {
                // No restrictions defined - allow all views
                const allViews = data.hmi.views.map(v => v.id);
                logger.info('project.getAllowedViewsForUser: No play restrictions defined, allowing all views');
                resolve({ allowed: true, views: allViews, isSuperAdmin: false });
                return;
            }

            // Build allowed views set
            // Priority: userId match first, then roleId match
            const allowedViewIds = new Set();
            const restrictedViewIds = new Set(restrictions.map(r => r.view_id));

            restrictions.forEach(restriction => {
                // Check userId match first (higher priority)
                if (restriction.user_id && restriction.user_id === dmsUserId) {
                    allowedViewIds.add(restriction.view_id);
                    return;
                }

                // Check roleId match
                if (restriction.role_id && restriction.role_id === dmsRoleId) {
                    allowedViewIds.add(restriction.view_id);
                    return;
                }

                // Check visibility_scope for additional logic
                if (restriction.visibility_scope === 'global') {
                    allowedViewIds.add(restriction.view_id);
                }
            });

            // Views that have no restrictions are available to everyone
            data.hmi.views.forEach(view => {
                if (!restrictedViewIds.has(view.id)) {
                    allowedViewIds.add(view.id);
                }
            });

            logger.info('project.getAllowedViewsForUser: Found ' + allowedViewIds.size + ' allowed views for dmsUserId=' + dmsUserId + ', dmsRoleId=' + dmsRoleId);
            resolve({ allowed: allowedViewIds.size > 0, views: Array.from(allowedViewIds), isSuperAdmin: false });
        }).catch(reject);
    });
}

const ProjectDataCmdType = {
    SetDevice: 'set-device',
    DelDevice: 'del-device',
    SetView: 'set-view',
    AddView: 'add-view',
    DelView: 'del-view',
    SetTemplate: 'set-template',
    AddTemplate: 'add-template',
    DelTemplate: 'del-template',
    ConvertTemplateToView: 'convert-template-to-view',
    CloneView: 'clone-view',
    HmiLayout: 'layout',
    Charts: 'charts',
    Graphs: 'graphs',
    Languages: 'languages',
    ClientAccess: 'client-access',
    SetText: 'set-text',
    DelText: 'del-text',
    SetAlarm: 'set-alarm',
    DelAlarm: 'del-alarm',
    SetNotification: 'set-notification',
    DelNotification: 'del-notification',
    SetScript: 'set-script',
    DelScript: 'del-script',
    SetReport: 'set-report',
    DelReport: 'del-report',
    SetMapsLocation:'set-maps-location',
    DelMapsLocation: 'del-maps-location',
}

module.exports = {
    init: init,
    load: load,
    getDevices: getDevices,
    getDevice: getDevice,
    getAlarms: getAlarms,
    getNotifications: getNotifications,
    getScripts: getScripts,
    getReports: getReports,
    getDeviceProperty: getDeviceProperty,
    setDeviceProperty: setDeviceProperty,
    setProjectData: setProjectData,
    getProject: getProject,
    setProject: setProject,
    getProjectDemo: getProjectDemo,
    cloneView: cloneView,
    verifyProject: verifyProject,
    verifyView: verifyView,
    importView: importView,
    verifyTemplate: verifyTemplate,
    importTemplate: importTemplate,
    setTemplate: setTemplate,
    removeTemplate: removeTemplate,
    getTemplates: getTemplates,
    convertTemplateToView: convertTemplateToView,
    getPlayRestrictions: getPlayRestrictions,
    setPlayRestriction: setPlayRestriction,
    deletePlayRestriction: deletePlayRestriction,
    getAllowedViewsForUser: getAllowedViewsForUser,
    getDefaultViewRestrictions: getDefaultViewRestrictions,
    getDefaultViewForUser: getDefaultViewForUser,
    setDefaultViewRestriction: setDefaultViewRestriction,
    deleteDefaultViewRestriction: deleteDefaultViewRestriction,
    ProjectDataCmdType, ProjectDataCmdType,
};
