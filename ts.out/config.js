"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STAGE = exports.SSM_PREFIX = void 0;
/**
 * /cdk-ecs-fargate/vpc-id
 *
 * ecs-fargate-cluster:
 *   /cdk-ecs-fargate/cluster-capacityprovider-name
 *   /cdk-ecs-fargate/cluster-securitygroup-id
 *
 * iam-role:
 *   /cdk-ecs-fargate/task-execution-role-arn
 *   /cdk-ecs-fargate/default-task-role-arn
 *
 */
exports.SSM_PREFIX = '/cdk-ecs-fargate';
exports.DEFAULT_STAGE = 'dev';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7Ozs7Ozs7OztHQVdHO0FBQ1UsUUFBQSxVQUFVLEdBQUcsa0JBQWtCLENBQUM7QUFHaEMsUUFBQSxhQUFhLEdBQUcsS0FBSyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcblxuLyoqXG4gKiAvY2RrLWVjcy1mYXJnYXRlL3ZwYy1pZFxuICogXG4gKiBlY3MtZmFyZ2F0ZS1jbHVzdGVyOlxuICogICAvY2RrLWVjcy1mYXJnYXRlL2NsdXN0ZXItY2FwYWNpdHlwcm92aWRlci1uYW1lXG4gKiAgIC9jZGstZWNzLWZhcmdhdGUvY2x1c3Rlci1zZWN1cml0eWdyb3VwLWlkXG4gKiBcbiAqIGlhbS1yb2xlOlxuICogICAvY2RrLWVjcy1mYXJnYXRlL3Rhc2stZXhlY3V0aW9uLXJvbGUtYXJuXG4gKiAgIC9jZGstZWNzLWZhcmdhdGUvZGVmYXVsdC10YXNrLXJvbGUtYXJuXG4gKiBcbiAqL1xuZXhwb3J0IGNvbnN0IFNTTV9QUkVGSVggPSAnL2Nkay1lY3MtZmFyZ2F0ZSc7XG5cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU1RBR0UgPSAnZGV2JztcblxuZXhwb3J0IGludGVyZmFjZSBTdGFja0NvbW1vblByb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAgIHN0YWdlOiBzdHJpbmc7XG59Il19