/**
 * 'api/deviceTemplates': Device Templates API for managing device templates
 */

var express = require("express");
const { v4: uuidv4 } = require('uuid');

var runtime;
var secureFnc;
var checkGroupsFnc;

// In-memory storage (should be replaced with database in production)
let deviceTemplates = [];
let templateAttributes = {};
let templateCommands = {};

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
         *         name: status
         *         schema:
         *           type: string
         *       - in: query
         *         name: brand
         *         schema:
         *           type: string
         *       - in: query
         *         name: communicationType
         *         schema:
         *           type: string
         *       - in: query
         *         name: hasAttributes
         *         schema:
         *           type: boolean
         *     responses:
         *       200:
         *         description: Device templates list
         */
        dtApp.get("/api/device-templates", function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, status, brand, communicationType, hasAttributes } = req.query;

                let filteredTemplates = [...deviceTemplates];

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    filteredTemplates = filteredTemplates.filter(t =>
                        t.name.toLowerCase().includes(kw) ||
                        (t.modelNumber && t.modelNumber.toLowerCase().includes(kw))
                    );
                }
                if (status && status !== 'all') {
                    filteredTemplates = filteredTemplates.filter(t => t.status === status);
                }
                if (brand) {
                    filteredTemplates = filteredTemplates.filter(t => t.brand === brand);
                }
                if (communicationType) {
                    filteredTemplates = filteredTemplates.filter(t => t.communicationType === communicationType);
                }
                if (hasAttributes === 'true') {
                    filteredTemplates = filteredTemplates.filter(t => t.attributeCount === 0);
                }

                // Add counts
                filteredTemplates = filteredTemplates.map(t => ({
                    ...t,
                    attributeCount: (templateAttributes[t.id] || []).length,
                    commandCount: (templateCommands[t.id] || []).length
                }));

                const result = paginate(filteredTemplates, page, pageSize);
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
         *     parameters:
         *       - in: path
         *         name: templateId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Device template details
         *       404:
         *         description: Template not found
         */
        dtApp.get("/api/device-templates/:templateId", function(req, res) {
            try {
                const template = deviceTemplates.find(t => t.id === req.params.templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const result = {
                    ...template,
                    attributes: templateAttributes[template.id] || [],
                    commands: templateCommands[template.id] || []
                };

                res.json(createResponse(200, "success", result));
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
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: Template created
         */
        dtApp.post("/api/device-templates", secureFnc, function(req, res) {
            try {
                const { name, modelNumber, brand, description, communicationType, connectionType } = req.body;

                if (!name || !modelNumber || !communicationType || !connectionType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const id = uuidv4();
                const now = new Date().toISOString();

                const newTemplate = {
                    id,
                    name,
                    modelNumber,
                    brand: brand || '',
                    description: description || '',
                    communicationType,
                    connectionType,
                    status: 'enabled',
                    bindDeviceCount: 0,
                    attributeCount: 0,
                    commandCount: 0,
                    createdAt: now,
                    updatedAt: now
                };

                deviceTemplates.push(newTemplate);
                templateAttributes[id] = [];
                templateCommands[id] = [];

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
         *     parameters:
         *       - in: path
         *         name: templateId
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
         *         description: Template updated
         */
        dtApp.put("/api/device-templates/:templateId", secureFnc, function(req, res) {
            try {
                const templateIndex = deviceTemplates.findIndex(t => t.id === req.params.templateId);
                if (templateIndex === -1) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, modelNumber, brand, description, communicationType, connectionType } = req.body;

                deviceTemplates[templateIndex] = {
                    ...deviceTemplates[templateIndex],
                    name: name || deviceTemplates[templateIndex].name,
                    modelNumber: modelNumber || deviceTemplates[templateIndex].modelNumber,
                    brand: brand !== undefined ? brand : deviceTemplates[templateIndex].brand,
                    description: description !== undefined ? description : deviceTemplates[templateIndex].description,
                    communicationType: communicationType || deviceTemplates[templateIndex].communicationType,
                    connectionType: connectionType || deviceTemplates[templateIndex].connectionType,
                    updatedAt: new Date().toISOString()
                };

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
         *     parameters:
         *       - in: path
         *         name: templateId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Template deleted
         */
        dtApp.delete("/api/device-templates/:templateId", secureFnc, function(req, res) {
            try {
                const templateIndex = deviceTemplates.findIndex(t => t.id === req.params.templateId);
                if (templateIndex === -1) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const template = deviceTemplates[templateIndex];
                if (template.bindDeviceCount > 0) {
                    return res.status(400).json(createResponse(400, "This template has bound devices and cannot be deleted"));
                }

                deviceTemplates.splice(templateIndex, 1);
                delete templateAttributes[req.params.templateId];
                delete templateCommands[req.params.templateId];

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
        dtApp.get("/api/device-templates/:templateId/attributes", function(req, res) {
            try {
                const { templateId } = req.params;
                const { page = 1, pageSize = 10, keyword, dataType, accessMode, usageCategory } = req.query;

                if (!deviceTemplates.find(t => t.id === templateId)) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                let attributes = templateAttributes[templateId] || [];

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    attributes = attributes.filter(a =>
                        a.name.toLowerCase().includes(kw) ||
                        (a.originalKey && a.originalKey.toLowerCase().includes(kw)) ||
                        (a.genericKey && a.genericKey.toLowerCase().includes(kw))
                    );
                }
                if (dataType) {
                    attributes = attributes.filter(a => a.dataType === dataType);
                }
                if (accessMode) {
                    attributes = attributes.filter(a => a.accessMode === accessMode);
                }
                if (usageCategory) {
                    attributes = attributes.filter(a => a.usageCategory === usageCategory);
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
        dtApp.post("/api/device-templates/:templateId/attributes", secureFnc, function(req, res) {
            try {
                const { templateId } = req.params;

                if (!deviceTemplates.find(t => t.id === templateId)) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, originalKey, genericKey, accessMode, usageCategory, dataType, unit, defaultValue, minValue, maxValue, precision, enumOptions, arrayItemType } = req.body;

                if (!name || !originalKey || !genericKey || !accessMode || !usageCategory || !dataType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const id = uuidv4();
                const now = new Date().toISOString();

                const newAttribute = {
                    id,
                    name,
                    originalKey,
                    genericKey,
                    accessMode,
                    usageCategory,
                    dataType,
                    unit: unit || '',
                    defaultValue: defaultValue !== undefined ? defaultValue : null,
                    minValue: minValue !== undefined ? minValue : null,
                    maxValue: maxValue !== undefined ? maxValue : null,
                    precision: precision !== undefined ? precision : null,
                    enumOptions: enumOptions || [],
                    arrayItemType: arrayItemType || null,
                    createdAt: now,
                    updatedAt: now
                };

                if (!templateAttributes[templateId]) {
                    templateAttributes[templateId] = [];
                }
                templateAttributes[templateId].push(newAttribute);

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
        dtApp.put("/api/device-templates/:templateId/attributes/:attributeId", secureFnc, function(req, res) {
            try {
                const { templateId, attributeId } = req.params;

                if (!templateAttributes[templateId]) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const attrIndex = templateAttributes[templateId].findIndex(a => a.id === attributeId);
                if (attrIndex === -1) {
                    return res.status(404).json(createResponse(404, "Attribute not found"));
                }

                const { name, originalKey, genericKey, accessMode, usageCategory, dataType, unit, defaultValue, minValue, maxValue, precision, enumOptions, arrayItemType } = req.body;

                templateAttributes[templateId][attrIndex] = {
                    ...templateAttributes[templateId][attrIndex],
                    name: name || templateAttributes[templateId][attrIndex].name,
                    originalKey: originalKey || templateAttributes[templateId][attrIndex].originalKey,
                    genericKey: genericKey || templateAttributes[templateId][attrIndex].genericKey,
                    accessMode: accessMode || templateAttributes[templateId][attrIndex].accessMode,
                    usageCategory: usageCategory || templateAttributes[templateId][attrIndex].usageCategory,
                    dataType: dataType || templateAttributes[templateId][attrIndex].dataType,
                    unit: unit !== undefined ? unit : templateAttributes[templateId][attrIndex].unit,
                    defaultValue: defaultValue !== undefined ? defaultValue : templateAttributes[templateId][attrIndex].defaultValue,
                    minValue: minValue !== undefined ? minValue : templateAttributes[templateId][attrIndex].minValue,
                    maxValue: maxValue !== undefined ? maxValue : templateAttributes[templateId][attrIndex].maxValue,
                    precision: precision !== undefined ? precision : templateAttributes[templateId][attrIndex].precision,
                    enumOptions: enumOptions || templateAttributes[templateId][attrIndex].enumOptions,
                    arrayItemType: arrayItemType !== undefined ? arrayItemType : templateAttributes[templateId][attrIndex].arrayItemType,
                    updatedAt: new Date().toISOString()
                };

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
        dtApp.delete("/api/device-templates/:templateId/attributes/:attributeId", secureFnc, function(req, res) {
            try {
                const { templateId, attributeId } = req.params;

                if (!templateAttributes[templateId]) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const attrIndex = templateAttributes[templateId].findIndex(a => a.id === attributeId);
                if (attrIndex === -1) {
                    return res.status(404).json(createResponse(404, "Attribute not found"));
                }

                templateAttributes[templateId].splice(attrIndex, 1);

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
        dtApp.post("/api/device-templates/:templateId/attributes/batch-delete", secureFnc, function(req, res) {
            try {
                const { templateId } = req.params;
                const { ids } = req.body;

                if (!templateAttributes[templateId]) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                templateAttributes[templateId] = templateAttributes[templateId].filter(a => !ids.includes(a.id));

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
        dtApp.get("/api/device-templates/:templateId/commands", function(req, res) {
            try {
                const { templateId } = req.params;
                const { page = 1, pageSize = 10, keyword, targetType, commandType } = req.query;

                if (!deviceTemplates.find(t => t.id === templateId)) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                let commands = templateCommands[templateId] || [];

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    commands = commands.filter(c =>
                        c.name.toLowerCase().includes(kw) ||
                        (c.targetAttributeName && c.targetAttributeName.toLowerCase().includes(kw))
                    );
                }
                if (targetType) {
                    commands = commands.filter(c => c.targetType === targetType);
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
        dtApp.post("/api/device-templates/:templateId/commands", secureFnc, function(req, res) {
            try {
                const { templateId } = req.params;

                if (!deviceTemplates.find(t => t.id === templateId)) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, description, targetType, targetAttributeId, commandType, commandPayload } = req.body;

                if (!name || !targetType || !commandType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                // Get target attribute name if applicable
                let targetAttributeName = '';
                if (targetType === 'attribute' && targetAttributeId && templateAttributes[templateId]) {
                    const attr = templateAttributes[templateId].find(a => a.id === targetAttributeId);
                    targetAttributeName = attr ? attr.name : '';
                }

                const id = uuidv4();
                const now = new Date().toISOString();

                const newCommand = {
                    id,
                    name,
                    description: description || '',
                    targetType,
                    targetAttributeId: targetAttributeId || null,
                    targetAttributeName,
                    commandType,
                    commandPayload: commandPayload || {},
                    createdAt: now,
                    updatedAt: now
                };

                if (!templateCommands[templateId]) {
                    templateCommands[templateId] = [];
                }
                templateCommands[templateId].push(newCommand);

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
        dtApp.put("/api/device-templates/:templateId/commands/:commandId", secureFnc, function(req, res) {
            try {
                const { templateId, commandId } = req.params;

                if (!templateCommands[templateId]) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const cmdIndex = templateCommands[templateId].findIndex(c => c.id === commandId);
                if (cmdIndex === -1) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                const { name, description, targetType, targetAttributeId, commandType, commandPayload } = req.body;

                // Get target attribute name if applicable
                let targetAttributeName = templateCommands[templateId][cmdIndex].targetAttributeName;
                if (targetType === 'attribute' && targetAttributeId && templateAttributes[templateId]) {
                    const attr = templateAttributes[templateId].find(a => a.id === targetAttributeId);
                    targetAttributeName = attr ? attr.name : '';
                }

                templateCommands[templateId][cmdIndex] = {
                    ...templateCommands[templateId][cmdIndex],
                    name: name || templateCommands[templateId][cmdIndex].name,
                    description: description !== undefined ? description : templateCommands[templateId][cmdIndex].description,
                    targetType: targetType || templateCommands[templateId][cmdIndex].targetType,
                    targetAttributeId: targetAttributeId !== undefined ? targetAttributeId : templateCommands[templateId][cmdIndex].targetAttributeId,
                    targetAttributeName,
                    commandType: commandType || templateCommands[templateId][cmdIndex].commandType,
                    commandPayload: commandPayload || templateCommands[templateId][cmdIndex].commandPayload,
                    updatedAt: new Date().toISOString()
                };

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
        dtApp.delete("/api/device-templates/:templateId/commands/:commandId", secureFnc, function(req, res) {
            try {
                const { templateId, commandId } = req.params;

                if (!templateCommands[templateId]) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const cmdIndex = templateCommands[templateId].findIndex(c => c.id === commandId);
                if (cmdIndex === -1) {
                    return res.status(404).json(createResponse(404, "Command not found"));
                }

                templateCommands[templateId].splice(cmdIndex, 1);

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
        dtApp.post("/api/device-templates/:templateId/commands/batch-delete", secureFnc, function(req, res) {
            try {
                const { templateId } = req.params;
                const { ids } = req.body;

                if (!templateCommands[templateId]) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                templateCommands[templateId] = templateCommands[templateId].filter(c => !ids.includes(c.id));

                res.json(createResponse(200, "Commands deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api batch-delete template-commands: " + (err.message || err));
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
        dtApp.post("/api/device-templates/:templateId/copy", secureFnc, function(req, res) {
            try {
                const { templateId } = req.params;
                const original = deviceTemplates.find(t => t.id === templateId);

                if (!original) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const { name, modelNumber } = req.body;
                const id = uuidv4();
                const now = new Date().toISOString();

                const newTemplate = {
                    ...original,
                    id,
                    name: name || `${original.name} (1)`,
                    modelNumber: modelNumber || `${original.modelNumber}1`,
                    bindDeviceCount: 0,
                    createdAt: now,
                    updatedAt: now
                };

                deviceTemplates.push(newTemplate);

                // Copy attributes
                templateAttributes[id] = (templateAttributes[templateId] || []).map(attr => ({
                    ...attr,
                    id: uuidv4(),
                    createdAt: now,
                    updatedAt: now
                }));

                // Copy commands
                templateCommands[id] = (templateCommands[templateId] || []).map(cmd => ({
                    ...cmd,
                    id: uuidv4(),
                    createdAt: now,
                    updatedAt: now
                }));

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
        dtApp.patch("/api/device-templates/:templateId/status", secureFnc, function(req, res) {
            try {
                const { templateId } = req.params;
                const { status } = req.body;

                const templateIndex = deviceTemplates.findIndex(t => t.id === templateId);
                if (templateIndex === -1) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                if (!['enabled', 'disabled'].includes(status)) {
                    return res.status(400).json(createResponse(400, "Invalid status"));
                }

                deviceTemplates[templateIndex].status = status;
                deviceTemplates[templateIndex].updatedAt = new Date().toISOString();

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
        dtApp.get("/api/device-templates/export-all", function(req, res) {
            try {
                const exportData = deviceTemplates.map(template => ({
                    ...template,
                    attributes: templateAttributes[template.id] || [],
                    commands: templateCommands[template.id] || []
                }));

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
        dtApp.get("/api/device-templates/:templateId/export", function(req, res) {
            try {
                const template = deviceTemplates.find(t => t.id === req.params.templateId);
                if (!template) {
                    return res.status(404).json(createResponse(404, "Template not found"));
                }

                const exportData = {
                    ...template,
                    attributes: templateAttributes[template.id] || [],
                    commands: templateCommands[template.id] || []
                };

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${template.name}-export.json`);
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export device-template: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/import-single:
         *   post:
         *     summary: Import single template (check conflicts)
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/import-single", secureFnc, function(req, res) {
            try {
                const importedData = req.body;

                if (!importedData || !importedData.name || !importedData.modelNumber) {
                    return res.status(400).json(createResponse(400, "Invalid import data"));
                }

                // Check for conflicts
                const nameConflict = deviceTemplates.find(t => t.name === importedData.name);
                const modelConflict = deviceTemplates.find(t => t.modelNumber === importedData.modelNumber);

                let hasConflict = false;
                let conflictType = null;
                let existingTemplate = null;

                if (nameConflict && modelConflict) {
                    hasConflict = true;
                    conflictType = 'both';
                    existingTemplate = nameConflict;
                } else if (nameConflict) {
                    hasConflict = true;
                    conflictType = 'name';
                    existingTemplate = nameConflict;
                } else if (modelConflict) {
                    hasConflict = true;
                    conflictType = 'modelNumber';
                    existingTemplate = modelConflict;
                }

                res.json(createResponse(200, "success", {
                    hasConflict,
                    conflictType,
                    existingTemplate: existingTemplate ? {
                        id: existingTemplate.id,
                        name: existingTemplate.name,
                        modelNumber: existingTemplate.modelNumber
                    } : null,
                    importedData: {
                        name: importedData.name,
                        modelNumber: importedData.modelNumber,
                        attributeCount: (importedData.attributes || []).length,
                        commandCount: (importedData.commands || []).length
                    }
                }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import-single device-templates: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/import-single/confirm:
         *   post:
         *     summary: Confirm import single template
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/import-single/confirm", secureFnc, function(req, res) {
            try {
                const { importMode, newName, newModelNumber, description, importData } = req.body;

                if (!importData) {
                    return res.status(400).json(createResponse(400, "Missing import data"));
                }

                const now = new Date().toISOString();

                if (importMode === 'overwrite') {
                    // Find and overwrite existing template
                    const existingIndex = deviceTemplates.findIndex(t =>
                        t.name === importData.name || t.modelNumber === importData.modelNumber
                    );

                    if (existingIndex === -1) {
                        return res.status(404).json(createResponse(404, "Existing template not found"));
                    }

                    const existingId = deviceTemplates[existingIndex].id;

                    deviceTemplates[existingIndex] = {
                        ...importData,
                        id: existingId,
                        description: description || importData.description,
                        bindDeviceCount: deviceTemplates[existingIndex].bindDeviceCount,
                        updatedAt: now
                    };
                    delete deviceTemplates[existingIndex].attributes;
                    delete deviceTemplates[existingIndex].commands;

                    templateAttributes[existingId] = (importData.attributes || []).map(attr => ({
                        ...attr,
                        id: uuidv4(),
                        createdAt: now,
                        updatedAt: now
                    }));

                    templateCommands[existingId] = (importData.commands || []).map(cmd => ({
                        ...cmd,
                        id: uuidv4(),
                        createdAt: now,
                        updatedAt: now
                    }));

                    res.json(createResponse(200, "Template overwritten successfully", { id: existingId }));
                } else {
                    // Create new template
                    if (!newName || !newModelNumber) {
                        return res.status(400).json(createResponse(400, "New name and model number required for create mode"));
                    }

                    const id = uuidv4();

                    const newTemplate = {
                        ...importData,
                        id,
                        name: newName,
                        modelNumber: newModelNumber,
                        description: description || importData.description,
                        bindDeviceCount: 0,
                        createdAt: now,
                        updatedAt: now
                    };
                    delete newTemplate.attributes;
                    delete newTemplate.commands;

                    deviceTemplates.push(newTemplate);

                    templateAttributes[id] = (importData.attributes || []).map(attr => ({
                        ...attr,
                        id: uuidv4(),
                        createdAt: now,
                        updatedAt: now
                    }));

                    templateCommands[id] = (importData.commands || []).map(cmd => ({
                        ...cmd,
                        id: uuidv4(),
                        createdAt: now,
                        updatedAt: now
                    }));

                    res.json(createResponse(200, "Template created successfully", { id }));
                }
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import-single/confirm device-templates: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/device-templates/import-package:
         *   post:
         *     summary: Import template package
         *     tags: [Device Templates]
         */
        dtApp.post("/api/device-templates/import-package", secureFnc, function(req, res) {
            try {
                const templates = req.body;

                if (!Array.isArray(templates)) {
                    return res.status(400).json(createResponse(400, "Invalid import data - expected array"));
                }

                const now = new Date().toISOString();
                const results = [];
                let successCount = 0;
                let failedCount = 0;

                for (const template of templates) {
                    try {
                        // Check for existing template with same name
                        const existing = deviceTemplates.find(t => t.name === template.name);
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

                        const newTemplate = {
                            ...template,
                            id,
                            bindDeviceCount: 0,
                            createdAt: now,
                            updatedAt: now
                        };
                        delete newTemplate.attributes;
                        delete newTemplate.commands;

                        deviceTemplates.push(newTemplate);

                        templateAttributes[id] = (template.attributes || []).map(attr => ({
                            ...attr,
                            id: uuidv4(),
                            createdAt: now,
                            updatedAt: now
                        }));

                        templateCommands[id] = (template.commands || []).map(cmd => ({
                            ...cmd,
                            id: uuidv4(),
                            createdAt: now,
                            updatedAt: now
                        }));

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
