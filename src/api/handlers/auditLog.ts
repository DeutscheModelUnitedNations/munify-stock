import { abilityBuilder } from '$api/rumble';
import { basics } from './basics';

const { ref } = basics('auditLog');

// Admins and members with key positions can read audit logs
abilityBuilder.auditLog.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

// Audit logs are read-only - no mutations exposed

export { ref as AuditLogRef };
