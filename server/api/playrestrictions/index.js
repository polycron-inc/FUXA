/**
 * 'api/playrestrictions': Play Restrictions API to manage view access control
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
        var prApp = express();
        prApp.use(function(req,res,next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        /**
         * @swagger
         * /api/playrestrictions:
         *   get:
         *     summary: Get play restrictions
         *     description: Retrieve all play restrictions or filter by view ID. Requires admin authentication.
         *     tags: [Play Restrictions]
         *     security:
         *       - apiKeyAuth: []
         *     parameters:
         *       - in: query
         *         name: viewId
         *         schema:
         *           type: string
         *         required: false
         *         description: Filter restrictions by view ID
         *         example: v_12345
         *     responses:
         *       200:
         *         description: List of play restrictions
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/PlayRestriction'
         *       401:
         *         description: Unauthorized - Admin permission required
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       403:
         *         description: Token expired
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        prApp.get("/api/playrestrictions", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api get playrestrictions: Token Expired");
            } else if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                runtime.logger.error("api get playrestrictions: Unauthorized");
            } else {
                const viewId = req.query.viewId;
                runtime.project.getPlayRestrictions(viewId).then(result => {
                    res.json(result);
                }).catch(function(err) {
                    res.status(400).json({error:"unexpected_error", message: err.message || err});
                    runtime.logger.error("api get playrestrictions: " + (err.message || err));
                });
            }
        });

        /**
         * @swagger
         * /api/playrestrictions:
         *   post:
         *     summary: Create or update play restriction
         *     description: Create a new play restriction or update existing one. Requires admin authentication.
         *     tags: [Play Restrictions]
         *     security:
         *       - apiKeyAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/PlayRestrictionInput'
         *           examples:
         *             userRestriction:
         *               summary: User-based restriction
         *               value:
         *                 type: user
         *                 view_id: v_12345
         *                 user_id: john
         *                 role_id: null
         *             roleRestriction:
         *               summary: Role-based restriction
         *               value:
         *                 type: role
         *                 view_id: v_67890
         *                 user_id: null
         *                 role_id: operators
         *     responses:
         *       200:
         *         description: Restriction created/updated successfully
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/IdResponse'
         *       400:
         *         description: Bad request
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       401:
         *         description: Unauthorized - Admin permission required
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       403:
         *         description: Token expired
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        prApp.post("/api/playrestrictions", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api post playrestrictions: Token Expired");
            } else if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                runtime.logger.error("api post playrestrictions: Unauthorized");
            } else {
                // 支援批次建立：如果 req.body 是陣列，則批次處理
                if (Array.isArray(req.body)) {
                    const restrictions = req.body.map(item => ({
                        id: item.id,
                        type: item.type,
                        view_id: item.view_id,
                        user_id: item.user_id,
                        role_id: item.role_id,
                        creator: req.userId || 'admin'
                    }));

                    Promise.all(restrictions.map(r => runtime.project.setPlayRestriction(r)))
                        .then(results => {
                            res.json({ success: true, results });
                        })
                        .catch(function(err) {
                            res.status(400).json({error:"unexpected_error", message: err.message || err});
                            runtime.logger.error("api post playrestrictions batch: " + (err.message || err));
                        });
                } else {
                    // 單一建立
                    const restriction = {
                        id: req.body.id,
                        type: req.body.type,
                        view_id: req.body.view_id,
                        user_id: req.body.user_id,
                        role_id: req.body.role_id,
                        creator: req.userId || 'admin'
                    };
                    runtime.project.setPlayRestriction(restriction).then(result => {
                        res.json(result);
                    }).catch(function(err) {
                        res.status(400).json({error:"unexpected_error", message: err.message || err});
                        runtime.logger.error("api post playrestrictions: " + (err.message || err));
                    });
                }
            }
        });

        /**
         * @swagger
         * /api/playrestrictions/{id}:
         *   delete:
         *     summary: Delete play restriction
         *     description: Delete a play restriction by ID. Requires admin authentication.
         *     tags: [Play Restrictions]
         *     security:
         *       - apiKeyAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: Restriction ID
         *         example: 1
         *     responses:
         *       200:
         *         description: Restriction deleted successfully
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Success'
         *       400:
         *         description: Bad request
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       401:
         *         description: Unauthorized - Admin permission required
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       403:
         *         description: Token expired
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        prApp.delete("/api/playrestrictions/:id", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            if (res.statusCode === 403) {
                runtime.logger.error("api delete playrestrictions: Token Expired");
            } else if (!authJwt.haveAdminPermission(permission)) {
                res.status(401).json({error:"unauthorized_error", message: "Unauthorized!"});
                runtime.logger.error("api delete playrestrictions: Unauthorized");
            } else {
                const id = req.params.id;
                runtime.project.deletePlayRestriction(id).then(result => {
                    res.json({success: true});
                }).catch(function(err) {
                    res.status(400).json({error:"unexpected_error", message: err.message || err});
                    runtime.logger.error("api delete playrestrictions: " + (err.message || err));
                });
            }
        });

        /**
         * @swagger
         * /api/playrestrictions/allowed-views:
         *   get:
         *     summary: Get allowed views for current user
         *     description: Returns list of view IDs that the current user can access based on play restrictions
         *     tags: [Play Restrictions]
         *     security:
         *       - apiKeyAuth: []
         *     responses:
         *       200:
         *         description: List of allowed view IDs
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/AllowedViews'
         *             example:
         *               allowed: true
         *               views: ["v_12345", "v_67890", "v_11111"]
         *       400:
         *         description: Bad request
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        prApp.get("/api/playrestrictions/allowed-views", secureFnc, function(req, res) {
            const permission = checkGroupsFnc(req);
            runtime.project.getAllowedViewsForUser(req.userId, permission).then(result => {
                res.json(result);
            }).catch(function(err) {
                res.status(400).json({error:"unexpected_error", message: err.message || err});
                runtime.logger.error("api get allowed-views: " + (err.message || err));
            });
        });

        return prApp;
    }
};
