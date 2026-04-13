import type { CodeboltMessage, CodeboltInstance, IDispatcher } from '../types.js';

/**
 * Abstract base class for dispatching CodeboltMessages to codebolt.notify.*.
 *
 * Subclasses implement `dispatch()` to map each message type to the
 * appropriate codebolt notification call.
 */
export abstract class BaseDispatcher implements IDispatcher {
    abstract dispatch(message: CodeboltMessage, codebolt: CodeboltInstance): void;
}
