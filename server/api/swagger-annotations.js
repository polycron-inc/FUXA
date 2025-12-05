/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and session management
 *   - name: Users
 *     description: User and role management
 *   - name: Project
 *     description: Project, views, and devices management
 *   - name: Alarms
 *     description: Alarm configuration and history
 *   - name: DAQ
 *     description: Data acquisition queries
 *   - name: Scripts
 *     description: Script management
 *   - name: Resources
 *     description: Resource file management
 *   - name: Plugins
 *     description: Plugin management
 *   - name: Diagnose
 *     description: System diagnostics
 *   - name: Command
 *     description: Command execution
 *   - name: Play Restrictions
 *     description: View access control
 */

/**
 * @swagger
 * /api/users/list:
 *   get:
 *     summary: Get user list (usernames only)
 *     description: Returns only usernames, no admin permission required. Used for permission selection.
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of usernames
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *       403:
 *         description: Token expired
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Get all users with details. Requires admin permission.
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 *   post:
 *     summary: Create or update user
 *     description: Create new user or update existing. Requires admin permission.
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               params:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User created/updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 *   delete:
 *     summary: Delete user
 *     description: Delete user by username. Requires admin permission.
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: param
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     description: Get all role configurations. Requires admin permission.
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 *   post:
 *     summary: Create or update roles
 *     description: Create or update role configurations. Requires admin permission.
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               params:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Roles saved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 *   delete:
 *     summary: Delete roles
 *     description: Delete role configurations. Requires admin permission.
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roles
 *         required: true
 *         schema:
 *           type: string
 *         description: JSON string of role IDs to delete
 *     responses:
 *       200:
 *         description: Roles deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 */

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Get project
 *     description: Get complete project data with permission filtering
 *     tags: [Project]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Project data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *   post:
 *     summary: Set project
 *     description: Save complete project data. Requires admin permission.
 *     tags: [Project]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project saved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 */

/**
 * @swagger
 * /api/projectData:
 *   post:
 *     summary: Set project data
 *     description: Save individual project component (view/device/alarm/etc). Requires admin permission.
 *     tags: [Project]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cmd:
 *                 type: string
 *                 description: Command type (set-view, del-view, set-device, etc)
 *                 enum:
 *                   - set-view
 *                   - add-view
 *                   - del-view
 *                   - set-device
 *                   - del-device
 *                   - set-alarm
 *                   - del-alarm
 *               data:
 *                 type: object
 *                 description: Data for the command
 *     responses:
 *       200:
 *         description: Data saved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get server settings
 *     description: Get server configuration (secretCode excluded)
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Server settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: number
 *                 language:
 *                   type: string
 *                 uiPort:
 *                   type: integer
 *                 secureEnabled:
 *                   type: boolean
 *                 playRestrictionEnabled:
 *                   type: boolean
 *       404:
 *         description: Settings not found
 *   post:
 *     summary: Update server settings
 *     description: Update server configuration. Requires admin permission.
 *     tags: [Project]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Token expired
 */

/**
 * @swagger
 * /api/heartbeat:
 *   post:
 *     summary: Token heartbeat
 *     description: Keep session alive and refresh token if needed
 *     tags: [Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               params:
 *                 type: boolean
 *                 description: Set to true to request token refresh
 *     responses:
 *       200:
 *         description: Heartbeat successful, may include refreshed token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       403:
 *         description: Token expired
 */

module.exports = {};
