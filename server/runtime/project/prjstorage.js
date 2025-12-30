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
        sql += "CREATE TABLE if not exists playRestrictions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, view_id TEXT, view_name TEXT, user_id TEXT, user_name TEXT, role_id TEXT, role_name TEXT, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists defaultViewRestrictions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, user_id TEXT, role_id TEXT, default_view_id TEXT NOT NULL, priority INTEGER DEFAULT 0, enabled INTEGER DEFAULT 1, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists userPreferences (id INTEGER PRIMARY KEY AUTOINCREMENT, dms_user_id TEXT NOT NULL UNIQUE, start_view_id TEXT, preferences TEXT, created_at INTEGER, updated_at INTEGER);";
        // Device Templates tables
        sql += "CREATE TABLE if not exists deviceTemplates (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, brand TEXT, communication_type TEXT, status TEXT DEFAULT 'draft', description TEXT, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists templateAttributes (id TEXT PRIMARY KEY, template_id TEXT NOT NULL, name TEXT NOT NULL, code TEXT, data_type TEXT, unit TEXT, description TEXT, sort_order INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists templateCommands (id TEXT PRIMARY KEY, template_id TEXT NOT NULL, name TEXT NOT NULL, code TEXT, command_type TEXT, parameters TEXT, description TEXT, sort_order INTEGER DEFAULT 0, locked INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER);";
        // Data Points tables
        sql += "CREATE TABLE if not exists dataPoints (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, device_id TEXT, device_name TEXT, controller_id TEXT, point_type TEXT, data_type TEXT, unit TEXT, address TEXT, status TEXT DEFAULT 'active', read_status TEXT, locked INTEGER DEFAULT 0, audit_status TEXT DEFAULT 'pending', description TEXT, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists pendingDataPoints (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, device_id TEXT, device_name TEXT, controller_id TEXT, point_type TEXT, data_type TEXT, unit TEXT, address TEXT, status TEXT DEFAULT 'pending', description TEXT, creator TEXT, created_at INTEGER, updated_at INTEGER);";
        // Data Point Groups tables
        sql += "CREATE TABLE if not exists dataPointGroups (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, description TEXT, status TEXT DEFAULT 'active', creator TEXT, created_at INTEGER, updated_at INTEGER);";
        sql += "CREATE TABLE if not exists groupPoints (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id TEXT NOT NULL, point_id TEXT NOT NULL, sort_order INTEGER DEFAULT 0, created_at INTEGER);";
        sql += "CREATE TABLE if not exists groupCommands (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, name TEXT NOT NULL, code TEXT, command_type TEXT, parameters TEXT, description TEXT, sort_order INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER);";
        // Command Library table
        sql += "CREATE TABLE if not exists commandLibrary (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, category TEXT, command_type TEXT, parameters TEXT, description TEXT, status TEXT DEFAULT 'active', creator TEXT, created_at INTEGER, updated_at INTEGER);";
        // Dropdown Options table
        sql += "CREATE TABLE if not exists dropdownOptions (id TEXT PRIMARY KEY, category TEXT NOT NULL, value TEXT NOT NULL, label TEXT NOT NULL, sort_order INTEGER DEFAULT 0, enabled INTEGER DEFAULT 1, created_at INTEGER, updated_at INTEGER);";
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
                    _checkPlayRestrictionsColumns().then(resolve).catch(reject);
                });
            } else {
                _checkPlayRestrictionsColumns().then(resolve).catch(reject);
            }
        });
    });
}

/**
 * Check and add new columns to playRestrictions table
 */
