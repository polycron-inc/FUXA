/**
 * 'api/dataPoints': Data Points API for managing data points
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

// Helper function to convert DB row to data point object
function dbRowToDataPoint(row) {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        deviceId: row.device_id,
        deviceName: row.device_name,
        controllerId: row.controller_id,
        pointType: row.point_type,
        dataType: row.data_type,
        unit: row.unit,
        address: row.address,
        status: row.status,
        readStatus: row.read_status,
        locked: row.locked === 1 || row.locked === true,
        auditStatus: row.audit_status || 'pending',
        description: row.description,
        creator: row.creator,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        latestValue: null,
        lastUpdatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
    };
}

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

module.exports = {
    init: function (_runtime, _secureFnc, _checkGroupsFnc) {
        runtime = _runtime;
        secureFnc = _secureFnc;
        checkGroupsFnc = _checkGroupsFnc;
    },
    // Export function to get all data points (for use by other modules)
    getDataPoints: async function() {
        try {
            const rows = await prjstorage.getDataPoints({});
            return rows.map(dbRowToDataPoint);
        } catch (err) {
            return [];
        }
    },
    // Export function to get pending data points (for use by other modules)
    getPendingDataPoints: async function() {
        try {
            const rows = await prjstorage.getPendingDataPoints({});
            return rows.map(dbRowToDataPoint);
        } catch (err) {
            return [];
        }
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
         */
        dpApp.get("/api/data-points", async function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, controllerId, pointType, status, readStatus, tab } = req.query;

                const filters = { keyword, controllerId, pointType, status, readStatus };
                const rows = await prjstorage.getDataPoints(filters);
                const points = rows.map(dbRowToDataPoint);

                const result = paginate(points, page, pageSize);

                // Get pending count
                const pendingRows = await prjstorage.getPendingDataPoints({});
                result.pendingCount = pendingRows.length;

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
         */
        dpApp.get("/api/data-points/:pointId", async function(req, res) {
            try {
                const row = await prjstorage.getDataPoint(req.params.pointId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                const point = dbRowToDataPoint(row);
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
         */
        dpApp.post("/api/data-points", secureFnc, async function(req, res) {
            try {
                const { name, code, pointType, deviceId, dataType, unit, description, defaultValue, locked, auditStatus } = req.body;

                if (!name || !code || !dataType) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                // Only allow creating virtual points
                if (pointType && pointType !== 'virtual') {
                    return res.status(400).json(createResponse(400, "Can only create virtual data points"));
                }

                const id = uuidv4();
                const now = Date.now();

                await prjstorage.setDataPoint({
                    id,
                    name,
                    code,
                    device_id: deviceId || null,
                    device_name: '',
                    controller_id: null,
                    point_type: 'virtual',
                    data_type: dataType,
                    unit: unit || '',
                    address: null,
                    status: 'enabled',
                    read_status: 'normal',
                    locked: locked || false,
                    audit_status: auditStatus || 'pending',
                    description: description || '',
                    creator: req.userId || null,
                    created_at: now
                });

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
         */
        dpApp.put("/api/data-points/:pointId", secureFnc, async function(req, res) {
            try {
                const existing = await prjstorage.getDataPoint(req.params.pointId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                // Check if data point is locked
                if (existing.locked === 1 || existing.locked === true) {
                    return res.status(403).json(createResponse(403, "Data point is locked and cannot be modified"));
                }

                const { name, description, unit, status, locked, auditStatus } = req.body;

                await prjstorage.setDataPoint({
                    id: req.params.pointId,
                    name: name || existing.name,
                    code: existing.code,
                    device_id: existing.device_id,
                    device_name: existing.device_name,
                    controller_id: existing.controller_id,
                    point_type: existing.point_type,
                    data_type: existing.data_type,
                    unit: unit !== undefined ? unit : existing.unit,
                    address: existing.address,
                    status: status || existing.status,
                    read_status: existing.read_status,
                    locked: locked !== undefined ? locked : existing.locked,
                    audit_status: auditStatus !== undefined ? auditStatus : existing.audit_status,
                    description: description !== undefined ? description : existing.description,
                    creator: existing.creator,
                    created_at: existing.created_at
                });

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
        dpApp.patch("/api/data-points/:pointId/status", secureFnc, async function(req, res) {
            try {
                const { pointId } = req.params;
                const { status } = req.body;

                const existing = await prjstorage.getDataPoint(pointId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                if (!['enabled', 'disabled'].includes(status)) {
                    return res.status(400).json(createResponse(400, "Invalid status"));
                }

                await prjstorage.setDataPoint({
                    ...existing,
                    id: pointId,
                    status: status
                });

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
        dpApp.post("/api/data-points/:pointId/test-read", secureFnc, async function(req, res) {
            try {
                const row = await prjstorage.getDataPoint(req.params.pointId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                const point = dbRowToDataPoint(row);
                const startTime = Date.now();

                // For demo purposes, return a mock value
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
         * /api/data-points/{pointId}/lock:
         *   patch:
         *     summary: Lock/Unlock data point
         *     tags: [Data Points]
         */
        dpApp.patch("/api/data-points/:pointId/lock", secureFnc, async function(req, res) {
            try {
                const { pointId } = req.params;
                const { locked } = req.body;

                const existing = await prjstorage.getDataPoint(pointId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                if (locked === undefined) {
                    return res.status(400).json(createResponse(400, "locked field is required"));
                }

                await prjstorage.setDataPoint({
                    ...existing,
                    id: pointId,
                    locked: locked
                });

                res.json(createResponse(200, locked ? "Data point locked successfully" : "Data point unlocked successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api lock data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/{pointId}/audit-status:
         *   patch:
         *     summary: Update data point audit status
         *     tags: [Data Points]
         */
        dpApp.patch("/api/data-points/:pointId/audit-status", secureFnc, async function(req, res) {
            try {
                const { pointId } = req.params;
                const { auditStatus } = req.body;

                const existing = await prjstorage.getDataPoint(pointId);
                if (!existing) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                const validStatuses = ['pending', 'approved', 'rejected', 'reviewing'];
                if (!auditStatus || !validStatuses.includes(auditStatus)) {
                    return res.status(400).json(createResponse(400, `Invalid audit status. Valid values: ${validStatuses.join(', ')}`));
                }

                await prjstorage.setDataPoint({
                    ...existing,
                    id: pointId,
                    audit_status: auditStatus
                });

                res.json(createResponse(200, `Audit status updated to '${auditStatus}' successfully`));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api audit-status data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/batch-action:
         *   post:
         *     summary: Batch action on data points
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/batch-action", secureFnc, async function(req, res) {
            try {
                const { ids, action } = req.body;

                if (!ids || !Array.isArray(ids) || !action) {
                    return res.status(400).json(createResponse(400, "Invalid request"));
                }

                if (!['enable', 'disable', 'delete', 'lock', 'unlock'].includes(action)) {
                    return res.status(400).json(createResponse(400, "Invalid action"));
                }

                const lockedIds = [];
                for (const id of ids) {
                    const existing = await prjstorage.getDataPoint(id);
                    if (!existing) continue;

                    if (action === 'delete') {
                        if (existing.locked === 1 || existing.locked === true) {
                            lockedIds.push(id);
                        } else {
                            await prjstorage.deleteDataPoint(id);
                        }
                    } else if (action === 'lock' || action === 'unlock') {
                        await prjstorage.setDataPoint({
                            ...existing,
                            id: id,
                            locked: action === 'lock'
                        });
                    } else {
                        if (existing.locked === 1 || existing.locked === true) {
                            lockedIds.push(id);
                        } else {
                            await prjstorage.setDataPoint({
                                ...existing,
                                id: id,
                                status: action === 'enable' ? 'enabled' : 'disabled'
                            });
                        }
                    }
                }

                if (lockedIds.length > 0) {
                    res.json(createResponse(200, `Batch ${action} completed, but ${lockedIds.length} locked point(s) were skipped`));
                } else {
                    res.json(createResponse(200, `Batch ${action} completed successfully`));
                }
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
        dpApp.get("/api/data-points/pending", async function(req, res) {
            try {
                const { page = 1, pageSize = 10, keyword, controllerId, pointType } = req.query;

                const filters = { keyword };
                const rows = await prjstorage.getPendingDataPoints(filters);
                const points = rows.map(dbRowToDataPoint);

                const result = paginate(points, page, pageSize);
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
        dpApp.post("/api/data-points/pending/:pendingId/approve", secureFnc, async function(req, res) {
            try {
                const { pendingId } = req.params;
                const { templateId, attributeData } = req.body;

                const pendingRows = await prjstorage.getPendingDataPoints({});
                const pendingPoint = pendingRows.find(p => p.id === pendingId);

                if (!pendingPoint) {
                    return res.status(404).json(createResponse(404, "Pending data point not found"));
                }

                if (!templateId || !attributeData) {
                    return res.status(400).json(createResponse(400, "Missing required fields"));
                }

                const now = Date.now();
                const newId = uuidv4();

                // Create new data point from pending
                await prjstorage.setDataPoint({
                    id: newId,
                    name: attributeData.name || pendingPoint.name,
                    code: pendingPoint.code,
                    device_id: pendingPoint.device_id,
                    device_name: pendingPoint.device_name,
                    controller_id: pendingPoint.controller_id,
                    point_type: 'physical',
                    data_type: attributeData.dataType || pendingPoint.data_type,
                    unit: attributeData.unit || '',
                    address: pendingPoint.address,
                    status: 'enabled',
                    read_status: 'normal',
                    description: '',
                    creator: req.userId || null,
                    created_at: now
                });

                // Delete pending point
                await prjstorage.deletePendingDataPoint(pendingId);

                res.json(createResponse(200, "Data point approved successfully", { id: newId }));
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
        dpApp.delete("/api/data-points/pending/:pendingId", secureFnc, async function(req, res) {
            try {
                const pendingRows = await prjstorage.getPendingDataPoints({});
                const pendingPoint = pendingRows.find(p => p.id === req.params.pendingId);

                if (!pendingPoint) {
                    return res.status(404).json(createResponse(404, "Pending data point not found"));
                }

                await prjstorage.deletePendingDataPoint(req.params.pendingId);

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
        dpApp.post("/api/data-points/pending/batch-delete", secureFnc, async function(req, res) {
            try {
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                for (const id of ids) {
                    await prjstorage.deletePendingDataPoint(id);
                }

                res.json(createResponse(200, "Pending data points deleted successfully"));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api batch-delete data-points/pending: " + (err.message || err));
            }
        });

        // ==================== Import/Export ====================

        /**
         * @swagger
         * /api/data-points/export-all:
         *   get:
         *     summary: Export all data points
         *     tags: [Data Points]
         */
        dpApp.get("/api/data-points/export-all", async function(req, res) {
            try {
                const rows = await prjstorage.getDataPoints({});
                const exportData = rows.map(dbRowToDataPoint);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=data-points-export.json');
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-all data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/{pointId}/export:
         *   get:
         *     summary: Export single data point
         *     tags: [Data Points]
         */
        dpApp.get("/api/data-points/:pointId/export", async function(req, res) {
            try {
                const row = await prjstorage.getDataPoint(req.params.pointId);
                if (!row) {
                    return res.status(404).json(createResponse(404, "Data point not found"));
                }

                const point = dbRowToDataPoint(row);

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${point.name}-export.json`);
                res.json(point);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export data-point: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/export-batch:
         *   post:
         *     summary: Export selected data points
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/export-batch", async function(req, res) {
            try {
                const { ids } = req.body;

                if (!ids || !Array.isArray(ids)) {
                    return res.status(400).json(createResponse(400, "Invalid ids"));
                }

                const exportData = [];
                for (const id of ids) {
                    const row = await prjstorage.getDataPoint(id);
                    if (row) {
                        exportData.push(dbRowToDataPoint(row));
                    }
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=data-points-batch-export.json');
                res.json(exportData);
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api export-batch data-points: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/import:
         *   post:
         *     summary: Import single data point
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/import", secureFnc, async function(req, res) {
            try {
                const point = req.body;

                if (!point || !point.name || !point.dataType) {
                    return res.status(400).json(createResponse(400, "Invalid data point data"));
                }

                const now = Date.now();
                const id = uuidv4();

                await prjstorage.setDataPoint({
                    id,
                    name: point.name,
                    code: point.code || '',
                    device_id: point.deviceId || null,
                    device_name: point.deviceName || '',
                    controller_id: point.controllerId || null,
                    point_type: point.pointType || 'virtual',
                    data_type: point.dataType,
                    unit: point.unit || '',
                    address: point.address || null,
                    status: point.status || 'enabled',
                    read_status: point.readStatus || 'normal',
                    locked: point.locked || false,
                    audit_status: point.auditStatus || 'pending',
                    description: point.description || '',
                    creator: req.userId || null,
                    created_at: now
                });

                res.json(createResponse(200, "Data point imported successfully", { id }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import data-point: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/data-points/import-batch:
         *   post:
         *     summary: Import multiple data points (batch import)
         *     tags: [Data Points]
         */
        dpApp.post("/api/data-points/import-batch", secureFnc, async function(req, res) {
            try {
                const points = req.body;

                if (!Array.isArray(points)) {
                    return res.status(400).json(createResponse(400, "Invalid import data - expected array"));
                }

                const now = Date.now();
                const results = [];
                let successCount = 0;
                let failedCount = 0;

                for (const point of points) {
                    try {
                        if (!point.name || !point.dataType) {
                            results.push({
                                pointName: point.name || 'Unknown',
                                status: 'failed',
                                message: 'Missing required fields (name, dataType)'
                            });
                            failedCount++;
                            continue;
                        }

                        // Check for duplicate code if code is provided
                        if (point.code) {
                            const existingRows = await prjstorage.getDataPoints({ keyword: point.code });
                            const existing = existingRows.find(p => p.code === point.code);
                            if (existing) {
                                results.push({
                                    pointName: point.name,
                                    status: 'failed',
                                    message: 'Data point with same code already exists'
                                });
                                failedCount++;
                                continue;
                            }
                        }

                        const id = uuidv4();

                        await prjstorage.setDataPoint({
                            id,
                            name: point.name,
                            code: point.code || '',
                            device_id: point.deviceId || null,
                            device_name: point.deviceName || '',
                            controller_id: point.controllerId || null,
                            point_type: point.pointType || 'virtual',
                            data_type: point.dataType,
                            unit: point.unit || '',
                            address: point.address || null,
                            status: point.status || 'enabled',
                            read_status: point.readStatus || 'normal',
                            locked: point.locked || false,
                            audit_status: point.auditStatus || 'pending',
                            description: point.description || '',
                            creator: req.userId || null,
                            created_at: now
                        });

                        results.push({
                            pointName: point.name,
                            status: 'success',
                            message: 'Imported successfully',
                            id
                        });
                        successCount++;
                    } catch (err) {
                        results.push({
                            pointName: point.name || 'Unknown',
                            status: 'failed',
                            message: err.message || 'Import failed'
                        });
                        failedCount++;
                    }
                }

                res.json(createResponse(200, "Import completed", {
                    totalCount: points.length,
                    successCount,
                    failedCount,
                    results
                }));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api import-batch data-points: " + (err.message || err));
            }
        });

        return dpApp;
    }
};
