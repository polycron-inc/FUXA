/**
 * 'api/dropdown': Dropdown API for providing dropdown options
 */

var express = require("express");

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

// Static dropdown data
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

// Mock controllers and devices (in production, these would come from database)
let mockControllers = [
    { id: 'ctrl-1', name: 'Central Controller 1', ip: '192.168.1.100' },
    { id: 'ctrl-2', name: 'Central Controller 2', ip: '192.168.1.101' },
    { id: 'ctrl-3', name: 'Gateway Controller', ip: '192.168.1.102' }
];

let mockDevices = [
    { id: 'dev-1', name: 'Temperature Sensor 1', controllerId: 'ctrl-1' },
    { id: 'dev-2', name: 'Humidity Sensor 1', controllerId: 'ctrl-1' },
    { id: 'dev-3', name: 'Power Meter 1', controllerId: 'ctrl-2' },
    { id: 'dev-4', name: 'Air Quality Monitor', controllerId: 'ctrl-2' },
    { id: 'dev-5', name: 'Water Flow Sensor', controllerId: 'ctrl-3' }
];

let mockDeviceTemplates = [
    { id: 'tmpl-1', name: 'Generic Temperature Sensor', modelNumber: 'GTS-100' },
    { id: 'tmpl-2', name: 'Power Meter Template', modelNumber: 'PMT-200' },
    { id: 'tmpl-3', name: 'Air Quality Template', modelNumber: 'AQT-300' }
];

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
         *     responses:
         *       200:
         *         description: Brand list
         */
        ddApp.get("/api/dropdown/brands", function(req, res) {
            try {
                res.json(createResponse(200, "success", BRANDS));
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
         *     responses:
         *       200:
         *         description: Communication types list
         */
        ddApp.get("/api/dropdown/communication-types", function(req, res) {
            try {
                res.json(createResponse(200, "success", COMMUNICATION_TYPES));
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
         *     responses:
         *       200:
         *         description: Connection types list
         */
        ddApp.get("/api/dropdown/connection-types", function(req, res) {
            try {
                res.json(createResponse(200, "success", CONNECTION_TYPES));
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
         *     responses:
         *       200:
         *         description: Data types list
         */
        ddApp.get("/api/dropdown/data-types", function(req, res) {
            try {
                res.json(createResponse(200, "success", DATA_TYPES));
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
         *     responses:
         *       200:
         *         description: Usage categories list
         */
        ddApp.get("/api/dropdown/usage-categories", function(req, res) {
            try {
                res.json(createResponse(200, "success", USAGE_CATEGORIES));
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
         *     responses:
         *       200:
         *         description: Command types list
         */
        ddApp.get("/api/dropdown/command-types", function(req, res) {
            try {
                res.json(createResponse(200, "success", COMMAND_TYPES));
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
         *     responses:
         *       200:
         *         description: Controllers list
         */
        ddApp.get("/api/dropdown/controllers", function(req, res) {
            try {
                const controllers = mockControllers.map(c => ({
                    label: c.name,
                    value: c.id
                }));
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
         *     parameters:
         *       - in: query
         *         name: controllerId
         *         schema:
         *           type: string
         *         description: Filter by controller ID
         *     responses:
         *       200:
         *         description: Devices list
         */
        ddApp.get("/api/dropdown/devices", function(req, res) {
            try {
                const { controllerId } = req.query;
                let devices = [...mockDevices];

                if (controllerId) {
                    devices = devices.filter(d => d.controllerId === controllerId);
                }

                const result = devices.map(d => ({
                    label: d.name,
                    value: d.id
                }));
                res.json(createResponse(200, "success", result));
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
         *     responses:
         *       200:
         *         description: Device templates list
         */
        ddApp.get("/api/dropdown/device-templates", function(req, res) {
            try {
                const templates = mockDeviceTemplates.map(t => ({
                    label: `${t.name} (${t.modelNumber})`,
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
