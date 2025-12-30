/**
 * 'api/deviceTemplates': Device Templates API for managing device templates
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

// Helper function to convert DB row to template object
function dbRowToTemplate(row) {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        modelNumber: row.code, // alias
        brand: row.brand,
        communicationType: row.communication_type,
        status: row.status,
        description: row.description,
        creator: row.creator,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
    };
}

// Helper function to convert DB row to attribute object
function dbRowToAttribute(row) {
    return {
        id: row.id,
        templateId: row.template_id,
        name: row.name,
        code: row.code,
        originalKey: row.code, // alias
        genericKey: row.code, // alias
        dataType: row.data_type,
        unit: row.unit,
        description: row.description,
        sortOrder: row.sort_order,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
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
        templateId: row.template_id,
        name: row.name,
        code: row.code,
        commandType: row.command_type,
        parameters: parameters,
        commandPayload: parameters, // alias
        description: row.description,
        sortOrder: row.sort_order,
        locked: row.locked === 1 || row.locked === true,
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
        var dtApp = express();
        dtApp.use(function(req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        // ==================== Device Templates ====================

        /**
         * @swagger
         * /api/device-templates:
         *   get:
         *     summary: Get device templates list
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates", async function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, status, brand, communicationType, hasAttributes } = req.query;

                const filters = { keyword, status, brand, communicationType };
                const rows = await prjstorage.getDeviceTemplates(filters);

                let templates = rows.map(dbRowToTemplate);

                // Get attribute and command counts for each template
                for (let template of templates) {
                    const attrs = await prjstorage.getTemplateAttributes(template.id);
                    const cmds = await prjstorage.getTemplateCommands(template.id);
                    template.attributeCount = attrs.length;
                    template.commandCount = cmds.length;
                    template.bindDeviceCount = 0; // TODO: implement device binding
                }

                // Filter by hasAttributes if needed
                if (hasAttributes === 'true') {
                    templates = templates.filter(t => t.attributeCount === 0);
                }

                const result = paginate(templates, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get device-templates: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}:
         *   get:
         *     summary: Get single device template details
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/:templateId", async function(req, res) {
            try {
                const row = await prjstorage.getDeviceTemplate(req.params.templateId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const template = dbRowToTemplate(row);
                const attrRows = await prjstorage.getTemplateAttributes(template.id);
                const cmdRows = await prjstorage.getTemplateCommands(template.id);

                template.attributes = attrRows.map(dbRowToAttribute);
                template.commands = cmdRows.map(dbRowToCommand);
                template.attributeCount = template.attributes.length;
                template.commandCount = template.commands.length;
                template.bindDeviceCount = 0;

                res.json(createResponse(200, "success", template));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get device-template: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates:
         *   post:
         *     summary: Create new device template
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates", secureFnc, async function(req, res) {
            try {
                const { name, modelNumber, brand, description, communicationType, connectionType } = req.body;

                if (!name || !modelNumber || !communicationType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setDeviceTemplate({
                    id,
                    name,
                    code: modelNumber,
                    brand: brand || '',
                    communicationType,
                    status: 'enabled',
                    description: description || '',
                    creator: req.userId || null,
                    created_at: now
                });

                res.json(createResponse(200, "Template created successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api post device-templates: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}:
         *   put:
         *     summary: Update device template
         *     tags: [Device Templates]
         */
        dtApp.put("/api/device-templates/:templateId", secureFnc, async function(req, res) {
            try {
                const existing = await prjstorage.getDeviceTemplate(req.params.templateId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, modelNumber, brand, description, communicationType, connectionType } = req.body;

                await prjstorage.setDeviceTemplate({
                    id: req.params.templateId,
                    name: name || existing.name,
                    code: modelNumber || existing.code,
                    brand: brand !== undefined ? brand : existing.brand,
                    communicationType: communicationType || existing.communication_type,
                    status: existing.status,
                    description: description !== undefined ? description : existing.description,
                    creator: existing.creator,
                    created_at: existing.created_at
                });

                res.json(createResponse(200, "Template updated successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api put device-templates: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}:
         *   delete:
         *     summary: Delete device template
         *     tags: [Device Templates]
         */
        dtApp.delete("/api/device-templates/:templateId", secureFnc, async function(req, res) {
            try {
                const existing = await prjstorage.getDeviceTemplate(req.params.templateId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                // TODO: Check if template has bound devices
                // if (bindDeviceCount > 0) {
                //     return res.status(400).json(createResponse(400, "This template has bound devices and cannot be deleted"));
                // }

                await prjstorage.deleteDeviceTemplate(req.params.templateId);

                res.json(createResponse(200, "Template deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete device-templates: " + (err.message || err));
            }
        });

        // ==================== Template Attributes ====================

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes:
         *   get:
         *     summary: Get template attributes list
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/:templateId/attributes", async function(req, res) {
            try {
                const { templateId } = req.params;
                const { page = 1, pageSize = 10, keyword, dataType, accessMode, usageCategory } = req.query;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const rows = await prjstorage.getTemplateAttributes(templateId);
                let attributes = rows.map(dbRowToAttribute);

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    attributes = attributes.filter(a =>
                        a.name.toLowerCase().includes(kw) ||
                        (a.code && a.code.toLowerCase().includes(kw))
                    );
                }
                if (dataType) {
                    attributes = attributes.filter(a => a.dataType === dataType);
                }

                const result = paginate(attributes, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get template-attributes: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes:
         *   post:
         *     summary: Create template attribute
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/attributes", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, originalKey, genericKey, accessMode, usageCategory, dataType, unit, defaultValue, minValue, maxValue, precision, enumOptions, arrayItemType } = req.body;

                if (!name || !dataType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setTemplateAttribute({
                    id,
                    template_id: templateId,
                    name,
                    code: originalKey || genericKey || '',
                    data_type: dataType,
                    unit: unit || '',
                    description: '',
                    sort_order: 0,
                    created_at: now
                });

                res.json(createResponse(200, "Attribute created successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api post template-attributes: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes/{attributeId}:
         *   put:
         *     summary: Update template attribute
         *     tags: [Device Templates]
         */
        dtApp.put("/api/device-templates/:templateId/attributes/:attributeId", secureFnc, async function(req, res) {
            try {
                const { templateId, attributeId } = req.params;

                const attrs = await prjstorage.getTemplateAttributes(templateId);
                const existing = attrs.find(a => a.id === attributeId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Attribute not found"));
                }

                const { name, originalKey, genericKey, dataType, unit } = req.body;

                await prjstorage.setTemplateAttribute({
                    id: attributeId,
                    template_id: templateId,
                    name: name || existing.name,
                    code: originalKey || genericKey || existing.code,
                    data_type: dataType || existing.data_type,
                    unit: unit !== undefined ? unit : existing.unit,
                    description: existing.description,
                    sort_order: existing.sort_order,
                    created_at: existing.created_at
                });

                res.json(createResponse(200, "Attribute updated successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api put template-attributes: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes/{attributeId}:
         *   delete:
         *     summary: Delete template attribute
         *     tags: [Device Templates]
         */
        dtApp.delete("/api/device-templates/:templateId/attributes/:attributeId", secureFnc, async function(req, res) {
            try {
                const { templateId, attributeId } = req.params;

                const attrs = await prjstorage.getTemplateAttributes(templateId);
                const existing = attrs.find(a => a.id === attributeId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Attribute not found"));
                }

                await prjstorage.deleteTemplateAttribute(attributeId);

                res.json(createResponse(200, "Attribute deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete template-attributes: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes/batch-delete:
         *   post:
         *     summary: Batch delete template attributes
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/attributes/batch-delete", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                for (const id of ids) {
                    await prjstorage.deleteTemplateAttribute(id);
                }

                res.json(createResponse(200, "Attributes deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api batch-delete template-attributes: " + (err.message || err));
            }
        });

        // ==================== Template Commands ====================

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands:
         *   get:
         *     summary: Get template commands list
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/:templateId/commands", async function(req, res) {
            try {
                const { templateId } = req.params;
                const { page = 1, pageSize = 10, keyword, commandType } = req.query;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const rows = await prjstorage.getTemplateCommands(templateId);
                let commands = rows.map(dbRowToCommand);

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    commands = commands.filter(c =>
                        c.name.toLowerCase().includes(kw) ||
                        (c.code && c.code.toLowerCase().includes(kw))
                    );
                }
                if (commandType) {
                    commands = commands.filter(c => c.commandType === commandType);
                }

                const result = paginate(commands, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get template-commands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands:
         *   post:
         *     summary: Create template command
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/commands", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, description, targetType, targetAttributeId, commandType, commandPayload, locked } = req.body;

                if (!name || !commandType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setTemplateCommand({
                    id,
                    template_id: templateId,
                    name,
                    code: '',
                    command_type: commandType,
                    parameters: commandPayload || {},
                    description: description || '',
                    sort_order: 0,
                    locked: locked || false,
                    created_at: now
                });

                res.json(createResponse(200, "Command created successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api post template-commands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/{commandId}:
         *   put:
         *     summary: Update template command
         *     tags: [Device Templates]
         */
        dtApp.put("/api/device-templates/:templateId/commands/:commandId", secureFnc, async function(req, res) {
            try {
                const { templateId, commandId } = req.params;

                const cmds = await prjstorage.getTemplateCommands(templateId);
                const existing = cmds.find(c => c.id === commandId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                // Check if command is locked
                if (existing.locked === 1 || existing.locked === true) {
                    return res.status(403).json(createResponse(403, "Command is locked and cannot be modified"));
                }

                const { name, description, commandType, commandPayload, locked } = req.body;

                let params = existing.parameters;
                if (existing.parameters) {
                    try {
                        params = JSON.parse(existing.parameters);
                    } catch (e) {}
                }

                await prjstorage.setTemplateCommand({
                    id: commandId,
                    template_id: templateId,
                    name: name || existing.name,
                    code: existing.code,
                    command_type: commandType || existing.command_type,
                    parameters: commandPayload || params,
                    description: description !== undefined ? description : existing.description,
                    sort_order: existing.sort_order,
                    locked: locked !== undefined ? locked : existing.locked,
                    created_at: existing.created_at
                });

                res.json(createResponse(200, "Command updated successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api put template-commands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/{commandId}:
         *   delete:
         *     summary: Delete template command
         *     tags: [Device Templates]
         */
        dtApp.delete("/api/device-templates/:templateId/commands/:commandId", secureFnc, async function(req, res) {
            try {
                const { templateId, commandId } = req.params;

                const cmds = await prjstorage.getTemplateCommands(templateId);
                const existing = cmds.find(c => c.id === commandId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                // Check if command is locked
                if (existing.locked === 1 || existing.locked === true) {
                    return res.status(403).json(createResponse(403, "Command is locked and cannot be deleted"));
                }

                await prjstorage.deleteTemplateCommand(commandId);

                res.json(createResponse(200, "Command deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete template-commands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/batch-delete:
         *   post:
         *     summary: Batch delete template commands
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/commands/batch-delete", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                const cmds = await prjstorage.getTemplateCommands(templateId);
                const lockedIds = [];

                for (const id of ids) {
                    const cmd = cmds.find(c => c.id === id);
                    if (cmd && (cmd.locked === 1 || cmd.locked === true)) {
                        lockedIds.push(id);
                    } else {
                        await prjstorage.deleteTemplateCommand(id);
                    }
                }

                if (lockedIds.length > 0) {
                    res.json(createResponse(200, `Commands deleted, but ${lockedIds.length} locked command(s) were skipped`));
                } else {
                    res.json(createResponse(200, "Commands deleted successfully"));
                }
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api batch-delete template-commands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/{commandId}/lock:
         *   patch:
         *     summary: Lock/Unlock template command
         *     tags: [Device Templates]
         */
        dtApp.patch("/api/device-templates/:templateId/commands/:commandId/lock", secureFnc, async function(req, res) {
            try {
                const { templateId, commandId } = req.params;
                const { locked } = req.body;

                const cmds = await prjstorage.getTemplateCommands(templateId);
                const existing = cmds.find(c => c.id === commandId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                if (locked === undefined) {
                    return res.status(400).json(createResponse(400, "locked field is required"));
                }

                let params = existing.parameters;
                if (existing.parameters) {
                    try {
                        params = JSON.parse(existing.parameters);
                    } catch (e) {}
                }

                await prjstorage.setTemplateCommand({
                    id: commandId,
                    template_id: templateId,
                    name: existing.name,
                    code: existing.code,
                    command_type: existing.command_type,
                    parameters: params,
                    description: existing.description,
                    sort_order: existing.sort_order,
                    locked: locked,
                    created_at: existing.created_at
                });

                res.json(createResponse(200, locked ? "Command locked successfully" : "Command unlocked successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api lock template-commands: " + (err.message || err));
            }
        });

        // ==================== Template Commands Import/Export ====================

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/export-all:
         *   get:
         *     summary: Export all commands from a template
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/:templateId/commands/export-all", async function(req, res) {
            try {
                const { templateId } = req.params;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const cmdRows = await prjstorage.getTemplateCommands(templateId);
                const exportData = cmdRows.map(dbRowToCommand);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${template.name}-commands-export.json`);
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-all template-commands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/{commandId}/export:
         *   get:
         *     summary: Export single template command
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/:templateId/commands/:commandId/export", async function(req, res) {
            try {
                const { templateId, commandId } = req.params;

                const cmds = await prjstorage.getTemplateCommands(templateId);
                const cmd = cmds.find(c => c.id === commandId);
                if (!cmd) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                const exportData = dbRowToCommand(cmd);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${exportData.name}-export.json`);
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export template-command: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/export-batch:
         *   post:
         *     summary: Export selected template commands
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/commands/export-batch", async function(req, res) {
            try {
                const { templateId } = req.params;
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const cmdRows = await prjstorage.getTemplateCommands(templateId);
                const exportData = cmdRows
                    .filter(c => ids.includes(c.id))
                    .map(dbRowToCommand);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${template.name}-commands-batch-export.json`);
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-batch template-commands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/import:
         *   post:
         *     summary: Import single command to template
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/commands/import", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const cmd = req.body;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!cmd || !cmd.name || !cmd.commandType) {
                    return res.status(400).json(createResponse(400, "Invalid command data"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setTemplateCommand({
                    id,
                    template_id: templateId,
                    name: cmd.name,
                    code: cmd.code || '',
                    command_type: cmd.commandType,
                    parameters: cmd.parameters || cmd.commandPayload || {},
                    description: cmd.description || '',
                    sort_order: cmd.sortOrder || 0,
                    locked: cmd.locked || false,
                    created_at: now
                });

                res.json(createResponse(200, "Command imported successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import template-command: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/commands/import-batch:
         *   post:
         *     summary: Import multiple commands to template (batch import)
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/commands/import-batch", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const commands = req.body;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!Array.isArray(commands)) {
                    return res.status(400).json(createResponse(400, "Invalid import data - expected array"));
                }

                const now = Date.now();
                const results = [];
                let successCount = 0;
                let failedCount = 0;

                // Get existing commands for sort order
                const existingCmds = await prjstorage.getTemplateCommands(templateId);
                let maxOrder = existingCmds.length > 0
                    ? Math.max(...existingCmds.map(c => c.sort_order || 0)) + 1
                    : 0;

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

                        const id = uuidv4();

                        await prjstorage.setTemplateCommand({
                            id,
                            template_id: templateId,
                            name: cmd.name,
                            code: cmd.code || '',
                            command_type: cmd.commandType,
                            parameters: cmd.parameters || cmd.commandPayload || {},
                            description: cmd.description || '',
                            sort_order: cmd.sortOrder || maxOrder++,
                            locked: cmd.locked || false,
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
                runtime.logger.error("api import-batch template-commands: " + (err.message || err));
            }
        });

        // ==================== Template Attributes Import/Export ====================

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes/export-all:
         *   get:
         *     summary: Export all attributes from a template
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/:templateId/attributes/export-all", async function(req, res) {
            try {
                const { templateId } = req.params;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const attrRows = await prjstorage.getTemplateAttributes(templateId);
                const exportData = attrRows.map(dbRowToAttribute);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${template.name}-attributes-export.json`);
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-all template-attributes: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes/import:
         *   post:
         *     summary: Import single attribute to template
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/attributes/import", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const attr = req.body;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!attr || !attr.name || !attr.dataType) {
                    return res.status(400).json(createResponse(400, "Invalid attribute data"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setTemplateAttribute({
                    id,
                    template_id: templateId,
                    name: attr.name,
                    code: attr.code || attr.originalKey || '',
                    data_type: attr.dataType,
                    unit: attr.unit || '',
                    description: attr.description || '',
                    sort_order: attr.sortOrder || 0,
                    created_at: now
                });

                res.json(createResponse(200, "Attribute imported successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import template-attribute: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/attributes/import-batch:
         *   post:
         *     summary: Import multiple attributes to template (batch import)
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/attributes/import-batch", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const attributes = req.body;

                const template = await prjstorage.getDeviceTemplate(templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!Array.isArray(attributes)) {
                    return res.status(400).json(createResponse(400, "Invalid import data - expected array"));
                }

                const now = Date.now();
                const results = [];
                let successCount = 0;
                let failedCount = 0;

                // Get existing attributes for sort order
                const existingAttrs = await prjstorage.getTemplateAttributes(templateId);
                let maxOrder = existingAttrs.length > 0
                    ? Math.max(...existingAttrs.map(a => a.sort_order || 0)) + 1
                    : 0;

                for (const attr of attributes) {
                    try {
                        if (!attr.name || !attr.dataType) {
                            results.push({
                                attributeName: attr.name || 'Unknown',
                                status: 'failed',
                                message: 'Missing required fields (name, dataType)'
                            });
                            failedCount++;
                            continue;
                        }

                        const id = uuidv4();

                        await prjstorage.setTemplateAttribute({
                            id,
                            template_id: templateId,
                            name: attr.name,
                            code: attr.code || attr.originalKey || '',
                            data_type: attr.dataType,
                            unit: attr.unit || '',
                            description: attr.description || '',
                            sort_order: attr.sortOrder || maxOrder++,
                            created_at: now
                        });

                        results.push({
                            attributeName: attr.name,
                            status: 'success',
                            message: 'Imported successfully',
                            id
                        });
                        successCount++;
                    } catch (err) {
                        results.push({
                            attributeName: attr.name || 'Unknown',
                            status: 'failed',
                            message: err.message || 'Import failed'
                        });
                        failedCount++;
                    }
                }

                res.json(createResponse(200, "Import completed", {
                    totalCount: attributes.length,
                    successCount,
                    failedCount,
                    results
                }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import-batch template-attributes: " + (err.message || err));
            }
        });

        // ==================== Template Operations ====================

        /**
         * @swagger
         * /api/device-templates/{templateId}/copy:
         *   post:
         *     summary: Copy template
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/:templateId/copy", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const original = await prjstorage.getDeviceTemplate(templateId);

                if (!original) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, modelNumber } = req.body;
                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setDeviceTemplate({
                    id,
                    name: name || `${original.name} (1)`,
                    code: modelNumber || `${original.code}1`,
                    brand: original.brand,
                    communicationType: original.communication_type,
                    status: original.status,
                    description: original.description,
                    creator: req.userId || null,
                    created_at: now
                });

                // Copy attributes
                const attrs = await prjstorage.getTemplateAttributes(templateId);
                for (const attr of attrs) {
                    await prjstorage.setTemplateAttribute({
                        id: uuidv4(),
                        template_id: id,
                        name: attr.name,
                        code: attr.code,
                        data_type: attr.data_type,
                        unit: attr.unit,
                        description: attr.description,
                        sort_order: attr.sort_order,
                        created_at: now
                    });
                }

                // Copy commands
                const cmds = await prjstorage.getTemplateCommands(templateId);
                for (const cmd of cmds) {
                    await prjstorage.setTemplateCommand({
                        id: uuidv4(),
                        template_id: id,
                        name: cmd.name,
                        code: cmd.code,
                        command_type: cmd.command_type,
                        parameters: cmd.parameters,
                        description: cmd.description,
                        sort_order: cmd.sort_order,
                        locked: cmd.locked || false,
                        created_at: now
                    });
                }

                res.json(createResponse(200, "Template copied successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api copy device-templates: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/status:
         *   patch:
         *     summary: Enable/Disable template
         *     tags: [Device Templates]
         */
        dtApp.patch("/api/device-templates/:templateId/status", secureFnc, async function(req, res) {
            try {
                const { templateId } = req.params;
                const { status } = req.body;

                const existing = await prjstorage.getDeviceTemplate(templateId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!['enabled', 'disabled'].includes(status)) {
                    return res.status(400).json(createResponse(400, "Invalid status"));
                }

                await prjstorage.setDeviceTemplate({
                    id: templateId,
                    name: existing.name,
                    code: existing.code,
                    brand: existing.brand,
                    communicationType: existing.communication_type,
                    status: status,
                    description: existing.description,
                    creator: existing.creator,
                    created_at: existing.created_at
                });

                res.json(createResponse(200, `Template ${status === 'enabled' ? 'enabled' : 'disabled'} successfully`));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api patch device-templates status: " + (err.message || err));
            }
        });

        // ==================== Template Import/Export ====================

        /**
         * @swagger
         * /api/device-templates/export-all:
         *   get:
         *     summary: Export all templates
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/export-all", async function(req, res) {
            try {
                const rows = await prjstorage.getDeviceTemplates({});
                const exportData = [];

                for (const row of rows) {
                    const template = dbRowToTemplate(row);
                    const attrRows = await prjstorage.getTemplateAttributes(template.id);
                    const cmdRows = await prjstorage.getTemplateCommands(template.id);

                    template.attributes = attrRows.map(dbRowToAttribute);
                    template.commands = cmdRows.map(dbRowToCommand);
                    exportData.push(template);
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=device-templates-export.json');
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-all device-templates: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/{templateId}/export:
         *   get:
         *     summary: Export single template
         *     tags: [Device Templates]
         */
        dtApp.get("/api/device-templates/:templateId/export", async function(req, res) {
            try {
                const row = await prjstorage.getDeviceTemplate(req.params.templateId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const template = dbRowToTemplate(row);
                const attrRows = await prjstorage.getTemplateAttributes(template.id);
                const cmdRows = await prjstorage.getTemplateCommands(template.id);

                template.attributes = attrRows.map(dbRowToAttribute);
                template.commands = cmdRows.map(dbRowToCommand);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${template.name}-export.json`);
                res.json(template);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export device-template: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/import-package:
         *   post:
         *     summary: Import template package
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/import-package", secureFnc, async function(req, res) {
            try {
                const templates = req.body;

                if (!Array.isArray(templates)) {
                    return res.status(400).json(createResponse(400, "Invalid import data - expected array"));
                }

                const now = Date.now();
                const results = [];
                let successCount = 0;
                let failedCount = 0;

                for (const template of templates) {
                    try {
                        // Check for existing template with same name
                        const existingRows = await prjstorage.getDeviceTemplates({ keyword: template.name });
                        const existing = existingRows.find(t => t.name === template.name);

                        if (existing) {
                            results.push({
                                templateName: template.name,
                                status: 'failed',
                                message: 'Template with same name already exists'
                            });
                            failedCount++;
                            continue;
                        }

                        const id = uuidv4();

                        await prjstorage.setDeviceTemplate({
                            id,
                            name: template.name,
                            code: template.modelNumber || template.code || '',
                            brand: template.brand || '',
                            communicationType: template.communicationType || '',
                            status: template.status || 'enabled',
                            description: template.description || '',
                            creator: req.userId || null,
                            created_at: now
                        });

                        // Import attributes
                        for (const attr of (template.attributes || [])) {
                            await prjstorage.setTemplateAttribute({
                                id: uuidv4(),
                                template_id: id,
                                name: attr.name,
                                code: attr.code || attr.originalKey || '',
                                data_type: attr.dataType || attr.data_type || '',
                                unit: attr.unit || '',
                                description: attr.description || '',
                                sort_order: attr.sortOrder || 0,
                                created_at: now
                            });
                        }

                        // Import commands
                        for (const cmd of (template.commands || [])) {
                            await prjstorage.setTemplateCommand({
                                id: uuidv4(),
                                template_id: id,
                                name: cmd.name,
                                code: cmd.code || '',
                                command_type: cmd.commandType || cmd.command_type || '',
                                parameters: cmd.parameters || cmd.commandPayload || {},
                                description: cmd.description || '',
                                sort_order: cmd.sortOrder || 0,
                                locked: cmd.locked || false,
                                created_at: now
                            });
                        }

                        results.push({
                            templateName: template.name,
                            status: 'success',
                            message: 'Imported successfully'
                        });
                        successCount++;
                    } catch (err) {
                        results.push({
                            templateName: template.name || 'Unknown',
                            status: 'failed',
                            message: err.message || 'Import failed'
                        });
                        failedCount++;
                    }
                }

                res.json(createResponse(200, "Import completed", {
                    totalCount: templates.length,
                    successCount,
                    failedCount,
                    results
                }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import-package device-templates: " + (err.message || err));
            }
        });

        return dtApp;
    }
};
