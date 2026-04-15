import { abilityBuilder } from '$api/rumble';
import { basics } from './basics';

const { ref } = basics('user');

abilityBuilder.user.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

export { ref as UserRef };
