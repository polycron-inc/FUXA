/**
 *  Module to manage the project datastore in a database
 *  Table: 'general', 'views', 'devices', 'chart', 'texts', 'alarms', 'notifications', 'scripts', 'reports', 'locations'
 */

'use strict';

const fs = require('fs');
const path = require('path');
var sqlite3 = require('sqlite3').verbose();

var settings        // Application settings
var logger;         // Application logger
var db_prj;         // Database of project

/**
 * Init and bind the database resource
 * @param {*} _settings
 * @param {*} _log
 */
function init(_settings, _log) {
    settings = _settings;
    logger = _log;

    return _bind();
}

/**
 * Bind the database resource by create the table if not exist
 */
function _bind() {
    return new Promise(function (resolve, reject) {
        var dbfile = path.join(settings.workDir, 'project.fuxap.db');
        var dbfileExist = fs.existsSync(dbfile);
        db_prj = new sqlite3.Database(dbfile, function (err) {
            if (err) {
                logger.error(`prjstorage.bind failed! ${err}`);
                reject();
            }
            logger.info(`prjstorage.connected-to ${dbfile} database`, true);
        });
        // prepare query
        var sql = "CREATE TABLE if not exists general (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists views (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists templates (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists devices (name TEXT PRIMARY KEY, value TEXT, connection TEXT, cntid TEXT, cntpwd TEXT);";
        sql += "CREATE TABLE if not exists devicesSecurity (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists texts (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists alarms (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists notifications (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists scripts (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists reports (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists locations (name TEXT PRIMARY KEY, value TEXT);";
        sql += "CREATE TABLE if not exists constParameters (name TEXT PRIMARY KEY, value TEXT, visibility_scope TEXT, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists playRestrictions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, view_id TEXT, user_id TEXT, role_id TEXT, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists defaultViewRestrictions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, user_id TEXT, role_id TEXT, default_view_id TEXT NOT NULL, priority INTEGER DEFAULT 0, enabled INTEGER DEFAULT 1, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        db_prj.exec(sql, function (err) {
            if (err) {
                logger.error(`prjstorage.bind failed! ${err}`);
                reject();
            } else {
                // After table creation, check and add missing columns
                _checkUpdate().then(() => {
                    resolve(dbfileExist);
                }).catch((updateErr) => {
                    logger.error(`prjstorage.update failed! ${updateErr}`);
                    resolve(dbfileExist); // Still resolve even if update fails
                });
            }
        });
    });
}

/**
 * Check and update database schema for new columns
 */