function _checkPlayRestrictionsColumns() {
    return new Promise(function (resolve, reject) {
        db_prj.all("PRAGMA table_info(playRestrictions)", function (err, columns) {
            if (err) {
                reject(err);
                return;
            }

            var hasUserName = columns.some(col => col.name === 'user_name');
            var hasViewName = columns.some(col => col.name === 'view_name');
            var hasRoleName = columns.some(col => col.name === 'role_name');

            var alterPromises = [];

            if (!hasUserName) {
                alterPromises.push(new Promise((res, rej) => {
                    logger.info('prjstorage: Adding user_name column to playRestrictions table');
                    db_prj.run("ALTER TABLE playRestrictions ADD COLUMN user_name TEXT", function (err) {
                        if (err && err.message.indexOf('duplicate column name') === -1) {
                            logger.error(`prjstorage: Failed to add user_name column: ${err}`);
                        } else {
                            logger.info('prjstorage: user_name column added successfully');
                        }
                        res();
                    });
                }));
            }

            if (!hasViewName) {
                alterPromises.push(new Promise((res, rej) => {
                    logger.info('prjstorage: Adding view_name column to playRestrictions table');
                    db_prj.run("ALTER TABLE playRestrictions ADD COLUMN view_name TEXT", function (err) {
                        if (err && err.message.indexOf('duplicate column name') === -1) {
                            logger.error(`prjstorage: Failed to add view_name column: ${err}`);
                        } else {
                            logger.info('prjstorage: view_name column added successfully');
                        }
                        res();
                    });
                }));
            }

            if (!hasRoleName) {
                alterPromises.push(new Promise((res, rej) => {
                    logger.info('prjstorage: Adding role_name column to playRestrictions table');
                    db_prj.run("ALTER TABLE playRestrictions ADD COLUMN role_name TEXT", function (err) {
                        if (err && err.message.indexOf('duplicate column name') === -1) {
                            logger.error(`prjstorage: Failed to add role_name column: ${err}`);
                        } else {
                            logger.info('prjstorage: role_name column added successfully');
                        }
                        res();
                    });
                }));
            }

            if (alterPromises.length > 0) {
                Promise.all(alterPromises).then(() => {
                    _checkLockedColumns().then(resolve).catch(reject);
                }).catch(reject);
            } else {
                _checkLockedColumns().then(resolve).catch(reject);
            }
        });
    });
}

/**
 * Check and add locked/audit_status columns to templateCommands and dataPoints tables
 */
