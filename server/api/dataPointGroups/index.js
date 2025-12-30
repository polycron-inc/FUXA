/**
 * 'api/dataPointGroups': Data Point Groups API for managing data point groups
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

// Helper function to convert DB row to group object
function dbRowToGroup(row) {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        status: row.status,
        creator: row.creator,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        lastUpdatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
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
        groupId: row.group_id,
        name: row.name,
        code: row.code,
        commandType: row.command_type,
        parameters: parameters,
        description: row.description,
        sortOrder: row.sort_order,
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
         */
        dpgApp.get("/api/data-point-groups", async function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, status } = req.query;

                const filters = { keyword, status };
                const rows = await prjstorage.getDataPointGroups(filters);

                let groups = [];
                for (const row of rows) {
                    const group = dbRowToGroup(row);
                    const points = await prjstorage.getGroupPoints(group.id);
                    const commands = await prjstorage.getGroupCommands(group.id);
                    group.pointCount = points.length;
                    group.commandCount = commands.length;
                    groups.push(group);
                }

                const result = paginate(groups, page, pageSize);
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
         */
        dpgApp.get("/api/data-point-groups/:groupId", async function(req, res) {
            try {
                const row = await prjstorage.getDataPointGroup(req.params.groupId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                const group = dbRowToGroup(row);
                const pointRows = await prjstorage.getGroupPoints(group.id);
                const commandRows = await prjstorage.getGroupCommands(group.id);

                // Map points with their details
                group.points = pointRows.map(p => ({
                    id: p.point_id,
                    name: p.name,
                    code: p.code,
                    deviceName: p.device_name,
                    dataType: p.data_type,
                    pointType: p.point_type
                }));
                group.commands = commandRows.map(dbRowToCommand);
                group.pointCount = group.points.length;
                group.commandCount = group.commands.length;

                res.json(createResponse(200, "success", group));
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
         */
        dpgApp.post("/api/data-point-groups", secureFnc, async function(req, res) {
            try {
                const { name, description, pointIds } = req.body;

                if (!name) {
                    return res.status(400).json(createResponse(400, "Name is required"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setDataPointGroup({
                    id,
                    name,
                    code: '',
                    description: description || '',
                    status: 'active',
                    creator: req.userId || null,
                    created_at: now
                });

                // Add points if provided
                if (pointIds && Array.isArray(pointIds)) {
                    for (let i = 0; i < pointIds.length; i++) {
                        await prjstorage.addGroupPoint(id, pointIds[i], i);
                    }
                }

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
         */
        dpgApp.put("/api/data-point-groups/:groupId", secureFnc, async function(req, res) {
            try {
                const existing = await prjstorage.getDataPointGroup(req.params.groupId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                const { name, description } = req.body;

                await prjstorage.setDataPointGroup({
                    id: req.params.groupId,
                    name: name || existing.name,
                    code: existing.code,
                    description: description !== undefined ? description : existing.description,
                    status: existing.status,
                    creator: existing.creator,
                    created_at: existing.created_at
                });

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
         */
        dpgApp.delete("/api/data-point-groups/:groupId", secureFnc, async function(req, res) {
            try {
                const existing = await prjstorage.getDataPointGroup(req.params.groupId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                await prjstorage.deleteDataPointGroup(req.params.groupId);

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
        dpgApp.get("/api/data-point-groups/:groupId/points", async function(req, res) {
            try {
                const { groupId } = req.params;
                const { page = 1, pageSize = 10 } = req.query;

                const group = await prjstorage.getDataPointGroup(groupId);
                if (!group) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                const pointRows = await prjstorage.getGroupPoints(groupId);
                const points = pointRows.map(p => ({
                    id: p.point_id,
                    name: p.name,
                    code: p.code,
                    deviceName: p.device_name,
                    dataType: p.data_type,
                    pointType: p.point_type
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
        dpgApp.post("/api/data-point-groups/:groupId/points", secureFnc, async function(req, res) {
            try {
                const { groupId } = req.params;
                const { pointIds } = req.body;

                const group = await prjstorage.getDataPointGroup(groupId);
                if (!group) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                if (!pointIds || !Array.isArray(pointIds)) {
                    return res.status(400).json(createResponse(400, "Invalid pointIds"));
                }

                // Get existing points
                const existingPoints = await prjstorage.getGroupPoints(groupId);
                const existingPointIds = existingPoints.map(p => p.point_id);
                const maxOrder = existingPoints.length > 0
                    ? Math.max(...existingPoints.map(p => p.sort_order || 0)) + 1
                    : 0;

                // Add points that are not already in the group
                let order = maxOrder;
                for (const pointId of pointIds) {
                    if (!existingPointIds.includes(pointId)) {
                        await prjstorage.addGroupPoint(groupId, pointId, order++);
                    }
                }

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
        dpgApp.delete("/api/data-point-groups/:groupId/points/:pointId", secureFnc, async function(req, res) {
            try {
                const { groupId, pointId } = req.params;

                const group = await prjstorage.getDataPointGroup(groupId);
                if (!group) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                await prjstorage.removeGroupPoint(groupId, pointId);

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
        dpgApp.get("/api/data-point-groups/:groupId/available-points", async function(req, res) {
            try {
                const { groupId } = req.params;
                const { page = 1, pageSize = 10, keyword, pointType, dataType } = req.query;

                const group = await prjstorage.getDataPointGroup(groupId);
                if (!group) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                // Get existing point IDs in group
                const existingPoints = await prjstorage.getGroupPoints(groupId);
                const existingPointIds = existingPoints.map(p => p.point_id);

                // Get all data points
                const allPoints = await prjstorage.getDataPoints({ keyword, pointType });

                // Filter out points that are already in the group
                let availablePoints = allPoints
                    .filter(p => !existingPointIds.includes(p.id))
                    .map(p => ({
                        id: p.id,
                        name: p.name,
                        code: p.code,
                        deviceName: p.device_name || '-',
                        pointType: p.point_type,
                        dataType: p.data_type
                    }));

                // Apply additional filters
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
        dpgApp.get("/api/data-point-groups/:groupId/usage", async function(req, res) {
            try {
                const { groupId } = req.params;

                const group = await prjstorage.getDataPointGroup(groupId);
                if (!group) {
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

        // ==================== Import/Export ====================

        /**
         * @swagger
         * /api/data-point-groups/export-all:
         *   get:
         *     summary: Export all data point groups
         *     tags: [Data Point Groups]
         */
        dpgApp.get("/api/data-point-groups/export-all", async function(req, res) {
            try {
                const rows = await prjstorage.getDataPointGroups({});
                const exportData = [];

                for (const row of rows) {
                    const group = dbRowToGroup(row);
                    const pointRows = await prjstorage.getGroupPoints(group.id);
                    const commandRows = await prjstorage.getGroupCommands(group.id);

                    group.points = pointRows.map(p => ({
                        id: p.point_id,
                        name: p.name,
                        code: p.code,
                        deviceName: p.device_name,
                        dataType: p.data_type,
                        pointType: p.point_type
                    }));
                    group.commands = commandRows.map(dbRowToCommand);
                    group.pointCount = group.points.length;
                    group.commandCount = group.commands.length;

                    exportData.push(group);
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=data-point-groups-export.json');
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-all data-point-groups: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/{groupId}/export:
         *   get:
         *     summary: Export single data point group
         *     tags: [Data Point Groups]
         */
        dpgApp.get("/api/data-point-groups/:groupId/export", async function(req, res) {
            try {
                const row = await prjstorage.getDataPointGroup(req.params.groupId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Group not found"));
                }

                const group = dbRowToGroup(row);
                const pointRows = await prjstorage.getGroupPoints(group.id);
                const commandRows = await prjstorage.getGroupCommands(group.id);

                group.points = pointRows.map(p => ({
                    id: p.point_id,
                    name: p.name,
                    code: p.code,
                    deviceName: p.device_name,
                    dataType: p.data_type,
                    pointType: p.point_type
                }));
                group.commands = commandRows.map(dbRowToCommand);
                group.pointCount = group.points.length;
                group.commandCount = group.commands.length;

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${group.name}-export.json`);
                res.json(group);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export data-point-group: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/export-batch:
         *   post:
         *     summary: Export selected data point groups
         *     tags: [Data Point Groups]
         */
        dpgApp.post("/api/data-point-groups/export-batch", async function(req, res) {
            try {
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                const exportData = [];
                for (const id of ids) {
                    const row = await prjstorage.getDataPointGroup(id);
                    if (row) {
                        const group = dbRowToGroup(row);
                        const pointRows = await prjstorage.getGroupPoints(group.id);
                        const commandRows = await prjstorage.getGroupCommands(group.id);

                        group.points = pointRows.map(p => ({
                            id: p.point_id,
                            name: p.name,
                            code: p.code,
                            deviceName: p.device_name,
                            dataType: p.data_type,
                            pointType: p.point_type
                        }));
                        group.commands = commandRows.map(dbRowToCommand);
                        group.pointCount = group.points.length;
                        group.commandCount = group.commands.length;

                        exportData.push(group);
                    }
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=data-point-groups-batch-export.json');
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-batch data-point-groups: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/import:
         *   post:
         *     summary: Import single data point group
         *     tags: [Data Point Groups]
         */
        dpgApp.post("/api/data-point-groups/import", secureFnc, async function(req, res) {
            try {
                const group = req.body;

                if (!group || !group.name) {
                    return res.status(400).json(createResponse(400, "Invalid group data"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setDataPointGroup({
                    id,
                    name: group.name,
                    code: group.code || '',
                    description: group.description || '',
                    status: group.status || 'active',
                    creator: req.userId || null,
                    created_at: now
                });

                // Import points if provided (by point IDs)
                if (group.pointIds && Array.isArray(group.pointIds)) {
                    for (let i = 0; i < group.pointIds.length; i++) {
                        await prjstorage.addGroupPoint(id, group.pointIds[i], i);
                    }
                }

                res.json(createResponse(200, "Group imported successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import data-point-group: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-point-groups/import-batch:
         *   post:
         *     summary: Import multiple data point groups (batch import)
         *     tags: [Data Point Groups]
         */
        dpgApp.post("/api/data-point-groups/import-batch", secureFnc, async function(req, res) {
            try {
                const groups = req.body;

                if (!Array.isArray(groups)) {
                    return res.status(400).json(createResponse(400, "Invalid import data - expected array"));
                }

                const now = Date.now();
                const results = [];
                let successCount = 0;
                let failedCount = 0;

                for (const group of groups) {
                    try {
                        if (!group.name) {
                            results.push({
                                groupName: group.name || 'Unknown',
                                status: 'failed',
                                message: 'Missing required field (name)'
                            });
                            failedCount++;
                            continue;
                        }

                        // Check for duplicate name
                        const existingRows = await prjstorage.getDataPointGroups({ keyword: group.name });
                        const existing = existingRows.find(g => g.name === group.name);
                        if (existing) {
                            results.push({
                                groupName: group.name,
                                status: 'failed',
                                message: 'Group with same name already exists'
                            });
                            failedCount++;
                            continue;
                        }

                        const id = uuidv4();

                        await prjstorage.setDataPointGroup({
                            id,
                            name: group.name,
                            code: group.code || '',
                            description: group.description || '',
                            status: group.status || 'active',
                            creator: req.userId || null,
                            created_at: now
                        });

                        // Import points if provided (by point IDs)
                        if (group.pointIds && Array.isArray(group.pointIds)) {
                            for (let i = 0; i < group.pointIds.length; i++) {
                                await prjstorage.addGroupPoint(id, group.pointIds[i], i);
                            }
                        }

                        results.push({
                            groupName: group.name,
                            status: 'success',
                            message: 'Imported successfully',
                            id
                        });
                        successCount++;
                    } catch (err) {
                        results.push({
                            groupName: group.name || 'Unknown',
                            status: 'failed',
                            message: err.message || 'Import failed'
                        });
                        failedCount++;
                    }
                }

                res.json(createResponse(200, "Import completed", {
                    totalCount: groups.length,
                    successCount,
                    failedCount,
                    results
                }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import-batch data-point-groups: " + (err.message || err));
            }
        });

        return dpgApp;
    }
};
