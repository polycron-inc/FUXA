/**
 * 'api/userpreferences': User Preferences API to manage DMS user settings
 */

var express = require("express");

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
        var upApp = express();
        upApp.use(function(req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        /**
         * @swagger
         * /api/userpreferences/{dmsUserId}:
         *   get:
         *     summary: Get user preference
         *     description: Retrieve user preference by DMS user ID
         *     tags: [User Preferences]
         *     parameters:
         *       - in: path
         *         name: dmsUserId
         *         required: true
         *         schema:
         *           type: string
         *         description: DMS user ID
         *     responses:
         *       200:
         *         description: User preference object
         *       404:
         *         description: User preference not found
         */
        upApp.get("/api/userpreferences/:dmsUserId", function(req, res) {
            const dmsUserId = req.params.dmsUserId;
            runtime.project.getUserPreference(dmsUserId).then(result => {
                if (result) {
                    // Parse preferences JSON if exists
                    if (result.preferences) {
                        try {
                            result.preferences = JSON.parse(result.preferences);
                        } catch (e) {
                            result.preferences = {};
                        }
                    }
                    res.json(result);
                } else {
                    res.status(404).json({ error: "not_found", message: "User preference not found" });
                }
            }).catch(function(err) {
                res.status(400).json({ error: "unexpected_error", message: err.message || err });
                runtime.logger.error("api get userpreferences: " + (err.message || err));
            });
        });

        /**
         * @swagger
         * /api/userpreferences:
         *   post:
         *     summary: Create or update user preference
         *     description: Set user preference (upsert by dms_user_id)
         *     tags: [User Preferences]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - dms_user_id
         *             properties:
         *               dms_user_id:
         *                 type: string
         *               start_view_id:
         *                 type: string
         *               preferences:
         *                 type: object
         *     responses:
         *       200:
         *         description: User preference saved successfully
         *       400:
         *         description: Bad request
         */
        upApp.post("/api/userpreferences", function(req, res) {
            const preference = {
                dms_user_id: req.body.dms_user_id,
                start_view_id: req.body.start_view_id,
                preferences: req.body.preferences
            };

            if (!preference.dms_user_id) {
                res.status(400).json({ error: "bad_request", message: "dms_user_id is required" });
                return;
            }

            runtime.project.setUserPreference(preference).then(result => {
                res.json(result);
            }).catch(function(err) {
                res.status(400).json({ error: "unexpected_error", message: err.message || err });
                runtime.logger.error("api post userpreferences: " + (err.message || err));
            });
        });

        /**
         * @swagger
         * /api/userpreferences/{dmsUserId}:
         *   delete:
         *     summary: Delete user preference
         *     description: Delete user preference by DMS user ID
         *     tags: [User Preferences]
         *     parameters:
         *       - in: path
         *         name: dmsUserId
         *         required: true
         *         schema:
         *           type: string
         *         description: DMS user ID
         *     responses:
         *       200:
         *         description: User preference deleted successfully
         *       400:
         *         description: Bad request
         */
        upApp.delete("/api/userpreferences/:dmsUserId", function(req, res) {
            const dmsUserId = req.params.dmsUserId;
            runtime.project.deleteUserPreference(dmsUserId).then(() => {
                res.json({ success: true });
            }).catch(function(err) {
                res.status(400).json({ error: "unexpected_error", message: err.message || err });
                runtime.logger.error("api delete userpreferences: " + (err.message || err));
            });
        });

        return upApp;
    }
};
