import { afterEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';

const mockUseAuth = vi.fn();

afterEach(() => {
  vi.unstubAllGlobals();
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Routing, Auth & Visitor Demo UI', () => {
  it('redirects unauthenticated users from protected route to /login', () => {
    mockUseAuth.mockReturnValue({ currentUser: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Studio</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
  });

  it('shows a loading state while authentication is being checked', () => {
    mockUseAuth.mockReturnValue({ currentUser: null, loading: true });

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Secret Studio</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Secret Studio')).not.toBeInTheDocument();
  });

  it('renders the protected content for an authenticated user', () => {
    mockUseAuth.mockReturnValue({ currentUser: { uid: 'user-1' }, loading: false });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret Studio</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Studio')).toBeInTheDocument();
  });

  it('allows visitors on LandingPage to toggle between Table and JSON preview', () => {
    mockUseAuth.mockReturnValue({ currentUser: null, loading: false });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Instant Visitor Demo/i)).toBeInTheDocument();
    const demoSection = screen.getByRole('heading', { name: /Instant Visitor Demo/i }).closest('section');
    fireEvent.click(within(demoSection).getByRole('button', { name: 'JSON' }));
    expect(within(demoSection).getByText(/"mpesa_code":/i)).toBeInTheDocument();

    fireEvent.click(within(demoSection).getByRole('button', { name: 'Table' }));
    expect(within(demoSection).getByRole('table')).toBeInTheDocument();
    fireEvent.click(within(demoSection).getByRole('button', { name: 'Regenerate' }));
    expect(within(demoSection).getAllByRole('row')).toHaveLength(5);
  });

  it('copies the visitor demo JSON and shows copied feedback', () => {
    mockUseAuth.mockReturnValue({ currentUser: null, loading: false });
    const writeText = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy JSON' }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"mpesa_code"'));
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('renders LoginPage form and allows typing credentials', () => {
    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Developer Email/i);
    fireEvent.change(emailInput, { target: { value: 'dev@safedatabox.co.ke' } });
    expect(emailInput.value).toBe('dev@safedatabox.co.ke');
  });

  it('shows a useful Firebase error when email sign-in fails', async () => {
    mockUseAuth.mockReturnValue({
      login: vi.fn().mockRejectedValue({ code: 'auth/invalid-credential' }),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Developer Email/i), {
      target: { value: 'dev@safedatabox.co.ke' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'incorrect-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    });
  });

  it('navigates to the dashboard after email sign-in succeeds', async () => {
    mockUseAuth.mockReturnValue({
      login: vi.fn().mockResolvedValue({}),
      loginWithGoogle: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Developer Email/i), {
      target: { value: 'dev@safedatabox.co.ke' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'valid-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Dashboard Screen')).toBeInTheDocument();
  });

  it('navigates to the dashboard after Google sign-in succeeds', async () => {
    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      loginWithGoogle: vi.fn().mockResolvedValue({}),
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(await screen.findByText('Dashboard Screen')).toBeInTheDocument();
  });

  it('shows a Firebase error when Google sign-in fails', async () => {
    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      loginWithGoogle: vi.fn().mockRejectedValue({ code: 'auth/popup-blocked' }),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    });
  });
});