function _checkLockedColumns() {
    return new Promise(function (resolve, reject) {
        var alterPromises = [];

        // Check templateCommands table for locked column
        alterPromises.push(new Promise((res) => {
            db_prj.all("PRAGMA table_info(templateCommands)", function (err, columns) {
                if (err || !columns) {
                    res();
                    return;
                }
                var hasLocked = columns.some(col => col.name === 'locked');
                if (!hasLocked) {
                    logger.info('prjstorage: Adding locked column to templateCommands table');
                    db_prj.run("ALTER TABLE templateCommands ADD COLUMN locked INTEGER DEFAULT 0", function (err) {
                        if (err && err.message.indexOf('duplicate column name') === -1) {
                            logger.error(`prjstorage: Failed to add locked column to templateCommands: ${err}`);
                        } else {
                            logger.info('prjstorage: locked column added to templateCommands successfully');
                        }
                        res();
                    });
                } else {
                    res();
                }
            });
        }));

        // Check dataPoints table for locked and audit_status columns
        alterPromises.push(new Promise((res) => {
            db_prj.all("PRAGMA table_info(dataPoints)", function (err, columns) {
                if (err || !columns) {
                    res();
                    return;
                }
                var hasLocked = columns.some(col => col.name === 'locked');
                var hasAuditStatus = columns.some(col => col.name === 'audit_status');

                var dataPointAlters = [];

                if (!hasLocked) {
                    dataPointAlters.push(new Promise((r) => {
                        logger.info('prjstorage: Adding locked column to dataPoints table');
                        db_prj.run("ALTER TABLE dataPoints ADD COLUMN locked INTEGER DEFAULT 0", function (err) {
                            if (err && err.message.indexOf('duplicate column name') === -1) {
                                logger.error(`prjstorage: Failed to add locked column to dataPoints: ${err}`);
                            } else {
                                logger.info('prjstorage: locked column added to dataPoints successfully');
                            }
                            r();
                        });
                    }));
                }

                if (!hasAuditStatus) {
                    dataPointAlters.push(new Promise((r) => {
                        logger.info('prjstorage: Adding audit_status column to dataPoints table');
                        db_prj.run("ALTER TABLE dataPoints ADD COLUMN audit_status TEXT DEFAULT 'pending'", function (err) {
                            if (err && err.message.indexOf('duplicate column name') === -1) {
                                logger.error(`prjstorage: Failed to add audit_status column to dataPoints: ${err}`);
                            } else {
                                logger.info('prjstorage: audit_status column added to dataPoints successfully');
                            }
                            r();
                        });
                    }));
                }

                if (dataPointAlters.length > 0) {
                    Promise.all(dataPointAlters).then(() => res());
                } else {
                    res();
                }
            });
        }));

        Promise.all(alterPromises).then(resolve).catch(reject);
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
            var sql = "UPDATE playRestrictions SET type = ?, view_id = ?, view_name = ?, user_id = ?, user_name = ?, role_id = ?, role_name = ?, updated_at = ? WHERE id = ?";
            db_prj.run(sql, [restriction.type, restriction.view_id, restriction.view_name, restriction.user_id, restriction.user_name, restriction.role_id, restriction.role_name, now, restriction.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: restriction.id });
                }
            });
        } else {
            // Insert new
            var sql = "INSERT INTO playRestrictions (type, view_id, view_name, user_id, user_name, role_id, role_name, creator, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db_prj.run(sql, [restriction.type, restriction.view_id, restriction.view_name, restriction.user_id, restriction.user_name, restriction.role_id, restriction.role_name, restriction.creator, now, now], function (err) {
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
 * Get user preference by DMS user ID
 * @param {string} dmsUserId - DMS user ID
 */
function getUserPreference(dmsUserId) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM userPreferences WHERE dms_user_id = ?";
        db_prj.get(sql, [dmsUserId], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Set user preference (create or update)
 * @param {object} preference - {dms_user_id, start_view_id, preferences}
 */
function setUserPreference(preference) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        // Use INSERT OR REPLACE to handle upsert
        var sql = `INSERT INTO userPreferences (dms_user_id, start_view_id, preferences, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?)
                   ON CONFLICT(dms_user_id) DO UPDATE SET
                   start_view_id = excluded.start_view_id,
                   preferences = excluded.preferences,
                   updated_at = excluded.updated_at`;
        var preferencesJson = preference.preferences ? JSON.stringify(preference.preferences) : null;
        db_prj.run(sql, [preference.dms_user_id, preference.start_view_id, preferencesJson, now, now], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ dms_user_id: preference.dms_user_id });
            }
        });
    });
}

/**
 * Delete user preference by DMS user ID
 * @param {string} dmsUserId - DMS user ID
 */
