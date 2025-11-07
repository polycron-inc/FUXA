/**
 * 'api/project': Project API to GET/POST project data
 */

var express = require("express");
const authJwt = require('../jwt-helper');
const fs = require('fs');
const path = require('path');
const os = require('os');

var runtime;
var secureFnc;
var checkGroupsFnc;

module.exports = {
    init: function (_runtime, _secureFnc, _checkGroupsFnc) {
        runtime = _runtime;
        secureFnc = _secureFnc;
        checkGroupsFnc = _checkGroupsFnc;
    },
    app: function () {
        var prjApp = express();
        prjApp.use(function(req,res,next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        /**
         * GET Project data
         * Take from project storage and reply
         */
        prjApp.get("/api/project", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            runtime.project.getProject(req.userId, permission).then(result => {
                // res.header("Access-Control-Allow-Origin", "*");
                // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                if (result) {
                    res.json(result);
                } else {
                    res.status(404).end();
                    runtime.logger.error("api get project: Not Found!");
                }
            }).catch(function(err) {
                if (err && err.code) {
                    if (err.code !== 'ERR_HTTP_HEADERS_SENT') {
                        res.status(400).json({error:err.code, message: err.message});
                        runtime.logger.error("api get project: " + err.message);
                    }
                } else {
                    res.status(400).json({error:"unexpected_error", message: err});
                    runtime.logger.error("api get project: " + err);
                }
            });
        });

        /**
         * POST Project data
         * Set to project storage
         */
        prjApp.post("/api/project", secureFnc, function(req, res, next) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api post project: Tocken Expired");
            } else if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                runtime.logger.error("api post project: Unauthorized");
            } else {
                runtime.project.setProject(req.body).then(function(data) {
                    runtime.restart(true).then(function(result) {
                        res.end();
                    });
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error:err.code, message: err.message});
                        runtime.logger.error("api post project: " + err.message);
                    } else {
                        res.status(400).json({error:"unexpected_error", message: err});
                        runtime.logger.error("api post project: " + err);
                    }
                });
            }
        });

        /**
         * POST Single Project data
         * Set the value (general/view/device/...) to project storage
         */
        prjApp.post("/api/projectData", secureFnc, function(req, res, next) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api post projectData: Tocken Expired");
            } else if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                runtime.logger.error("api post projectData: Unauthorized");
            } else {
                runtime.project.setProjectData(req.body.cmd, req.body.data).then(setres => {
                    runtime.update(req.body.cmd, req.body.data).then(result => {
                        res.end();
                    });
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error:err.code, message: err.message});
                        runtime.logger.error("api post projectData: " + err.message);
                    } else {
                        res.status(400).json({error:"unexpected_error", message: err});
                        runtime.logger.error("api post projectData: " + err);
                    }
                });
            }
        });

        /**
         * GET Project demo data
         * Take the project demo file from server folder
         */
        prjApp.get("/api/projectdemo", secureFnc, function (req, res) {
            const data = runtime.project.getProjectDemo();
            // res.header("Access-Control-Allow-Origin", "*");
            // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            if (data) {
                res.json(data);
            } else {
                res.status(404).end();
                runtime.logger.error("api get project: Not Found!");
            }
        });

        /**
         * GET Device property like security
         * Take from project storage and reply
         */
        prjApp.get("/api/device", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api get device: Tocken Expired");
            } else if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                runtime.logger.error("api get device: Unauthorized");
            } else {
                runtime.project.getDeviceProperty(req.query).then(result => {
                    // res.header("Access-Control-Allow-Origin", "*");
                    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    if (result) {
                        res.json(result);
                    } else {
                        res.end();
                    }
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error:err.code, message: err.message});
                        runtime.logger.error("api get device: " + err.message);
                    } else {
                        res.status(400).json({error:"unexpected_error", message: err});
                        runtime.logger.error("api get device: " + err);
                    }
                });
            }
        });

        /**
         * POST Device property
         * Set to project storage
         */
        prjApp.post("/api/device", secureFnc, function(req, res, next) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api post device: Tocken Expired");
            } else if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                runtime.logger.error("api post device: Unauthorized");
            } else {
                runtime.project.setDeviceProperty(req.body.params).then(function(data) {
                    res.end();
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error:err.code, message: err.message});
                        runtime.logger.error("api post device: " + err.message);
                    } else {
                        res.status(400).json({error:"unexpected_error", message: err});
                        runtime.logger.error("api post device: " + err);
                    }
                });
            }
        });

        /**
         * GET Export single view
         * Export a single view as JSON by viewId
         * Public API - No authentication required
         * Follows the same logic as client's onExportView
         */
        prjApp.get("/api/project/export-view/:viewId", function(req, res) {
            try {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

                const viewId = req.params.viewId;

                if (!viewId) {
                    res.status(400).json({error:"missing_parameter", message: "viewId is required"});
                    runtime.logger.error("api get project/export-view: viewId is required");
                    return;
                }

                // Get project to find the view
                runtime.project.getProject(null, null).then(projectData => {
                    // Find the view by ID
                    const view = projectData.hmi?.views?.find(v => v.id === viewId);

                    if (!view) {
                        res.status(404).json({error:"view_not_found", message: `View with id '${viewId}' not found`});
                        runtime.logger.error(`api get project/export-view: View '${viewId}' not found`);
                        return;
                    }

                    // Export view (same as client's onExportView logic)
                    const exportData = {
                        ...view,
                        type: view.type || 'svg'
                    };

                    res.json(exportData);
                    runtime.logger.info(`api get project/export-view: Successfully exported view '${view.name}' (${viewId})`);
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error: err.code, message: err.message});
                        runtime.logger.error("api get project/export-view: " + err.message);
                    } else {
                        res.status(400).json({error:"unexpected_error", message: err});
                        runtime.logger.error("api get project/export-view: " + err);
                    }
                });
            } catch(err) {
                if (err && err.message) {
                    res.status(400).json({error:"export_error", message: err.message});
                    runtime.logger.error("api get project/export-view: " + err.message);
                } else {
                    res.status(400).json({error:"unexpected_error", message: err});
                    runtime.logger.error("api get project/export-view: " + err);
                }
            }
        });

        /**
         * GET Export project
         * Export the entire project as JSON
         * Public API - No authentication required
         */
        prjApp.get("/api/project/export", function(req, res) {
            try {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

                // Get full project without permission filtering
                runtime.project.getProject(null, null).then(projectData => {
                    // Clean up tag values (similar to convertToSave in client)
                    let exportData = JSON.parse(JSON.stringify(projectData));

                    // Remove runtime tag values from devices
                    if (exportData.devices) {
                        for (let devid in exportData.devices) {
                            if (exportData.devices[devid].tags) {
                                for (let tagid in exportData.devices[devid].tags) {
                                    delete exportData.devices[devid].tags[tagid].value;
                                }
                            }
                        }
                    }

                    res.json(exportData);
                    runtime.logger.info("api get project/export: Successfully exported project");
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error: err.code, message: err.message});
                        runtime.logger.error("api get project/export: " + err.message);
                    } else {
                        res.status(400).json({error:"unexpected_error", message: err});
                        runtime.logger.error("api get project/export: " + err);
                    }
                });
            } catch(err) {
                if (err && err.message) {
                    res.status(400).json({error:"export_error", message: err.message});
                    runtime.logger.error("api get project/export: " + err.message);
                } else {
                    res.status(400).json({error:"unexpected_error", message: err});
                    runtime.logger.error("api get project/export: " + err);
                }
            }
        });

        /**
         * POST Clone view
         * Clone an existing view with new IDs
         * Public API - No authentication required
         */
        prjApp.post("/api/project/clone-view", function(req, res, next) {
            try {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                const { viewId, newName } = req.body;
                if (!viewId) {
                    res.status(400).json({error:"missing_parameter", message: "viewId is required"});
                    runtime.logger.error("api post clone-view: viewId is required");
                    return;
                }

                const clonedView = runtime.project.cloneView(viewId, newName);

                // Save the cloned view to storage
                runtime.project.setProjectData(runtime.project.ProjectDataCmdType.SetView, clonedView).then(() => {
                    res.json({ view: clonedView });
                    runtime.logger.info(`api post clone-view: Successfully cloned view ${viewId} to ${clonedView.name}`);
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error: err.code, message: err.message});
                        runtime.logger.error("api post clone-view save: " + err.message);
                    } else {
                        res.status(400).json({error:"unexpected_error", message: err});
                        runtime.logger.error("api post clone-view save: " + err);
                    }
                });
            } catch(err) {
                if (err && err.message) {
                    res.status(400).json({error:"clone_error", message: err.message});
                    runtime.logger.error("api post clone-view: " + err.message);
                } else {
                    res.status(400).json({error:"unexpected_error", message: err});
                    runtime.logger.error("api post clone-view: " + err);
                }
            }
        });

        /**
         * POST Import project
         * Import entire project from JSON data
         * Public API - No authentication required
         * Follows the same logic as client's onFileChangeListener
         */
        prjApp.post("/api/project/import", function(req, res) {
            try {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

                const projectData = req.body;

                // Basic validation
                if (!projectData || typeof projectData !== 'object') {
                    res.status(400).json({error:"invalid_data", message: "Project data is required and must be a valid JSON object"});
                    runtime.logger.error("api post project/import: Invalid project data");
                    return;
                }

                // Verify project structure (same as client's verifyProject)
                const verification = runtime.project.verifyProject(projectData);
                if (!verification.valid) {
                    res.status(400).json({
                        error:"invalid_project_format",
                        message: verification.error || "Project format is invalid"
                    });
                    runtime.logger.error("api post project/import: " + verification.error);
                    return;
                }

                runtime.logger.info(`api post project/import: Starting import of project '${projectData.name || 'Unnamed'}'`);

                // Import the project (same as client's setProject -> save -> storage.setServerProject)
                runtime.project.setProject(projectData).then(function(data) {
                    runtime.logger.info("api post project/import: Project imported to storage, restarting runtime...");

                    // Restart runtime to apply changes (same as client's flow)
                    runtime.restart(true).then(function(result) {
                        res.json({
                            success: true,
                            message: "Project imported successfully",
                            projectName: projectData.name || "Unnamed"
                        });
                        runtime.logger.info(`api post project/import: Successfully imported and reloaded project '${projectData.name || 'Unnamed'}'`);
                    }).catch(function(err) {
                        res.status(500).json({
                            error:"restart_error",
                            message: "Project imported but failed to restart runtime: " + (err.message || err)
                        });
                        runtime.logger.error("api post project/import restart: " + (err.message || err));
                    });
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error: err.code, message: err.message});
                        runtime.logger.error("api post project/import setProject: " + err.message);
                    } else {
                        res.status(400).json({error:"import_error", message: err.message || err});
                        runtime.logger.error("api post project/import setProject: " + (err.message || err));
                    }
                });
            } catch(err) {
                if (err && err.message) {
                    res.status(400).json({error:"import_error", message: err.message});
                    runtime.logger.error("api post project/import: " + err.message);
                } else {
                    res.status(400).json({error:"unexpected_error", message: err});
                    runtime.logger.error("api post project/import: " + err);
                }
            }
        });

        /**
         * POST Import single view
         * Import a single view to the project
         * Public API - No authentication required
         * Follows the same logic as client's onViewFileChangeListener
         * Supports two formats:
         * 1. Direct view data: { id, name, svgcontent, ... }
         * 2. Wrapped format: { cmd: "import-view", data: { id, name, svgcontent, ... } }
         */
        prjApp.post("/api/project/import-view", function(req, res) {
            try {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

                // Support both direct view data and wrapped format {cmd, data}
                let viewData = req.body;
                let newName = req.body._newName; // Optional: custom name for the view

                // Check if body is in wrapped format {cmd, data}
                if (req.body.cmd === 'import-view' && req.body.data) {
                    viewData = req.body.data;
                    newName = req.body.data._newName || newName;
                }

                // Basic validation
                if (!viewData || typeof viewData !== 'object') {
                    res.status(400).json({error:"invalid_data", message: "View data is required and must be a valid JSON object"});
                    runtime.logger.error("api post project/import-view: Invalid view data");
                    return;
                }

                // Remove the optional _newName parameter from view data if exists
                const cleanViewData = JSON.parse(JSON.stringify(viewData));
                delete cleanViewData._newName;
                delete cleanViewData.cmd;

                // Verify view structure (same as client's verifyView)
                const verification = runtime.project.verifyView(cleanViewData);
                if (!verification.valid) {
                    res.status(400).json({
                        error:"invalid_view_format",
                        message: verification.error || "View format is invalid"
                    });
                    runtime.logger.error("api post project/import-view: " + verification.error);
                    return;
                }

                runtime.logger.info(`api post project/import-view: Starting import of view '${cleanViewData.name || 'Unnamed'}'`);

                // Import the view (handles name conflicts and ID generation)
                const importedView = runtime.project.importView(cleanViewData, newName);

                // Save the imported view to storage
                runtime.project.setProjectData(runtime.project.ProjectDataCmdType.SetView, importedView).then(() => {
                    res.json({
                        success: true,
                        message: "View imported successfully",
                        view: {
                            id: importedView.id,
                            name: importedView.name,
                            type: importedView.type
                        }
                    });
                    runtime.logger.info(`api post project/import-view: Successfully imported view '${importedView.name}'`);
                }).catch(function(err) {
                    if (err && err.code) {
                        res.status(400).json({error: err.code, message: err.message});
                        runtime.logger.error("api post project/import-view save: " + err.message);
                    } else {
                        res.status(400).json({error:"save_error", message: err.message || err});
                        runtime.logger.error("api post project/import-view save: " + (err.message || err));
                    }
                });
            } catch(err) {
                if (err && err.message) {
                    res.status(400).json({error:"import_error", message: err.message});
                    runtime.logger.error("api post project/import-view: " + err.message);
                } else {
                    res.status(400).json({error:"unexpected_error", message: err});
                    runtime.logger.error("api post project/import-view: " + err);
                }
            }
        });

        /**
         * POST Upload file resource
         * images will be in media file saved
         */
        prjApp.post('/api/upload', function (req, res) {
            const file = req.body.resource;
            const destination = req.body.destination;
            try {
                let basedata = file.data;
                let encoding = {};
                // let basedata = file.data.replace(/^data:.*,/, '');
                // let basedata = file.data.replace(/^data:image\/png;base64,/, "");
                let fileName = file.name.replace(new RegExp('../', 'g'), '');
                let fullPath = file.fullPath || file.name;
                fullPath = fullPath.replace(/(\.\.[/\\])/g, '');
                fullPath = path.normalize(fullPath).replace(/^(\.\.[/\\])+/, '');

                if (file.type !== 'svg') {
                    basedata = file.data.replace(/^data:.*,/, '');
                    encoding = {encoding: 'base64'};
                }
                let filePath = path.join(runtime.settings.uploadFileDir, fullPath || fileName);
                let locationPath = (fullPath || fileName);

                if (destination) {
                    let destinationDir = path.resolve(runtime.settings.appDir, `_${destination}`);
                    if (process.versions.electron) {
                        const userDataDir = process.env.userDir || path.join(os.homedir(), '.fuxa');
                        destinationDir = path.join(userDataDir, `_${destination}`);
                    }
                    filePath = path.join(destinationDir, fullPath || fileName);
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    // Use _destination path for destination uploads
                    locationPath = `_${destination}/${(fullPath || fileName)}`;
                }
                fs.writeFileSync(filePath, basedata, encoding);
                // Return appropriate path based on whether destination is used
                let result = destination
                    ? {'location': '/' + locationPath }
                    : {'location': '/' + runtime.settings.httpUploadFileStatic + '/' + locationPath };
                res.json(result);
            } catch (err) {
                if (err && err.code) {
                    res.status(400).json({error: err.code, message: err.message});
                    runtime.logger.error("api upload: " + err.message);
                } else {
                    res.status(400).json({error:"unexpected_error", message: err});
                    runtime.logger.error("api upload: " + err);
                }
            }
        });

        return prjApp;
    }
}