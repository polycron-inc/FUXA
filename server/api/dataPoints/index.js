/**
 * 'api/dataPoints': Data Points API for managing data points
 */

var express = require("express");
const { v4: uuidv4 } = require('uuid');

var runtime;
var secureFnc;
var checkGroupsFnc;

// In-memory storage (should be replaced with database in production)
let dataPoints = [];
let pendingDataPoints = [];

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
        var dpApp = express();
        dpApp.use(function(req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        // ==================== Data Points ====================

        /**
         * @swagger
         * /api/data-points:
         *   get:
         *     summary: Get data points list
         *     tags: [Data Points]
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
         *         name: controllerId
         *         schema:
         *           type: string
         *       - in: query
         *         name: pointType
         *         schema:
         *           type: string
         *       - in: query
         *         name: status
         *         schema:
         *           type: string
         *       - in: query
         *         name: readStatus
         *         schema:
         *           type: string
         *       - in: query
         *         name: tab
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Data points list
         */
        dpApp.get("/api/data-points", function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, controllerId, pointType, status, readStatus, tab } = req.query;

                let filteredPoints = [...dataPoints];

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    filteredPoints = filteredPoints.filter(p =>
                        p.name.toLowerCase().includes(kw) ||
                        (p.code && p.code.toLowerCase().includes(kw))
                    );
                }
                if (controllerId) {
                    filteredPoints = filteredPoints.filter(p => p.controllerId === controllerId);
                }
                if (pointType) {
                    filteredPoints = filteredPoints.filter(p => p.pointType === pointType);
                }
                if (status && status !== 'all') {
                    filteredPoints = filteredPoints.filter(p => p.status === status);
                }
                if (readStatus) {
                    filteredPoints = filteredPoints.filter(p => p.readStatus === readStatus);
                }

                const result = paginate(filteredPoints, page, pageSize);
                result.pendingCount = pendingDataPoints.length;

                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/{pointId}:
         *   get:
         *     summary: Get data point details
         *     tags: [Data Points]
         *     parameters:
         *       - in: path
         *         name: pointId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Data point details
         *       404:
         *         description: Data point not found
         */
        dpApp.get("/api/data-points/:pointId", function(req, res) {
            try {
                const point = dataPoints.find(p => p.id === req.params.pointId);
                if (!point) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                res.json(createResponse(200, "success", point));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-point: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points:
         *   post:
         *     summary: Create virtual data point
         *     tags: [Data Points]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: Data point created
         */
        dpApp.post("/api/data-points", secureFnc, function(req, res) {
            try {
                const { name, code, pointType, deviceId, dataType, unit, description, defaultValue } = req.body;

                if (!name || !code || !dataType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                // Only allow creating virtual points
                if (pointType && pointType !== 'virtual') {
                    return res.status(400).json(createResponse(400, "Can only create virtual data points"));
                }

                const id = uuidv4();
                const now = new Date().toISOString();

                const newPoint = {
                    id,
                    name,
                    code,
                    pointType: 'virtual',
                    deviceId: deviceId || null,
                    deviceName: '',
                    controllerId: null,
                    controllerName: '',
                    dataType,
                    unit: unit || '',
                    latestValue: defaultValue !== undefined ? defaultValue : null,
                    readStatus: 'normal',
                    status: 'enabled',
                    lastUpdatedAt: now,
                    description: description || '',
                    templateId: null,
                    templateName: '',
                    templateAttributeId: null,
                    accessMode: 'RW',
                    usageCategory: '',
                    installLocation: '',
                    communicationStatus: 'online',
                    createdAt: now,
                    updatedAt: now
                };

                dataPoints.push(newPoint);

                res.json(createResponse(200, "Data point created successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api post data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/{pointId}:
         *   put:
         *     summary: Update data point
         *     tags: [Data Points]
         *     parameters:
         *       - in: path
         *         name: pointId
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
         *         description: Data point updated
         */
        dpApp.put("/api/data-points/:pointId", secureFnc, function(req, res) {
            try {
                const pointIndex = dataPoints.findIndex(p => p.id === req.params.pointId);
                if (pointIndex === -1) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                const { name, description, unit, status } = req.body;
                const point = dataPoints[pointIndex];

                // Physical points can only edit limited fields
                if (point.pointType === 'physical') {
                    dataPoints[pointIndex] = {
                        ...point,
                        name: name || point.name,
                        description: description !== undefined ? description : point.description,
                        status: status || point.status,
                        updatedAt: new Date().toISOString()
                    };
                } else {
                    // Virtual points can edit more fields
                    dataPoints[pointIndex] = {
                        ...point,
                        name: name || point.name,
                        description: description !== undefined ? description : point.description,
                        unit: unit !== undefined ? unit : point.unit,
                        status: status || point.status,
                        updatedAt: new Date().toISOString()
                    };
                }

                res.json(createResponse(200, "Data point updated successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api put data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/{pointId}/status:
         *   patch:
         *     summary: Enable/Disable data point
         *     tags: [Data Points]
         */
        dpApp.patch("/api/data-points/:pointId/status", secureFnc, function(req, res) {
            try {
                const { pointId } = req.params;
                const { status } = req.body;

                const pointIndex = dataPoints.findIndex(p => p.id === pointId);
                if (pointIndex === -1) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                if (!['enabled', 'disabled'].includes(status)) {
                    return res.status(400).json(createResponse(400, "Invalid status"));
                }

                dataPoints[pointIndex].status = status;
                dataPoints[pointIndex].updatedAt = new Date().toISOString();

                res.json(createResponse(200, `Data point ${status === 'enabled' ? 'enabled' : 'disabled'} successfully`));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api patch data-points status: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/{pointId}/test-read:
         *   post:
         *     summary: Test read data point
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/:pointId/test-read", secureFnc, function(req, res) {
            try {
                const point = dataPoints.find(p => p.id === req.params.pointId);
                if (!point) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                // Simulate reading from device
                const startTime = Date.now();

                // For demo purposes, return the latest value or generate a mock value
                const value = point.latestValue !== null ? point.latestValue : getMockValue(point.dataType);
                const responseTime = Date.now() - startTime;

                res.json(createResponse(200, "success", {
                    success: true,
                    value,
                    timestamp: new Date().toISOString(),
                    responseTime: `${responseTime}ms`,
                    message: "Read successful"
                }));
            } catch (err) {
                res.status(500).json(createResponse(500, "Read failed: " + (err.message || "Device not responding")));
                runtime.logger.error("api test-read data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/batch-action:
         *   post:
         *     summary: Batch action on data points
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/batch-action", secureFnc, function(req, res) {
            try {
                const { ids, action } = req.body;

                if (!ids || !Array.isArray(ids) || !action) {
                    return res.status(400).json(createResponse(400, "Invalid request"));
                }

                if (!['enable', 'disable', 'delete'].includes(action)) {
                    return res.status(400).json(createResponse(400, "Invalid action"));
                }

                const now = new Date().toISOString();

                if (action === 'delete') {
                    dataPoints = dataPoints.filter(p => !ids.includes(p.id));
                } else {
                    const status = action === 'enable' ? 'enabled' : 'disabled';
                    dataPoints = dataPoints.map(p => {
                        if (ids.includes(p.id)) {
                            return { ...p, status, updatedAt: now };
                        }
                        return p;
                    });
                }

                res.json(createResponse(200, `Batch ${action} completed successfully`));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api batch-action data-points: " + (err.message || err));
            }
        });

        // ==================== Pending Data Points ====================

        /**
         * @swagger
         * /api/data-points/pending:
         *   get:
         *     summary: Get pending data points list
         *     tags: [Data Points]
         */
        dpApp.get("/api/data-points/pending", function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, controllerId, pointType } = req.query;

                let filteredPoints = [...pendingDataPoints];

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    filteredPoints = filteredPoints.filter(p =>
                        p.name.toLowerCase().includes(kw) ||
                        (p.code && p.code.toLowerCase().includes(kw))
                    );
                }
                if (controllerId) {
                    filteredPoints = filteredPoints.filter(p => p.controllerId === controllerId);
                }

                const result = paginate(filteredPoints, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-points/pending: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/pending/{pendingId}/approve:
         *   post:
         *     summary: Approve pending data point and add to template
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/pending/:pendingId/approve", secureFnc, function(req, res) {
            try {
                const { pendingId } = req.params;
                const { templateId, attributeData } = req.body;

                const pendingIndex = pendingDataPoints.findIndex(p => p.id === pendingId);
                if (pendingIndex === -1) {
                    return res.status(404).json(createResponse(404, "Pending data point not found"));
                }

                if (!templateId || !attributeData) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const pendingPoint = pendingDataPoints[pendingIndex];
                const now = new Date().toISOString();

                // Create new data point from pending
                const newPoint = {
                    id: uuidv4(),
                    name: attributeData.name || pendingPoint.name,
                    code: pendingPoint.code,
                    pointType: 'physical',
                    deviceId: pendingPoint.deviceId,
                    deviceName: pendingPoint.deviceName,
                    controllerId: pendingPoint.controllerId,
                    controllerName: pendingPoint.controllerName,
                    templateId,
                    templateName: '',
                    templateAttributeId: null,
                    dataType: attributeData.dataType || pendingPoint.dataType,
                    unit: attributeData.unit || '',
                    accessMode: attributeData.accessMode || 'R',
                    usageCategory: attributeData.usageCategory || '',
                    latestValue: null,
                    readStatus: 'normal',
                    status: 'enabled',
                    lastUpdatedAt: now,
                    description: '',
                    installLocation: '',
                    communicationStatus: 'online',
                    createdAt: now,
                    updatedAt: now
                };

                dataPoints.push(newPoint);
                pendingDataPoints.splice(pendingIndex, 1);

                res.json(createResponse(200, "Data point approved successfully", { id: newPoint.id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api approve data-points/pending: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/pending/{pendingId}:
         *   delete:
         *     summary: Delete pending data point
         *     tags: [Data Points]
         */
        dpApp.delete("/api/data-points/pending/:pendingId", secureFnc, function(req, res) {
            try {
                const pendingIndex = pendingDataPoints.findIndex(p => p.id === req.params.pendingId);
                if (pendingIndex === -1) {
                    return res.status(404).json(createResponse(404, "Pending data point not found"));
                }

                pendingDataPoints.splice(pendingIndex, 1);

                res.json(createResponse(200, "Pending data point deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete data-points/pending: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/pending/batch-delete:
         *   post:
         *     summary: Batch delete pending data points
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/pending/batch-delete", secureFnc, function(req, res) {
            try {
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                pendingDataPoints = pendingDataPoints.filter(p => !ids.includes(p.id));

                res.json(createResponse(200, "Pending data points deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api batch-delete data-points/pending: " + (err.message || err));
            }
        });

        return dpApp;
    }
};

// Helper function to generate mock value based on data type
function getMockValue(dataType) {
    switch (dataType) {
        case 'string':
            return 'mock_value';
        case 'int':
        case 'long':
            return Math.floor(Math.random() * 100);
        case 'float':
        case 'double':
            return parseFloat((Math.random() * 100).toFixed(2));
        case 'boolean':
            return Math.random() > 0.5;
        case 'enum':
            return 0;
        case 'array':
            return [];
        default:
            return null;
    }
}