function _checkUpdate() {
    return new Promise(function (resolve, reject) {
        // Check if views table has visibility_scope column
        db_prj.all("PRAGMA table_info(views)", function (err, columns) {
            if (err) {
                reject(err);
                return;
            }

            var hasVisibilityScope = columns.some(col => col.name === 'visibility_scope');

            if (!hasVisibilityScope) {
                // Add visibility_scope column to views table
                logger.info('prjstorage: Adding visibility_scope column to views table');
                db_prj.run("ALTER TABLE views ADD COLUMN visibility_scope TEXT DEFAULT 'global'", function (err) {
                    if (err) {
                        // Ignore error if column already exists (race condition)
                        if (err.message.indexOf('duplicate column name') === -1) {
                            logger.error(`prjstorage: Failed to add visibility_scope column: ${err}`);
                        }
                    } else {
                        logger.info('prjstorage: visibility_scope column added successfully');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
}

/**
 * Set default project value in database
 */
function setDefault() {
    return new Promise(function (resolve, reject) {
        var scs = [];
        scs.push({ table: TableType.GENERAL, name: 'version', value: '1.00' });
        scs.push({ table: TableType.DEVICES, name: 'server', value: { 'id': '0', 'name': 'FUXA Server', 'type': 'FuxaServer', 'property': {} } });
        setSections(scs).then(() => {
            resolve();
        }).catch(function (err) {
            reject(err);
        });
    });
}

/**
 * Insert the list of values in database tables, if exist replace the value of name(key)
 * The section contains the name of table, name(key) and value
 * @param {*} sections
 */
function setSections(sections) {
    return new Promise(function (resolve, reject) {
        // prepare query
        var sql = "";
        for(var i = 0; i < sections.length; i++) {
            var value = JSON.stringify(sections[i].value).replace(/\'/g,"''");
            sql += "INSERT OR REPLACE INTO " + sections[i].table + " (name, value) VALUES('" + sections[i].name + "','"+ value + "');";
        }
        db_prj.exec(sql, function (err) {
            if (err) {
                logger.error(`prjstorage.set failed! ${err}`);
                reject();
            } else {
                resolve();
            }
        });
    });
}

/**
 * Insert the values in database table, if exist replace the value of name(key)
 * The section contains the name of table, name(key) and value
 * @param {*} section
 */
function setSection(section) {
    return new Promise(function (resolve, reject) {
        var value = JSON.stringify(section.value).replace(/\'/g,"''");
        var sql;

        // For views table, support visibility_scope column
        if (section.table === TableType.VIEWS && section.visibility_scope !== undefined) {
            var visibilityScope = section.visibility_scope || 'global';
            sql = "INSERT OR REPLACE INTO " + section.table + " (name, value, visibility_scope) VALUES('" + section.name + "','"+ value + "','"+ visibilityScope + "');";
        } else {
            sql = "INSERT OR REPLACE INTO " + section.table + " (name, value) VALUES('" + section.name + "','"+ value + "');";
        }

        db_prj.exec(sql, function (err) {
            if (err) {
                logger.error(`prjstorage.set failed! ${err}`);
                reject();
            } else {
                resolve();
            }
        });
    });
}

/**
 * Return all values of table with this name
 * If name is null return all values in table
 * @param {*} table
 * @param {*} name
 */
function getSection(table, name) {
    return new Promise(function (resolve, reject) {
        // For views table, also get visibility_scope
        var sql;
        if (table === TableType.VIEWS) {
            sql = "SELECT name, value, visibility_scope FROM " + table;
        } else {
            sql = "SELECT name, value FROM " + table;
        }

        if (name) {
            sql += " WHERE name = '" + name + "'";
        }
        db_prj.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Delete the values in database table
 * The section contains the name of table, name(key)
 * @param {*} section
 */
function deleteSection(section) {
    return new Promise(function (resolve, reject) {
        var sql = "DELETE FROM " + section.table + " WHERE name = '" + section.name + "'";
        db_prj.run(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get play restrictions by view_id or all
 * @param {*} viewId - Optional view ID to filter
 */
function getPlayRestrictions(viewId) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM playRestrictions";
        var params = [];
        if (viewId) {
            sql += " WHERE view_id = ?";
            params.push(viewId);
        }
        db_prj.all(sql, params, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Add or update play restriction
 * @param {*} restriction - {type, view_id, user_id, role_id, creator}
 */
function setPlayRestriction(restriction) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        if (restriction.id) {
            // Update existing
            var sql = "UPDATE playRestrictions SET type = ?, view_id = ?, user_id = ?, role_id = ?, updated_at = ? WHERE id = ?";
            db_prj.run(sql, [restriction.type, restriction.view_id, restriction.user_id, restriction.role_id, now, restriction.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: restriction.id });
                }
            });
        } else {
            // Insert new
            var sql = "INSERT INTO playRestrictions (type, view_id, user_id, role_id, creator, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db_prj.run(sql, [restriction.type, restriction.view_id, restriction.user_id, restriction.role_id, restriction.creator, now, now], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        }
    });
}

/**
 * Delete play restriction by ID
 * @param {*} id - Restriction ID
 */
function deletePlayRestriction(id) {
    return new Promise(function (resolve, reject) {
        var sql = "DELETE FROM playRestrictions WHERE id = ?";
        db_prj.run(sql, [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get default view restrictions
 * @param {*} filters - Optional filters {type, user_id, role_id}
 */
function getDefaultViewRestrictions(filters) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM defaultViewRestrictions WHERE 1=1";
        var params = [];

        if (filters) {
            if (filters.type) {
                sql += " AND type = ?";
                params.push(filters.type);
            }
            if (filters.user_id) {
                sql += " AND user_id = ?";
                params.push(filters.user_id);
            }
            if (filters.role_id) {
                sql += " AND role_id = ?";
                params.push(filters.role_id);
            }
            if (filters.enabled !== undefined) {
                sql += " AND enabled = ?";
                params.push(filters.enabled ? 1 : 0);
            }
        }

        sql += " ORDER BY priority DESC, created_at ASC";

        db_prj.all(sql, params, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Get default view for a specific user/role
 * Priority: user > role > default (null)
 * @param {*} userId - User ID
 * @param {*} roleId - Role ID
 */
function getDefaultViewForUser(userId, roleId) {
    return new Promise(function (resolve, reject) {
        // First try to find user-specific default view
        var sql = `
            SELECT * FROM defaultViewRestrictions
            WHERE enabled = 1
            AND (
                (type = 'user' AND user_id = ?)
                OR (type = 'role' AND role_id = ?)
                OR (type = 'default')
            )
            ORDER BY
                CASE type
                    WHEN 'user' THEN 1
                    WHEN 'role' THEN 2
                    WHEN 'default' THEN 3
                END,
                priority DESC
            LIMIT 1
        `;

        db_prj.get(sql, [userId, roleId], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Add or update default view restriction
 * @param {*} restriction - {id?, type, user_id, role_id, default_view_id, priority, enabled, creator}
 */
function setDefaultViewRestriction(restriction) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        const enabled = restriction.enabled !== undefined ? (restriction.enabled ? 1 : 0) : 1;
        const priority = restriction.priority || 0;

        if (restriction.id) {
            // Update existing
            var sql = `UPDATE defaultViewRestrictions
                       SET type = ?, user_id = ?, role_id = ?, default_view_id = ?,
                           priority = ?, enabled = ?, updated_at = ?
                       WHERE id = ?`;
            db_prj.run(sql, [
                restriction.type,
                restriction.user_id || null,
                restriction.role_id || null,
                restriction.default_view_id,
                priority,
                enabled,
                now,
                restriction.id
            ], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: restriction.id });
                }
            });
        } else {
            // Insert new
            var sql = `INSERT INTO defaultViewRestrictions
                       (type, user_id, role_id, default_view_id, priority, enabled, creator, created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db_prj.run(sql, [
                restriction.type,
                restriction.user_id || null,
                restriction.role_id || null,
                restriction.default_view_id,
                priority,
                enabled,
                restriction.creator,
                now,
                now
            ], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        }
    });
}

/**
 * Delete default view restriction by ID
 * @param {*} id - Restriction ID
 */
function deleteDefaultViewRestriction(id) {
    return new Promise(function (resolve, reject) {
        var sql = "DELETE FROM defaultViewRestrictions WHERE id = ?";
        db_prj.run(sql, [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Close the database
 */
function close() {
    if (db_prj) {
        db_prj.close();
    }
}

/**
 * Clear all table in database
 */
function clearAll() {
    return new Promise(function (resolve, reject) {
        // prepare query
        var sql = "DELETE FROM general;";
        sql += "DELETE FROM views;";
        sql += "DELETE FROM templates;";
        sql += "DELETE FROM devices;";
        sql += "DELETE FROM texts;";
        sql += "DELETE FROM alarms;";
        sql += "DELETE FROM notifications;";
        sql += "DELETE FROM scripts;";
        sql += "DELETE FROM reports;";
        sql += "DELETE FROM locations;";
        sql += "DELETE FROM constParameters;";
        sql += "DELETE FROM playRestrictions;";
        sql += "DELETE FROM defaultViewRestrictions;";
        db_prj.exec(sql, function (err) {
            if (err) {
                logger.error(`prjstorage.clear failed! ${err}`);
                reject();
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Database Table
 */
const TableType = {
    GENERAL: 'general',
    DEVICES: 'devices',
    VIEWS: 'views',
    TEMPLATES: 'templates',
    DEVICESSECURITY: 'devicesSecurity',
    TEXTS: 'texts',
    ALARMS: 'alarms',
    NOTIFICATIONS: 'notifications',
    SCRIPTS: 'scripts',
    REPORTS: 'reports',
    LOCATIONS: 'locations',
    CONSTPARAMETERS: 'constParameters',
    PLAYRESTRICTIONS: 'playRestrictions',
    DEFAULTVIEWRESTRICTIONS: 'defaultViewRestrictions',
}

module.exports = {
    init: init,
    close: close,
    clearAll: clearAll,
    getSection: getSection,
    setSections: setSections,
    setSection: setSection,
    deleteSection: deleteSection,
    setDefault: setDefault,
    getPlayRestrictions: getPlayRestrictions,
    setPlayRestriction: setPlayRestriction,
    deletePlayRestriction: deletePlayRestriction,
    getDefaultViewRestrictions: getDefaultViewRestrictions,
    getDefaultViewForUser: getDefaultViewForUser,
    setDefaultViewRestriction: setDefaultViewRestriction,
    deleteDefaultViewRestriction: deleteDefaultViewRestriction,
    TableType: TableType,
};