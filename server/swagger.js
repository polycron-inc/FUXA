/**
 * Swagger API Documentation Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FUXA API Documentation',
      version: '1.2.6',
      description: 'Web-based Process Visualization (SCADA/HMI/Dashboard) API Documentation',
      contact: {
        name: 'Frangoteam',
        email: 'info@frangoteam.org',
        url: 'https://github.com/frangoteam/FUXA'
      },
      license: {
        name: 'MIT',
        url: 'https://github.com/frangoteam/FUXA/blob/master/LICENSE'
      }
    },
    servers: [
      {
        url: 'http://localhost:1881',
        description: 'Development server'
      },
      {
        url: 'http://localhost:{port}',
        description: 'Custom port server',
        variables: {
          port: {
            default: '1881',
            description: 'Server port number'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/signin'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-access-token',
          description: 'JWT token in x-access-token header'
        }
      },
      schemas: {
        DmsUser: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: '6e01b808-6841-11f0-94bb-5254008c2c02'
            },
            username: {
              type: 'string',
              description: 'Username',
              example: 'testUser'
            },
            roleId: {
              type: 'string',
              description: 'Role ID',
              example: 'fb509ca6-7bf0-11ea-b5b2-0a002700000e'
            },
            roleName: {
              type: 'string',
              description: 'Role name',
              example: 'Administrator'
            },
            phone: {
              type: 'string',
              description: 'Phone number',
              example: '15862589286'
            },
            email: {
              type: 'string',
              description: 'Email address',
              example: 'user@example.com'
            },
            createTime: {
              type: 'string',
              description: 'Creation date',
              example: '2025-07-24'
            },
            status: {
              type: 'integer',
              description: 'User status (0=inactive, 1=active)',
              example: 1
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Unique username',
              example: 'john'
            },
            fullname: {
              type: 'string',
              description: 'Full name',
              example: 'John Doe'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (hashed in storage)',
              example: 'password123'
            },
            groups: {
              type: 'integer',
              description: 'Permission groups (-1/255=admin)',
              example: 1
            },
            info: {
              type: 'object',
              properties: {
                roles: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Role IDs when userRole mode enabled'
                }
              }
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Role ID',
              example: 'operators'
            },
            name: {
              type: 'string',
              description: 'Role name',
              example: 'Operators'
            },
            permissions: {
              type: 'object',
              description: 'Role permissions configuration'
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            server: {
              type: 'object',
              description: 'FUXA server configuration'
            },
            hmi: {
              type: 'object',
              properties: {
                views: {
                  type: 'array',
                  items: {
                    type: 'object'
                  },
                  description: 'HMI views'
                },
                layout: {
                  type: 'object',
                  description: 'HMI layout configuration'
                }
              }
            },
            devices: {
              type: 'object',
              description: 'Device configurations'
            },
            alarms: {
              type: 'array',
              description: 'Alarm configurations'
            }
          }
        },
        View: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'View ID',
              example: 'v_12345'
            },
            name: {
              type: 'string',
              description: 'View name',
              example: 'Main Dashboard'
            },
            type: {
              type: 'string',
              description: 'View type',
              example: 'svg'
            },
            svgcontent: {
              type: 'string',
              description: 'SVG content'
            },
            items: {
              type: 'object',
              description: 'View items/controls'
            },
            property: {
              type: 'object',
              description: 'View properties'
            },
            visibility_scope: {
              type: 'string',
              enum: ['global', 'role', 'user', 'owner'],
              description: 'Visibility scope: global (all users), role (specific roles), user (specific users), owner (creator only)',
              default: 'global',
              example: 'global'
            }
          }
        },
        Alarm: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Alarm ID'
            },
            name: {
              type: 'string',
              description: 'Alarm name'
            },
            property: {
              type: 'object',
              description: 'Alarm properties including conditions and actions'
            }
          }
        },
        PlayRestriction: {
          type: 'object',
          required: ['type', 'view_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier (auto-generated)',
              example: 1
            },
            type: {
              type: 'string',
              enum: ['user', 'role'],
              description: 'Type of restriction',
              example: 'user'
            },
            view_id: {
              type: 'string',
              description: 'ID of the view to restrict',
              example: 'v_12345'
            },
            user_id: {
              type: 'string',
              description: 'User ID (required when type is "user")',
              example: 'john',
              nullable: true
            },
            role_id: {
              type: 'string',
              description: 'Role ID (required when type is "role")',
              example: 'operators',
              nullable: true
            },
            creator: {
              type: 'string',
              description: 'Username who created this restriction',
              example: 'admin'
            },
            created_at: {
              type: 'integer',
              description: 'Timestamp when created (milliseconds)',
              example: 1234567890000
            },
            updated_at: {
              type: 'integer',
              description: 'Timestamp when last updated (milliseconds)',
              example: 1234567890000
            }
          }
        },
        PlayRestrictionInput: {
          type: 'object',
          required: ['type', 'view_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'Optional: Include to update existing restriction',
              example: 1
            },
            type: {
              type: 'string',
              enum: ['user', 'role'],
              description: 'Type of restriction',
              example: 'user'
            },
            view_id: {
              type: 'string',
              description: 'ID of the view to restrict',
              example: 'v_12345'
            },
            user_id: {
              type: 'string',
              description: 'User ID (required when type is "user")',
              example: 'john',
              nullable: true
            },
            role_id: {
              type: 'string',
              description: 'Role ID (required when type is "role")',
              example: 'operators',
              nullable: true
            }
          }
        },
        AllowedViews: {
          type: 'object',
          properties: {
            allowed: {
              type: 'boolean',
              description: 'Whether user has access',
              example: true
            },
            views: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of view IDs the user can access',
              example: ['v_12345', 'v_67890']
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error code',
              example: 'unauthorized_error'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Unauthorized!'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            }
          }
        },
        IdResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID of created/updated resource',
              example: 1
            }
          }
        }
      }
    },
    security: [
      {
        apiKeyAuth: []
      }
    ],
    tags: [
      {
        name: 'Play Restrictions',
        description: 'View access control and restrictions management'
      },
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Project',
        description: 'Project and view management'
      },
      {
        name: 'Users',
        description: 'User and role management'
      },
      {
        name: 'DMS Users',
        description: 'DMS User management API (imported from fms-frontend)'
      }
    ]
  },
  // Path to the API docs (files containing JSDoc comments)
  apis: [
    './api/swagger-annotations.js',
    './api/playrestrictions/index.js',
    './api/dmsUser/index.js',
    './api/auth/index.js',
    './api/projects/index.js',
    './api/users/index.js',
    './api/alarms/index.js',
    './api/daq/index.js',
    './api/scripts/index.js',
    './api/resources/index.js',
    './api/plugins/index.js',
    './api/diagnose/index.js',
    './api/command/index.js',
    './api/index.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
