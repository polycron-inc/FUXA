/**
 * 'api/auth': Authentication API to Sign In/Out users
 */

var express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authJwt = require('../jwt-helper');

var runtime;
var secretCode;
var tokenExpiresIn;

module.exports = {
    init: function (_runtime, _secretCode, _tokenExpires) {
        runtime = _runtime;
        secretCode = _secretCode;
        tokenExpiresIn = _tokenExpires;
    },
    app: function () {
        var authApp = express();
        authApp.use(function (req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

        /**
         * @swagger
         * /api/signin:
         *   post:
         *     summary: User sign in
         *     description: Authenticate user with username and password, returns JWT token
         *     tags: [Authentication]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - username
         *               - password
         *             properties:
         *               username:
         *                 type: string
         *                 description: Username
         *                 example: admin
         *               password:
         *                 type: string
         *                 format: password
         *                 description: User password
         *                 example: admin
         *     responses:
         *       200:
         *         description: Login successful
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: success
         *                 message:
         *                   type: string
         *                   example: user found!!!
         *                 data:
         *                   type: object
         *                   properties:
         *                     username:
         *                       type: string
         *                       example: admin
         *                     fullname:
         *                       type: string
         *                       example: Administrator
         *                     groups:
         *                       type: integer
         *                       description: User permission groups
         *                       example: 255
         *                     info:
         *                       type: object
         *                       description: Additional user information including roles
         *                     token:
         *                       type: string
         *                       description: JWT authentication token
         *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
         *       401:
         *         description: Invalid credentials
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: error
         *                 message:
         *                   type: string
         *                   example: Invalid email/password!!!
         *                 data:
         *                   type: null
         *       404:
         *         description: User not found
         */
        authApp.post('/api/signin', function (req, res, next) {
            runtime.users.findOne(req.body).then(function (userInfo) {
                if (userInfo && userInfo.length && userInfo[0].password) {
                    if (bcrypt.compareSync(req.body.password, userInfo[0].password)) {
                        const token = jwt.sign({ id: userInfo[0].username, groups: userInfo[0].groups }, secretCode, { expiresIn: tokenExpiresIn });//'1h' });
                        res.json({
                            status: 'success',
                            message: 'user found!!!',
                            data: {
                                username: userInfo[0].username,
                                fullname: userInfo[0].fullname,
                                groups: userInfo[0].groups,
                                info: userInfo[0].info,
                                token: token
                            }
                        });
                        runtime.logger.info('api-signin: ' + userInfo[0].username + ' ' + userInfo[0].fullname + ' ' + userInfo[0].groups);
                    } else {
                        res.status(401).json({ status: 'error', message: 'Invalid email/password!!!', data: null });
                        runtime.logger.error('api post signin: Invalid email/password!!!');
                    }
                } else {
                    res.status(404).end();
                    runtime.logger.error('api post signin: Not Found!');
                }
            }).catch(function (err) {
                if (err.code) {
                    res.status(400).json({error:err.code, message: err.message});
                } else {
                    res.status(400).json({error:'unexpected_error', message:err.toString()});
                }
                runtime.logger.error('api post signin: ' + err.message);
            });
        });

        return authApp;
    }
}