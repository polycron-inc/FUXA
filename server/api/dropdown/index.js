/**
 * 'api/dropdown': Dropdown API for providing dropdown options
 * Uses SQLite database for persistent storage with static fallbacks
 */

var express = require("express");
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

// Static dropdown data (fallback if database is empty)
const BRANDS = [
    { label: 'Siemens', value: 'siemens' },
    { label: 'ABB', value: 'abb' },
    { label: 'Schneider', value: 'schneider' },
    { label: 'Honeywell', value: 'honeywell' },
    { label: 'Delta', value: 'delta' },
    { label: 'Mitsubishi', value: 'mitsubishi' },
    { label: 'Omron', value: 'omron' },
    { label: 'Rockwell', value: 'rockwell' },
    { label: 'Other', value: 'other' }
];

const COMMUNICATION_TYPES = [
    { label: 'RS-485', value: 'RS-485' },
    { label: 'LAN', value: 'LAN' },
    { label: 'Modbus TCP', value: 'Modbus-TCP' },
    { label: 'Modbus RTU', value: 'Modbus-RTU' },
    { label: 'BACnet', value: 'BACnet' },
    { label: 'OPC-UA', value: 'OPC-UA' },
    { label: 'MQTT', value: 'MQTT' }
];

const CONNECTION_TYPES = [
    { label: 'Direct', value: 'direct' },
    { label: 'Gateway', value: 'gateway' },
    { label: 'Cloud', value: 'cloud' },
    { label: 'Serial', value: 'serial' },
    { label: 'Ethernet', value: 'ethernet' }
];

const DATA_TYPES = [
    { label: 'String', value: 'string' },
    { label: 'Integer', value: 'int' },
    { label: 'Long', value: 'long' },
    { label: 'Float', value: 'float' },
    { label: 'Double', value: 'double' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Enum', value: 'enum' },
    { label: 'Array', value: 'array' }
];

const USAGE_CATEGORIES = [
    { label: 'Temperature & Humidity', value: 'temperature_humidity' },
    { label: 'Air Quality', value: 'air_quality' },
    { label: 'Energy & Power', value: 'energy_power' },
    { label: 'Water Quality', value: 'water_quality' },
    { label: 'Device Status', value: 'device_status' },
    { label: 'Metering', value: 'metering' },
    { label: 'Pressure', value: 'pressure' },
    { label: 'Flow', value: 'flow' },
    { label: 'Level', value: 'level' },
    { label: 'Vibration', value: 'vibration' },
    { label: 'Other', value: 'other' }
];

const COMMAND_TYPES = [
    { label: 'Setting', value: 'setting' },
    { label: 'Action', value: 'action' },
    { label: 'Mode', value: 'mode' }
];

// Helper function to get dropdown options from database or fallback to static
async function getDropdownByCategory(category, staticFallback) {
    try {
        const rows = await prjstorage.getDropdownOptions(category);
        if (rows && rows.length > 0) {
            return rows.map(r => ({ label: r.label, value: r.value }));
        }
    } catch (err) {
        // Fall back to static data
    }
    return staticFallback;
}

module.exports = {
    init: function (_runtime, _secureFnc, _checkGroupsFnc) {
        runtime = _runtime;
        secureFnc = _secureFnc;
        checkGroupsFnc = _checkGroupsFnc;
    },
    app: function () {
        var ddApp = express();
        ddApp.use(function(req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        // ==================== Dropdown APIs ====================

        /**
         * @swagger
         * /api/dropdown/brands:
         *   get:
         *     summary: Get brand list
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/brands", async function(req, res) {
            try {
                const data = await getDropdownByCategory('brands', BRANDS);
                res.json(createResponse(200, "success", data));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/brands: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/communication-types:
         *   get:
         *     summary: Get communication types list
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/communication-types", async function(req, res) {
            try {
                const data = await getDropdownByCategory('communication_types', COMMUNICATION_TYPES);
                res.json(createResponse(200, "success", data));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/communication-types: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/connection-types:
         *   get:
         *     summary: Get connection types list
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/connection-types", async function(req, res) {
            try {
                const data = await getDropdownByCategory('connection_types', CONNECTION_TYPES);
                res.json(createResponse(200, "success", data));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/connection-types: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/data-types:
         *   get:
         *     summary: Get data types list
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/data-types", async function(req, res) {
            try {
                const data = await getDropdownByCategory('data_types', DATA_TYPES);
                res.json(createResponse(200, "success", data));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/data-types: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/usage-categories:
         *   get:
         *     summary: Get usage categories list
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/usage-categories", async function(req, res) {
            try {
                const data = await getDropdownByCategory('usage_categories', USAGE_CATEGORIES);
                res.json(createResponse(200, "success", data));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/usage-categories: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/command-types:
         *   get:
         *     summary: Get command types list
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/command-types", async function(req, res) {
            try {
                const data = await getDropdownByCategory('command_types', COMMAND_TYPES);
                res.json(createResponse(200, "success", data));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/command-types: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/controllers:
         *   get:
         *     summary: Get controllers list (for dropdown)
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/controllers", async function(req, res) {
            try {
                // TODO: Get from actual controllers in database
                const controllers = [];
                res.json(createResponse(200, "success", controllers));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/controllers: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/devices:
         *   get:
         *     summary: Get devices list (for dropdown)
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/devices", async function(req, res) {
            try {
                const { controllerId } = req.query;
                // TODO: Get from actual devices in database
                const devices = [];
                res.json(createResponse(200, "success", devices));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/devices: " + (err.message || err));
            }
        });

        /**
         * @swagger
         * /api/dropdown/device-templates:
         *   get:
         *     summary: Get device templates list (for dropdown)
         *     tags: [Dropdown]
         */
        ddApp.get("/api/dropdown/device-templates", async function(req, res) {
            try {
                const rows = await prjstorage.getDeviceTemplates({ status: 'enabled' });
                const templates = rows.map(t => ({
                    label: `${t.name} (${t.code || ''})`,
                    value: t.id
                }));
                res.json(createResponse(200, "success", templates));
            } catch (err) {
                res.status(400).json(createResponse(400, err.message || err));
                runtime.logger.error("api get dropdown/device-templates: " + (err.message || err));
            }
        });

        return ddApp;
    }
};
