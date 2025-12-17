/**
 * 'api/dataPointGroups': Data Point Groups API for managing data point groups
 */

var express = require("express");
const { v4: uuidv4 } = require('uuid');

var runtime;
var secureFnc;
var checkGroupsFnc;

// In-memory storage (should be replaced with database in production)
let dataPointGroups = [];
let groupPoints = {}; // groupId -> pointIds[]
let groupCommands = {}; // groupId -> commands[]

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
        var dpgApp = express();
        dpgApp.use(function(req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        // ==================== Data Point Groups ====================

        /**
         * @swagger
         * /api/data-point-groups:
         *   get:
         *     summary: Get data point groups list
         *     tags: [Data Point Groups]
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
         *     responses:
         *       200:
         *         description: Data point groups list
         */
        dpgApp.get("/api/data-point-groups", function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, status } = req.query;

                let filteredGroups = [...dataPointGroups];

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    filteredGroups = filteredGroups.filter(g =>
                        g.name.toLowerCase().includes(kw)
                    );
                }
                if (status && status !== 'all') {
                    filteredGroups = filteredGroups.filter(g => g.status === status);
                }

                // Add counts
                filteredGroups = filteredGroups.map(g => ({
                    ...g,
                    pointCount: (groupPoints[g.id] || []).length,
                    commandCount: (groupCommands[g.id] || []).length
                }));

                const result = paginate(filteredGroups, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-point-groups: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}:
         *   get:
         *     summary: Get data point group details
         *     tags: [Data Point Groups]
         *     parameters:
         *       - in: path
         *         name: groupId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Data point group details
         *       404:
         *         description: Group not found
         */
        dpgApp.get("/api/data-point-groups/:groupId", function(req, res) {
            try {
                const group = dataPointGroups.find(g => g.id === req.params.groupId);
                if (!group) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                // Get points info (mock data for now)
                const pointIds = groupPoints[group.id] || [];
                const points = pointIds.map(id => ({
                    id,
                    name: `Point ${id.substring(0, 8)}`,
                    code: `CODE_${id.substring(0, 8)}`,
                    deviceName: 'Device 1',
                    dataType: 'float'
                }));

                // Get commands
                const commands = groupCommands[group.id] || [];

                const result = {
                    ...group,
                    points,
                    commands,
                    pointCount: pointIds.length,
                    commandCount: commands.length
                };

                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-point-group: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups:
         *   post:
         *     summary: Create data point group
         *     tags: [Data Point Groups]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: Group created
         */
        dpgApp.post("/api/data-point-groups", secureFnc, function(req, res) {
            try {
                const { name, description, pointIds } = req.body;

                if (!name) {
                    return res.status(400).json(createResponse(400, "Name is required"));
                }

                const id = uuidv4();
                const now = new Date().toISOString();

                const newGroup = {
                    id,
                    name,
                    description: description || '',
                    pointCount: (pointIds || []).length,
                    commandCount: 0,
                    lastUpdatedAt: now,
                    createdAt: now,
                    updatedAt: now
                };

                dataPointGroups.push(newGroup);
                groupPoints[id] = pointIds || [];
                groupCommands[id] = [];

                res.json(createResponse(200, "Group created successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api post data-point-groups: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}:
         *   put:
         *     summary: Update data point group
         *     tags: [Data Point Groups]
         *     parameters:
         *       - in: path
         *         name: groupId
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
         *         description: Group updated
         */
        dpgApp.put("/api/data-point-groups/:groupId", secureFnc, function(req, res) {
            try {
                const groupIndex = dataPointGroups.findIndex(g => g.id === req.params.groupId);
                if (groupIndex === -1) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                const { name, description } = req.body;
                const now = new Date().toISOString();

                dataPointGroups[groupIndex] = {
                    ...dataPointGroups[groupIndex],
                    name: name || dataPointGroups[groupIndex].name,
                    description: description !== undefined ? description : dataPointGroups[groupIndex].description,
                    lastUpdatedAt: now,
                    updatedAt: now
                };

                res.json(createResponse(200, "Group updated successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api put data-point-groups: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}:
         *   delete:
         *     summary: Delete data point group
         *     tags: [Data Point Groups]
         *     parameters:
         *       - in: path
         *         name: groupId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Group deleted
         */
        dpgApp.delete("/api/data-point-groups/:groupId", secureFnc, function(req, res) {
            try {
                const groupIndex = dataPointGroups.findIndex(g => g.id === req.params.groupId);
                if (groupIndex === -1) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                dataPointGroups.splice(groupIndex, 1);
                delete groupPoints[req.params.groupId];
                delete groupCommands[req.params.groupId];

                res.json(createResponse(200, "Group deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete data-point-groups: " + (err.message || err));
            }
        });

        // ==================== Group Points ====================

        /**
         * @swagger
         * /api/data-point-groups/{groupId}/points:
         *   get:
         *     summary: Get points in group
         *     tags: [Data Point Groups]
         */
        dpgApp.get("/api/data-point-groups/:groupId/points", function(req, res) {
            try {
                const { groupId } = req.params;
                const { page = 1, pageSize = 10 } = req.query;

                if (!dataPointGroups.find(g => g.id === groupId)) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                const pointIds = groupPoints[groupId] || [];
                // In production, you would fetch actual point data from dataPoints
                const points = pointIds.map(id => ({
                    id,
                    name: `Point ${id.substring(0, 8)}`,
                    code: `CODE_${id.substring(0, 8)}`,
                    deviceName: 'Device 1',
                    dataType: 'float'
                }));

                const result = paginate(points, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-point-groups points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}/points:
         *   post:
         *     summary: Add points to group
         *     tags: [Data Point Groups]
         */
        dpgApp.post("/api/data-point-groups/:groupId/points", secureFnc, function(req, res) {
            try {
                const { groupId } = req.params;
                const { pointIds } = req.body;

                const groupIndex = dataPointGroups.findIndex(g => g.id === groupId);
                if (groupIndex === -1) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                if (!pointIds || !Array.isArray(pointIds)) {
                    return res.status(400).json(createResponse(400, "Invalid pointIds"));
                }

                if (!groupPoints[groupId]) {
                    groupPoints[groupId] = [];
                }

                // Add points that are not already in the group
                for (const pointId of pointIds) {
                    if (!groupPoints[groupId].includes(pointId)) {
                        groupPoints[groupId].push(pointId);
                    }
                }

                const now = new Date().toISOString();
                dataPointGroups[groupIndex].lastUpdatedAt = now;
                dataPointGroups[groupIndex].updatedAt = now;
                dataPointGroups[groupIndex].pointCount = groupPoints[groupId].length;

                res.json(createResponse(200, "Points added to group successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api post data-point-groups points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}/points/{pointId}:
         *   delete:
         *     summary: Remove point from group
         *     tags: [Data Point Groups]
         */
        dpgApp.delete("/api/data-point-groups/:groupId/points/:pointId", secureFnc, function(req, res) {
            try {
                const { groupId, pointId } = req.params;

                const groupIndex = dataPointGroups.findIndex(g => g.id === groupId);
                if (groupIndex === -1) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                if (!groupPoints[groupId]) {
                    return res.status(404).json(createResponse(404, "Point not found in group"));
                }

                const pointIndex = groupPoints[groupId].indexOf(pointId);
                if (pointIndex === -1) {
                    return res.status(404).json(createResponse(404, "Point not found in group"));
                }

                groupPoints[groupId].splice(pointIndex, 1);

                const now = new Date().toISOString();
                dataPointGroups[groupIndex].lastUpdatedAt = now;
                dataPointGroups[groupIndex].updatedAt = now;
                dataPointGroups[groupIndex].pointCount = groupPoints[groupId].length;

                res.json(createResponse(200, "Point removed from group successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api delete data-point-groups point: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}/available-points:
         *   get:
         *     summary: Get available points that can be added to group
         *     tags: [Data Point Groups]
         */
        dpgApp.get("/api/data-point-groups/:groupId/available-points", function(req, res) {
            try {
                const { groupId } = req.params;
                const { page = 1, pageSize = 10, keyword, pointType, usageCategory, dataType } = req.query;

                if (!dataPointGroups.find(g => g.id === groupId)) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                const existingPointIds = groupPoints[groupId] || [];

                // Mock available points (in production, filter from actual dataPoints)
                let availablePoints = [
                    { id: 'avail-1', name: 'Available Point 1', code: 'AP1', deviceName: 'Device 1', pointType: 'physical', dataType: 'float' },
                    { id: 'avail-2', name: 'Available Point 2', code: 'AP2', deviceName: 'Device 2', pointType: 'virtual', dataType: 'int' },
                    { id: 'avail-3', name: 'Available Point 3', code: 'AP3', deviceName: 'Device 1', pointType: 'physical', dataType: 'boolean' }
                ].filter(p => !existingPointIds.includes(p.id));

                // Apply filters
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    availablePoints = availablePoints.filter(p =>
                        p.name.toLowerCase().includes(kw) ||
                        p.code.toLowerCase().includes(kw) ||
                        p.deviceName.toLowerCase().includes(kw)
                    );
                }
                if (pointType) {
                    availablePoints = availablePoints.filter(p => p.pointType === pointType);
                }
                if (dataType) {
                    availablePoints = availablePoints.filter(p => p.dataType === dataType);
                }

                const result = paginate(availablePoints, page, pageSize);
                res.json(createResponse(200, "success", result));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-point-groups available-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}/usage:
         *   get:
         *     summary: Get group usage information
         *     tags: [Data Point Groups]
         */
        dpgApp.get("/api/data-point-groups/:groupId/usage", function(req, res) {
            try {
                const { groupId } = req.params;

                if (!dataPointGroups.find(g => g.id === groupId)) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                // Mock usage data (in production, query from actual references)
                const usage = {
                    usedInAlarms: [],
                    usedInDashboards: [],
                    usedInFlows: []
                };

                res.json(createResponse(200, "success", usage));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get data-point-groups usage: " + (err.message || err));
            }
        });

        return dpgApp;
    }
};
