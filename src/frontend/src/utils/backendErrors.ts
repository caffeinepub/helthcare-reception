import { Error_ } from '@/backend';

export interface BackendErrorInfo {
  message: string;
  actions: ('retry' | 'login' | 'onboarding')[];
}

/**
 * Maps backend error codes to user-friendly English messages and recommended actions
 */
export function mapBackendError(error: Error_): BackendErrorInfo {
  switch (error) {
    case Error_.profileNotFound:
      return {
        message: 'Your profile could not be found. Please log in again to continue.',
        actions: ['login', 'retry'],
      };
    case Error_.roleNotSet:
      return {
        message: 'Your account role is not set. Please complete the onboarding process.',
        actions: ['onboarding'],
      };
    case Error_.noApplicationFound:
      return {
        message: 'No application found. You can create one by submitting your information.',
        actions: ['retry'],
      };
    case Error_.unauthorized:
      return {
        message: 'Your session has expired or you need to log in to continue.',
        actions: ['login'],
      };
    case Error_.invalidCredentials:
      return {
        message: 'Invalid email or password. Please try again.',
        actions: ['retry'],
      };
    case Error_.alreadyRegistered:
      return {
        message: 'This email is already registered. Please log in instead.',
        actions: ['login'],
      };
    case Error_.roleAlreadySet:
      return {
        message: 'Your role has already been set and cannot be changed.',
        actions: ['retry'],
      };
    case Error_.recruiterCannotApply:
      return {
        message: 'Recruiters cannot submit job applications.',
        actions: [],
      };
    case Error_.jobSeekerCannotSearch:
      return {
        message: 'Job seekers cannot search for applicants.',
        actions: [],
      };
    default:
      return {
        message: 'An unexpected error occurred. Please try again.',
        actions: ['retry'],
      };
  }
}

/**
 * Checks if a value is a backend error Result
 */
export function isErrorResult<T>(result: { __kind__: string }): result is { __kind__: 'err'; err: Error_ } {
  return result.__kind__ === 'err';
}

/**
 * Extracts data from an ok Result or throws a mapped error
 */
export function unwrapResult<T>(result: { __kind__: 'ok'; ok: T } | { __kind__: 'err'; err: Error_ }): T {
  if (isErrorResult(result)) {
    const errorInfo = mapBackendError(result.err);
    throw new Error(errorInfo.message);
  }
  return result.ok;
}
