/**
 * 'api/commandLibrary': Command Library API for managing global commands
 * Uses SQLite database for persistent storage
 */

var express = require("express");
const { v4: uuidv4 } = require('uuid');
const prjstorage = require('../../runtime/project/prjstorage');

var runtime;
var secureFnc;
var checkGroupsFnc;

// Helper function to generate response
function createResponse(code, message, data = null) {
    const response = { code, message };
    if (data !== null) {
        response.data = data;
    }
    return response;
}

// Helper function for pagination
function paginate(list, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
        list: list.slice(start, end),
        total: list.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
    };
}

// Helper function to convert DB row to command object
function dbRowToCommand(row) {
    let parameters = null;
    if (row.parameters) {
        try {
            parameters = JSON.parse(row.parameters);
        } catch (e) {
            parameters = row.parameters;
        }
    }
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        category: row.category,
        commandType: row.command_type,
        targetType: row.category, // alias for compatibility
        parameters: parameters,
        payload: parameters, // alias for compatibility
        description: row.description,
        status: row.status,
        creator: row.creator,
        usageCount: 0, // TODO: implement usage tracking
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
    };
}

module.exports = {
    init: function (_runtime, _secureFnc, _checkGroupsFnc) {
        runtime = _runtime;
        secureFnc = _secureFnc;
        checkGroupsFnc = _checkGroupsFnc;
    },
    app: function () {
        var clApp = express();
        clApp.use(function(req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        // ==================== Command Library ====================

        /**
         * @swagger
         * /api/command-library:
         *   get:
         *     summary: Get command library list
         *     tags: [Command Library]
         */
        clApp.get("/api/command-library", async function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, commandType, targetType, category } = req.query;

                const filters = { keyword, category: targetType || category };
                const rows = await prjstorage.getCommandLibrary(filters);

                let commands = rows.map(dbRowToCommand);

                // Apply additional filters
                if (commandType) {
                    commands = commands.filter(c => c.commandType === commandType);
                }

                const result = paginate(commands, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get command-library: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library/{commandId}:
         *   get:
         *     summary: Get command details
         *     tags: [Command Library]
         */
        clApp.get("/api/command-library/:commandId", async function(req, res) {
            try {
                const row = await prjstorage.getCommandLibraryItem(req.params.commandId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                const command = dbRowToCommand(row);
                res.json(createResponse(200, "success", command));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get command-library item: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library:
         *   post:
         *     summary: Create command
         *     tags: [Command Library]
         */
        clApp.post("/api/command-library", secureFnc, async function(req, res) {
            try {
                const { name, code, description, targetType, commandType, payload } = req.body;

                if (!name || !targetType || !commandType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setCommandLibraryItem({
                    id,
                    name,
                    code: code || '',
                    category: targetType,
                    command_type: commandType,
                    parameters: payload || {},
                    description: description || '',
                    status: 'active',
                    creator: req.userId || null,
                    created_at: now
                });

                res.json(createResponse(200, "Command created successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api post command-library: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library/{commandId}:
         *   put:
         *     summary: Update command
         *     tags: [Command Library]
         */
        clApp.put("/api/command-library/:commandId", secureFnc, async function(req, res) {
            try {
                const existing = await prjstorage.getCommandLibraryItem(req.params.commandId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                const { name, code, description, targetType, commandType, payload } = req.body;

                let params = existing.parameters;
                if (existing.parameters) {
                    try {
                        params = JSON.parse(existing.parameters);
                    } catch (e) {}
                }

                await prjstorage.setCommandLibraryItem({
                    id: req.params.commandId,
                    name: name || existing.name,
                    code: code !== undefined ? code : existing.code,
                    category: targetType || existing.category,
                    command_type: commandType || existing.command_type,
                    parameters: payload || params,
                    description: description !== undefined ? description : existing.description,
                    status: existing.status,
                    creator: existing.creator,
                    created_at: existing.created_at
                });

                res.json(createResponse(200, "Command updated successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api put command-library: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library/{commandId}:
         *   delete:
         *     summary: Delete command
         *     tags: [Command Library]
         */
        clApp.delete("/api/command-library/:commandId", secureFnc, async function(req, res) {
            try {
                const existing = await prjstorage.getCommandLibraryItem(req.params.commandId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                await prjstorage.deleteCommandLibraryItem(req.params.commandId);

                res.json(createResponse(200, "Command deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete command-library: " + (err.message || err));
            }
        });

        // ==================== Import/Export ====================

        /**
         * @swagger
         * /api/command-library/export-all:
         *   get:
         *     summary: Export all commands from library
         *     tags: [Command Library]
         */
        clApp.get("/api/command-library/export-all", async function(req, res) {
            try {
                const rows = await prjstorage.getCommandLibrary({});
                const exportData = rows.map(dbRowToCommand);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=command-library-export.json');
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-all command-library: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library/{commandId}/export:
         *   get:
         *     summary: Export single command from library
         *     tags: [Command Library]
         */
        clApp.get("/api/command-library/:commandId/export", async function(req, res) {
            try {
                const row = await prjstorage.getCommandLibraryItem(req.params.commandId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                const command = dbRowToCommand(row);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${command.name}-export.json`);
                res.json(command);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export command-library: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library/export-batch:
         *   post:
         *     summary: Export selected commands from library
         *     tags: [Command Library]
         */
        clApp.post("/api/command-library/export-batch", async function(req, res) {
            try {
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                const exportData = [];
                for (const id of ids) {
                    const row = await prjstorage.getCommandLibraryItem(id);
                    if (row) {
                        exportData.push(dbRowToCommand(row));
                    }
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=command-library-batch-export.json');
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-batch command-library: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library/import:
         *   post:
         *     summary: Import single command to library
         *     tags: [Command Library]
         */
        clApp.post("/api/command-library/import", secureFnc, async function(req, res) {
            try {
                const cmd = req.body;

                if (!cmd || !cmd.name || !cmd.commandType) {
                    return res.status(400).json(createResponse(400, "Invalid command data"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setCommandLibraryItem({
                    id,
                    name: cmd.name,
                    code: cmd.code || '',
                    category: cmd.targetType || cmd.category || '',
                    command_type: cmd.commandType,
                    parameters: cmd.parameters || cmd.payload || {},
                    description: cmd.description || '',
                    status: cmd.status || 'active',
                    creator: req.userId || null,
                    created_at: now
                });

                res.json(createResponse(200, "Command imported successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import command-library: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/command-library/import-batch:
         *   post:
         *     summary: Import multiple commands to library (batch import)
         *     tags: [Command Library]
         */
        clApp.post("/api/command-library/import-batch", secureFnc, async function(req, res) {
            try {
                const commands = req.body;

                if (!Array.isArray(commands)) {
                    return res.status(400).json(createResponse(400, "Invalid import data - expected array"));
                }

                const now = Date.now();
                const results = [];
                let successCount = 0;
                let failedCount = 0;

                for (const cmd of commands) {
                    try {
                        if (!cmd.name || !cmd.commandType) {
                            results.push({
                                commandName: cmd.name || 'Unknown',
                                status: 'failed',
                                message: 'Missing required fields (name, commandType)'
                            });
                            failedCount++;
                            continue;
                        }

                        // Check for duplicate name
                        const existingRows = await prjstorage.getCommandLibrary({ keyword: cmd.name });
                        const existing = existingRows.find(c => c.name === cmd.name);
                        if (existing) {
                            results.push({
                                commandName: cmd.name,
                                status: 'failed',
                                message: 'Command with same name already exists'
                            });
                            failedCount++;
                            continue;
                        }

                        const id = uuidv4();

                        await prjstorage.setCommandLibraryItem({
                            id,
                            name: cmd.name,
                            code: cmd.code || '',
                            category: cmd.targetType || cmd.category || '',
                            command_type: cmd.commandType,
                            parameters: cmd.parameters || cmd.payload || {},
                            description: cmd.description || '',
                            status: cmd.status || 'active',
                            creator: req.userId || null,
                            created_at: now
                        });

                        results.push({
                            commandName: cmd.name,
                            status: 'success',
                            message: 'Imported successfully',
                            id
                        });
                        successCount++;
                    } catch (err) {
                        results.push({
                            commandName: cmd.name || 'Unknown',
                            status: 'failed',
                            message: err.message || 'Import failed'
                        });
                        failedCount++;
                    }
                }

                res.json(createResponse(200, "Import completed", {
                    totalCount: commands.length,
                    successCount,
                    failedCount,
                    results
                }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import-batch command-library: " + (err.message || err));
            }
        });

        return clApp;
    }
};
