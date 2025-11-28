/**
 * 'api/defaultViewRestrictions': Default View Restrictions API
 * 管理使用者/角色進入網站時的預設播放 view
 */

var express = require("express");
const authJwt = require('../jwt-helper');

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
        var restrictionsApp = express();
        restrictionsApp.use(function(req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        /**
         * GET /api/defaultviewrestrictions
         * 取得所有預設 view 限制規則
         * Query params: type, user_id, role_id, enabled
         */
        restrictionsApp.get("/api/defaultviewrestrictions", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api get default view restrictions: Token Expired");
                return;
            }

            try {
                const filters = {};
                if (req.query.type) filters.type = req.query.type;
                if (req.query.user_id) filters.user_id = req.query.user_id;
                if (req.query.role_id) filters.role_id = req.query.role_id;
                if (req.query.enabled !== undefined) filters.enabled = req.query.enabled === 'true';

                runtime.project.getDefaultViewRestrictions(filters).then(result => {
                    res.json(result || []);
                }).catch(err => {
                    runtime.logger.error("api get default view restrictions: " + err.message);
                    res.status(400).json({ error: "get_restrictions_error", message: err.message });
                });
            } catch (err) {
                runtime.logger.error("api get default view restrictions: " + err.message);
                res.status(400).json({ error: "unexpected_error", message: err.message });
            }
        });

        /**
         * GET /api/defaultviewrestrictions/for-user
         * 取得指定使用者/角色的預設 view
         * Query params: user_id, role_id
         */
        restrictionsApp.get("/api/defaultviewrestrictions/for-user", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api get default view for user: Token Expired");
                return;
            }

            try {
                const userId = req.query.user_id;
                const roleId = req.query.role_id;

                runtime.project.getDefaultViewForUser(userId, roleId).then(result => {
                    if (result) {
                        res.json(result);
                    } else {
                        // 沒有找到特定限制，返回 null 表示使用系統預設
                        res.json(null);
                    }
                }).catch(err => {
                    runtime.logger.error("api get default view for user: " + err.message);
                    res.status(400).json({ error: "get_default_view_error", message: err.message });
                });
            } catch (err) {
                runtime.logger.error("api get default view for user: " + err.message);
                res.status(400).json({ error: "unexpected_error", message: err.message });
            }
        });

        /**
         * POST /api/defaultviewrestrictions
         * 新增或更新預設 view 限制規則
         * Body: { id?, type, user_id, role_id, default_view_id, priority, enabled }
         */
        restrictionsApp.post("/api/defaultviewrestrictions", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api post default view restriction: Token Expired");
                return;
            }

            if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({ error: "unauthorized_error", message: "Unauthorized!" });
                runtime.logger.error("api post default view restriction: Unauthorized");
                return;
            }

            try {
                const restriction = {
                    id: req.body.id || null,
                    type: req.body.type, // 'user', 'role', 'default'
                    user_id: req.body.user_id || null,
                    role_id: req.body.role_id || null,
                    default_view_id: req.body.default_view_id,
                    priority: req.body.priority || 0,
                    enabled: req.body.enabled !== undefined ? req.body.enabled : true,
                    creator: req.body.creator || (req.tokenPayload ? req.tokenPayload.username : 'system')
                };

                // 驗證必要欄位
                if (!restriction.type || !restriction.default_view_id) {
                    res.status(400).json({ error: "invalid_input", message: "type and default_view_id are required" });
                    return;
                }

                // 驗證 type
                if (!['user', 'role', 'default'].includes(restriction.type)) {
                    res.status(400).json({ error: "invalid_input", message: "type must be 'user', 'role', or 'default'" });
                    return;
                }

                // 如果 type 是 user，則 user_id 必填
                if (restriction.type === 'user' && !restriction.user_id) {
                    res.status(400).json({ error: "invalid_input", message: "user_id is required when type is 'user'" });
                    return;
                }

                // 如果 type 是 role，則 role_id 必填
                if (restriction.type === 'role' && !restriction.role_id) {
                    res.status(400).json({ error: "invalid_input", message: "role_id is required when type is 'role'" });
                    return;
                }

                runtime.project.setDefaultViewRestriction(restriction).then(result => {
                    res.json({ code: 200, status: 'SUCCESS', data: result });
                }).catch(err => {
                    runtime.logger.error("api post default view restriction: " + err.message);
                    res.status(400).json({ error: "set_restriction_error", message: err.message });
                });
            } catch (err) {
                runtime.logger.error("api post default view restriction: " + err.message);
                res.status(400).json({ error: "unexpected_error", message: err.message });
            }
        });

        /**
         * PUT /api/defaultviewrestrictions/:id
         * 更新預設 view 限制規則
         */
        restrictionsApp.put("/api/defaultviewrestrictions/:id", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            const restrictionId = parseInt(req.params.id);

            if (res.statusCode === 403) {
                runtime.logger.error("api put default view restriction: Token Expired");
                return;
            }

            if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({ error: "unauthorized_error", message: "Unauthorized!" });
                runtime.logger.error("api put default view restriction: Unauthorized");
                return;
            }

            if (isNaN(restrictionId)) {
                res.status(400).json({ error: "invalid_input", message: "Invalid restriction ID" });
                return;
            }

            try {
                const restriction = {
                    id: restrictionId,
                    type: req.body.type,
                    user_id: req.body.user_id || null,
                    role_id: req.body.role_id || null,
                    default_view_id: req.body.default_view_id,
                    priority: req.body.priority || 0,
                    enabled: req.body.enabled !== undefined ? req.body.enabled : true
                };

                // 驗證必要欄位
                if (!restriction.type || !restriction.default_view_id) {
                    res.status(400).json({ error: "invalid_input", message: "type and default_view_id are required" });
                    return;
                }

                runtime.project.setDefaultViewRestriction(restriction).then(result => {
                    res.json({ code: 200, status: 'SUCCESS', data: result });
                }).catch(err => {
                    runtime.logger.error("api put default view restriction: " + err.message);
                    res.status(400).json({ error: "update_restriction_error", message: err.message });
                });
            } catch (err) {
                runtime.logger.error("api put default view restriction: " + err.message);
                res.status(400).json({ error: "unexpected_error", message: err.message });
            }
        });

        /**
         * DELETE /api/defaultviewrestrictions/:id
         * 刪除預設 view 限制規則
         */
        restrictionsApp.delete("/api/defaultviewrestrictions/:id", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            const restrictionId = parseInt(req.params.id);

            if (res.statusCode === 403) {
                runtime.logger.error("api delete default view restriction: Token Expired");
                return;
            }

            if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({ error: "unauthorized_error", message: "Unauthorized!" });
                runtime.logger.error("api delete default view restriction: Unauthorized");
                return;
            }

            if (isNaN(restrictionId)) {
                res.status(400).json({ error: "invalid_input", message: "Invalid restriction ID" });
                return;
            }

            try {
                runtime.project.deleteDefaultViewRestriction(restrictionId).then(() => {
                    res.json({ code: 200, status: 'SUCCESS', message: 'Restriction deleted successfully' });
                }).catch(err => {
                    runtime.logger.error("api delete default view restriction: " + err.message);
                    res.status(400).json({ error: "delete_restriction_error", message: err.message });
                });
            } catch (err) {
                runtime.logger.error("api delete default view restriction: " + err.message);
                res.status(400).json({ error: "unexpected_error", message: err.message });
            }
        });

        return restrictionsApp;
    }
};
