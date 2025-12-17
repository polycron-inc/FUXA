/**
 * 'api/commandLibrary': Command Library API for managing global commands
 */

var express = require("express");
const { v4: uuidv4 } = require('uuid');

var runtime;
var secureFnc;
var checkGroupsFnc;

// In-memory storage (should be replaced with database in production)
let commandLibrary = [];

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
         *     parameters:
         *       - in: query
         *         name: page
         *         schema:
         *           type: integer
         *       - in: query
         *         name: pageSize
         *         schema:
         *           type: integer
         *       - in: query
         *         name: keyword
         *         schema:
         *           type: string
         *       - in: query
         *         name: commandType
         *         schema:
         *           type: string
         *       - in: query
         *         name: targetType
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Command library list
         */
        clApp.get("/api/command-library", function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, commandType, targetType } = req.query;

                let filteredCommands = [...commandLibrary];

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    filteredCommands = filteredCommands.filter(c =>
                        c.name.toLowerCase().includes(kw) ||
                        (c.code && c.code.toLowerCase().includes(kw)) ||
                        (c.description && c.description.toLowerCase().includes(kw))
                    );
                }
                if (commandType) {
                    filteredCommands = filteredCommands.filter(c => c.commandType === commandType);
                }
                if (targetType) {
                    filteredCommands = filteredCommands.filter(c => c.targetType === targetType);
                }

                const result = paginate(filteredCommands, page, pageSize);
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
         *     parameters:
         *       - in: path
         *         name: commandId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Command details
         *       404:
         *         description: Command not found
         */
        clApp.get("/api/command-library/:commandId", function(req, res) {
            try {
                const command = commandLibrary.find(c => c.id === req.params.commandId);
                if (!command) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

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
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: Command created
         */
        clApp.post("/api/command-library", secureFnc, function(req, res) {
            try {
                const { name, code, description, targetType, commandType, payload } = req.body;

                if (!name || !targetType || !commandType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const id = uuidv4();
                const now = new Date().toISOString();

                const newCommand = {
                    id,
                    name,
                    code: code || '',
                    description: description || '',
                    targetType,
                    commandType,
                    payload: payload || {},
                    usageCount: 0,
                    createdAt: now,
                    updatedAt: now
                };

                commandLibrary.push(newCommand);

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
         *     parameters:
         *       - in: path
         *         name: commandId
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: Command updated
         */
        clApp.put("/api/command-library/:commandId", secureFnc, function(req, res) {
            try {
                const commandIndex = commandLibrary.findIndex(c => c.id === req.params.commandId);
                if (commandIndex === -1) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                const { name, code, description, targetType, commandType, payload } = req.body;

                commandLibrary[commandIndex] = {
                    ...commandLibrary[commandIndex],
                    name: name || commandLibrary[commandIndex].name,
                    code: code !== undefined ? code : commandLibrary[commandIndex].code,
                    description: description !== undefined ? description : commandLibrary[commandIndex].description,
                    targetType: targetType || commandLibrary[commandIndex].targetType,
                    commandType: commandType || commandLibrary[commandIndex].commandType,
                    payload: payload || commandLibrary[commandIndex].payload,
                    updatedAt: new Date().toISOString()
                };

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
         *     parameters:
         *       - in: path
         *         name: commandId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Command deleted
         */
        clApp.delete("/api/command-library/:commandId", secureFnc, function(req, res) {
            try {
                const commandIndex = commandLibrary.findIndex(c => c.id === req.params.commandId);
                if (commandIndex === -1) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                commandLibrary.splice(commandIndex, 1);

                res.json(createResponse(200, "Command deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete command-library: " + (err.message || err));
            }
        });

        return clApp;
    }
};