function deleteUserPreference(dmsUserId) {
    return new Promise(function (resolve, reject) {
        var sql = "DELETE FROM userPreferences WHERE dms_user_id = ?";
        db_prj.run(sql, [dmsUserId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// ==================== Device Templates ====================

/**
 * Get device templates with optional filters
 */
function getDeviceTemplates(filters) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM deviceTemplates WHERE 1=1";
        var params = [];

        if (filters) {
            if (filters.keyword) {
                sql += " AND (name LIKE ? OR code LIKE ?)";
                params.push('%' + filters.keyword + '%', '%' + filters.keyword + '%');
            }
            if (filters.status && filters.status !== 'all') {
                sql += " AND status = ?";
                params.push(filters.status);
            }
            if (filters.brand) {
                sql += " AND brand = ?";
                params.push(filters.brand);
            }
            if (filters.communicationType) {
                sql += " AND communication_type = ?";
                params.push(filters.communicationType);
            }
        }

        sql += " ORDER BY created_at DESC";

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
 * Get device template by ID
 */
function getDeviceTemplate(id) {
    return new Promise(function (resolve, reject) {
        db_prj.get("SELECT * FROM deviceTemplates WHERE id = ?", [id], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Set device template (create or update)
 */
function setDeviceTemplate(template) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO deviceTemplates (id, name, code, brand, communication_type, status, description, creator, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   brand = excluded.brand,
                   communication_type = excluded.communication_type,
                   status = excluded.status,
                   description = excluded.description,
                   updated_at = excluded.updated_at`;
        db_prj.run(sql, [
            template.id,
            template.name,
            template.code || null,
            template.brand || null,
            template.communicationType || template.communication_type || null,
            template.status || 'draft',
            template.description || null,
            template.creator || null,
            template.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: template.id });
            }
        });
    });
}

/**
 * Delete device template by ID
 */
function deleteDeviceTemplate(id) {
    return new Promise(function (resolve, reject) {
        // Delete related attributes and commands first
        db_prj.run("DELETE FROM templateAttributes WHERE template_id = ?", [id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            db_prj.run("DELETE FROM templateCommands WHERE template_id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                db_prj.run("DELETE FROM deviceTemplates WHERE id = ?", [id], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

/**
 * Get template attributes
 */
function getTemplateAttributes(templateId) {
    return new Promise(function (resolve, reject) {
        db_prj.all("SELECT * FROM templateAttributes WHERE template_id = ? ORDER BY sort_order", [templateId], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Set template attribute
 */
function setTemplateAttribute(attr) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO templateAttributes (id, template_id, name, code, data_type, unit, description, sort_order, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   data_type = excluded.data_type,
                   unit = excluded.unit,
                   description = excluded.description,
                   sort_order = excluded.sort_order,
                   updated_at = excluded.updated_at`;
        db_prj.run(sql, [
            attr.id,
            attr.template_id || attr.templateId,
            attr.name,
            attr.code || null,
            attr.dataType || attr.data_type || null,
            attr.unit || null,
            attr.description || null,
            attr.sortOrder || attr.sort_order || 0,
            attr.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: attr.id });
            }
        });
    });
}

/**
 * Delete template attribute
 */
function deleteTemplateAttribute(id) {
    return new Promise(function (resolve, reject) {
        db_prj.run("DELETE FROM templateAttributes WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get template commands
 */
function getTemplateCommands(templateId) {
    return new Promise(function (resolve, reject) {
        db_prj.all("SELECT * FROM templateCommands WHERE template_id = ? ORDER BY sort_order", [templateId], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Set template command
 */
function setTemplateCommand(cmd) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO templateCommands (id, template_id, name, code, command_type, parameters, description, sort_order, locked, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   command_type = excluded.command_type,
                   parameters = excluded.parameters,
                   description = excluded.description,
                   sort_order = excluded.sort_order,
                   locked = excluded.locked,
                   updated_at = excluded.updated_at`;
        var params = cmd.parameters ? JSON.stringify(cmd.parameters) : null;
        db_prj.run(sql, [
            cmd.id,
            cmd.template_id || cmd.templateId,
            cmd.name,
            cmd.code || null,
            cmd.commandType || cmd.command_type || null,
            params,
            cmd.description || null,
            cmd.sortOrder || cmd.sort_order || 0,
            cmd.locked !== undefined ? (cmd.locked ? 1 : 0) : 0,
            cmd.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: cmd.id });
            }
        });
    });
}

/**
 * Delete template command
 */
function deleteTemplateCommand(id) {
    return new Promise(function (resolve, reject) {
        db_prj.run("DELETE FROM templateCommands WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// ==================== Data Points ====================

/**
 * Get data points with optional filters
 */
function getDataPoints(filters) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM dataPoints WHERE 1=1";
        var params = [];

        if (filters) {
            if (filters.keyword) {
                sql += " AND (name LIKE ? OR code LIKE ?)";
                params.push('%' + filters.keyword + '%', '%' + filters.keyword + '%');
            }
            if (filters.controllerId) {
                sql += " AND controller_id = ?";
                params.push(filters.controllerId);
            }
            if (filters.pointType && filters.pointType !== 'all') {
                sql += " AND point_type = ?";
                params.push(filters.pointType);
            }
            if (filters.status && filters.status !== 'all') {
                sql += " AND status = ?";
                params.push(filters.status);
            }
            if (filters.readStatus && filters.readStatus !== 'all') {
                sql += " AND read_status = ?";
                params.push(filters.readStatus);
            }
        }

        sql += " ORDER BY created_at DESC";

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
 * Get data point by ID
 */
function getDataPoint(id) {
    return new Promise(function (resolve, reject) {
        db_prj.get("SELECT * FROM dataPoints WHERE id = ?", [id], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Set data point (create or update)
 */
function setDataPoint(point) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO dataPoints (id, name, code, device_id, device_name, controller_id, point_type, data_type, unit, address, status, read_status, locked, audit_status, description, creator, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   device_id = excluded.device_id,
                   device_name = excluded.device_name,
                   controller_id = excluded.controller_id,
                   point_type = excluded.point_type,
                   data_type = excluded.data_type,
                   unit = excluded.unit,
                   address = excluded.address,
                   status = excluded.status,
                   read_status = excluded.read_status,
                   locked = excluded.locked,
                   audit_status = excluded.audit_status,
                   description = excluded.description,
                   updated_at = excluded.updated_at`;
        db_prj.run(sql, [
            point.id,
            point.name,
            point.code || null,
            point.deviceId || point.device_id || null,
            point.deviceName || point.device_name || null,
            point.controllerId || point.controller_id || null,
            point.pointType || point.point_type || null,
            point.dataType || point.data_type || null,
            point.unit || null,
            point.address || null,
            point.status || 'active',
            point.readStatus || point.read_status || null,
            point.locked !== undefined ? (point.locked ? 1 : 0) : 0,
            point.auditStatus || point.audit_status || 'pending',
            point.description || null,
            point.creator || null,
            point.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: point.id });
            }
        });
    });
}

/**
 * Delete data point by ID
 */
function deleteDataPoint(id) {
    return new Promise(function (resolve, reject) {
        // Also remove from group points
        db_prj.run("DELETE FROM groupPoints WHERE point_id = ?", [id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            db_prj.run("DELETE FROM dataPoints WHERE id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

/**
 * Get pending data points
 */
function getPendingDataPoints(filters) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM pendingDataPoints WHERE 1=1";
        var params = [];

        if (filters) {
            if (filters.keyword) {
                sql += " AND (name LIKE ? OR code LIKE ?)";
                params.push('%' + filters.keyword + '%', '%' + filters.keyword + '%');
            }
        }

        sql += " ORDER BY created_at DESC";

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
 * Set pending data point
 */
function setPendingDataPoint(point) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO pendingDataPoints (id, name, code, device_id, device_name, controller_id, point_type, data_type, unit, address, status, description, creator, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   device_id = excluded.device_id,
                   device_name = excluded.device_name,
                   controller_id = excluded.controller_id,
                   point_type = excluded.point_type,
                   data_type = excluded.data_type,
                   unit = excluded.unit,
                   address = excluded.address,
                   status = excluded.status,
                   description = excluded.description,
                   updated_at = excluded.updated_at`;
        db_prj.run(sql, [
            point.id,
            point.name,
            point.code || null,
            point.deviceId || point.device_id || null,
            point.deviceName || point.device_name || null,
            point.controllerId || point.controller_id || null,
            point.pointType || point.point_type || null,
            point.dataType || point.data_type || null,
            point.unit || null,
            point.address || null,
            point.status || 'pending',
            point.description || null,
            point.creator || null,
            point.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: point.id });
            }
        });
    });
}

/**
 * Delete pending data point
 */
function deletePendingDataPoint(id) {
    return new Promise(function (resolve, reject) {
        db_prj.run("DELETE FROM pendingDataPoints WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// ==================== Data Point Groups ====================

/**
 * Get data point groups with optional filters
 */
function getDataPointGroups(filters) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM dataPointGroups WHERE 1=1";
        var params = [];

        if (filters) {
            if (filters.keyword) {
                sql += " AND (name LIKE ? OR code LIKE ?)";
                params.push('%' + filters.keyword + '%', '%' + filters.keyword + '%');
            }
            if (filters.status && filters.status !== 'all') {
                sql += " AND status = ?";
                params.push(filters.status);
            }
        }

        sql += " ORDER BY created_at DESC";

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
 * Get data point group by ID
 */
function getDataPointGroup(id) {
    return new Promise(function (resolve, reject) {
        db_prj.get("SELECT * FROM dataPointGroups WHERE id = ?", [id], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Set data point group
 */
function setDataPointGroup(group) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO dataPointGroups (id, name, code, description, status, creator, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   description = excluded.description,
                   status = excluded.status,
                   updated_at = excluded.updated_at`;
        db_prj.run(sql, [
            group.id,
            group.name,
            group.code || null,
            group.description || null,
            group.status || 'active',
            group.creator || null,
            group.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: group.id });
            }
        });
    });
}

/**
 * Delete data point group
 */
function deleteDataPointGroup(id) {
    return new Promise(function (resolve, reject) {
        // Delete related group points and commands first
        db_prj.run("DELETE FROM groupPoints WHERE group_id = ?", [id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            db_prj.run("DELETE FROM groupCommands WHERE group_id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                db_prj.run("DELETE FROM dataPointGroups WHERE id = ?", [id], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

/**
 * Get points in a group
 */
function getGroupPoints(groupId) {
    return new Promise(function (resolve, reject) {
        var sql = `SELECT gp.*, dp.name, dp.code, dp.device_name, dp.point_type, dp.data_type
                   FROM groupPoints gp
                   LEFT JOIN dataPoints dp ON gp.point_id = dp.id
                   WHERE gp.group_id = ?
                   ORDER BY gp.sort_order`;
        db_prj.all(sql, [groupId], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Add point to group
 */
function addGroupPoint(groupId, pointId, sortOrder) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        db_prj.run("INSERT INTO groupPoints (group_id, point_id, sort_order, created_at) VALUES (?, ?, ?, ?)",
            [groupId, pointId, sortOrder || 0, now], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
}

/**
 * Remove point from group
 */
function removeGroupPoint(groupId, pointId) {
    return new Promise(function (resolve, reject) {
        db_prj.run("DELETE FROM groupPoints WHERE group_id = ? AND point_id = ?", [groupId, pointId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get group commands
 */
function getGroupCommands(groupId) {
    return new Promise(function (resolve, reject) {
        db_prj.all("SELECT * FROM groupCommands WHERE group_id = ? ORDER BY sort_order", [groupId], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Set group command
 */
function setGroupCommand(cmd) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO groupCommands (id, group_id, name, code, command_type, parameters, description, sort_order, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   command_type = excluded.command_type,
                   parameters = excluded.parameters,
                   description = excluded.description,
                   sort_order = excluded.sort_order,
                   updated_at = excluded.updated_at`;
        var params = cmd.parameters ? JSON.stringify(cmd.parameters) : null;
        db_prj.run(sql, [
            cmd.id,
            cmd.group_id || cmd.groupId,
            cmd.name,
            cmd.code || null,
            cmd.commandType || cmd.command_type || null,
            params,
            cmd.description || null,
            cmd.sortOrder || cmd.sort_order || 0,
            cmd.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: cmd.id });
            }
        });
    });
}

/**
 * Delete group command
 */
function deleteGroupCommand(id) {
    return new Promise(function (resolve, reject) {
        db_prj.run("DELETE FROM groupCommands WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// ==================== Command Library ====================

/**
 * Get command library items with optional filters
 */
function getCommandLibrary(filters) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM commandLibrary WHERE 1=1";
        var params = [];

        if (filters) {
            if (filters.keyword) {
                sql += " AND (name LIKE ? OR code LIKE ?)";
                params.push('%' + filters.keyword + '%', '%' + filters.keyword + '%');
            }
            if (filters.category) {
                sql += " AND category = ?";
                params.push(filters.category);
            }
            if (filters.status && filters.status !== 'all') {
                sql += " AND status = ?";
                params.push(filters.status);
            }
        }

        sql += " ORDER BY created_at DESC";

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
 * Get command library item by ID
 */
function getCommandLibraryItem(id) {
    return new Promise(function (resolve, reject) {
        db_prj.get("SELECT * FROM commandLibrary WHERE id = ?", [id], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Set command library item
 */
function setCommandLibraryItem(cmd) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO commandLibrary (id, name, code, category, command_type, parameters, description, status, creator, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   name = excluded.name,
                   code = excluded.code,
                   category = excluded.category,
                   command_type = excluded.command_type,
                   parameters = excluded.parameters,
                   description = excluded.description,
                   status = excluded.status,
                   updated_at = excluded.updated_at`;
        var params = cmd.parameters ? JSON.stringify(cmd.parameters) : null;
        db_prj.run(sql, [
            cmd.id,
            cmd.name,
            cmd.code || null,
            cmd.category || null,
            cmd.commandType || cmd.command_type || null,
            params,
            cmd.description || null,
            cmd.status || 'active',
            cmd.creator || null,
            cmd.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: cmd.id });
            }
        });
    });
}

/**
 * Delete command library item
 */
function deleteCommandLibraryItem(id) {
    return new Promise(function (resolve, reject) {
        db_prj.run("DELETE FROM commandLibrary WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// ==================== Dropdown Options ====================

/**
 * Get dropdown options by category
 */
function getDropdownOptions(category) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM dropdownOptions WHERE enabled = 1";
        var params = [];

        if (category) {
            sql += " AND category = ?";
            params.push(category);
        }

        sql += " ORDER BY category, sort_order";

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
 * Set dropdown option
 */
function setDropdownOption(option) {
    return new Promise(function (resolve, reject) {
        const now = Date.now();
        var sql = `INSERT INTO dropdownOptions (id, category, value, label, sort_order, enabled, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                   category = excluded.category,
                   value = excluded.value,
                   label = excluded.label,
                   sort_order = excluded.sort_order,
                   enabled = excluded.enabled,
                   updated_at = excluded.updated_at`;
        db_prj.run(sql, [
            option.id,
            option.category,
            option.value,
            option.label,
            option.sortOrder || option.sort_order || 0,
            option.enabled !== undefined ? (option.enabled ? 1 : 0) : 1,
            option.created_at || now,
            now
        ], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: option.id });
            }
        });
    });
}

/**
 * Delete dropdown option
 */
function deleteDropdownOption(id) {
    return new Promise(function (resolve, reject) {
        db_prj.run("DELETE FROM dropdownOptions WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
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
    USERPREFERENCES: 'userPreferences',
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
    getUserPreference: getUserPreference,
    setUserPreference: setUserPreference,
    deleteUserPreference: deleteUserPreference,
    // Device Templates
    getDeviceTemplates: getDeviceTemplates,
    getDeviceTemplate: getDeviceTemplate,
    setDeviceTemplate: setDeviceTemplate,
    deleteDeviceTemplate: deleteDeviceTemplate,
    getTemplateAttributes: getTemplateAttributes,
    setTemplateAttribute: setTemplateAttribute,
    deleteTemplateAttribute: deleteTemplateAttribute,
    getTemplateCommands: getTemplateCommands,
    setTemplateCommand: setTemplateCommand,
    deleteTemplateCommand: deleteTemplateCommand,
    // Data Points
    getDataPoints: getDataPoints,
    getDataPoint: getDataPoint,
    setDataPoint: setDataPoint,
    deleteDataPoint: deleteDataPoint,
    getPendingDataPoints: getPendingDataPoints,
    setPendingDataPoint: setPendingDataPoint,
    deletePendingDataPoint: deletePendingDataPoint,
    // Data Point Groups
    getDataPointGroups: getDataPointGroups,
    getDataPointGroup: getDataPointGroup,
    setDataPointGroup: setDataPointGroup,
    deleteDataPointGroup: deleteDataPointGroup,
    getGroupPoints: getGroupPoints,
    addGroupPoint: addGroupPoint,
    removeGroupPoint: removeGroupPoint,
    getGroupCommands: getGroupCommands,
    setGroupCommand: setGroupCommand,
    deleteGroupCommand: deleteGroupCommand,
    // Command Library
    getCommandLibrary: getCommandLibrary,
    getCommandLibraryItem: getCommandLibraryItem,
    setCommandLibraryItem: setCommandLibraryItem,
    deleteCommandLibraryItem: deleteCommandLibraryItem,
    // Dropdown Options
    getDropdownOptions: getDropdownOptions,
    setDropdownOption: setDropdownOption,
    deleteDropdownOption: deleteDropdownOption,
    TableType: TableType,
};