import { describe, expect, it } from 'vitest';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseErrors';

describe('Firebase authentication error messages', () => {
  it.each([
    ['auth/email-already-in-use', 'An account already exists with this email address.'],
    ['auth/invalid-email', 'Enter a valid email address.'],
    ['auth/user-not-found', 'Incorrect email or password.'],
    ['auth/wrong-password', 'Incorrect email or password.'],
    ['auth/invalid-credential', 'Incorrect email or password.'],
    ['auth/invalid-login-credentials', 'Incorrect email or password.'],
    ['auth/weak-password', 'Password must be at least 6 characters long.'],
    ['auth/popup-closed-by-user', 'Google sign-in was cancelled.'],
    ['auth/cancelled-popup-request', 'Google sign-in was cancelled.'],
    [
      'auth/popup-blocked',
      'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
    ],
    [
      'auth/network-request-failed',
      'Unable to reach Firebase. Check your internet connection and try again.',
    ],
    ['auth/too-many-requests', 'Too many attempts. Wait a moment and try again.'],
    ['auth/user-disabled', 'This account has been disabled.'],
    ['auth/operation-not-allowed', 'This sign-in method is not enabled in Firebase.'],
    ['auth/unauthorized-domain', 'This domain is not authorized for Firebase authentication.'],
    ['auth/invalid-api-key', 'Firebase configuration is invalid. Check the API key.'],
    [
      'auth/api-key-not-valid.-please-pass-a-valid-api-key.',
      'Firebase configuration is invalid. Check the API key.',
    ],
  ])('maps %s to a helpful message', (code, expectedMessage) => {
    expect(getFirebaseAuthErrorMessage({ code })).toBe(expectedMessage);
  });

  it('uses the Firebase message for unknown codes', () => {
    expect(getFirebaseAuthErrorMessage({ code: 'auth/unknown', message: 'Unexpected failure' }))
      .toBe('Unexpected failure');
  });

  it('uses the provided fallback when no Firebase message exists', () => {
    expect(getFirebaseAuthErrorMessage({}, 'Please try again.')).toBe('Please try again.');
  });

  it('uses the default fallback for a missing error', () => {
    expect(getFirebaseAuthErrorMessage(null)).toBe('Authentication failed. Please try again.');
  });
});
