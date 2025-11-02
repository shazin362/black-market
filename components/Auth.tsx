import React, { useState } from 'react';
import { User } from '../types';
import * as api from '../utils/api';
import { EyeIcon, EyeSlashIcon, UserIcon } from './Icons';

// --- Main Auth Component ---
interface AuthProps {
    onLoginSuccess: (token: string, username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'recover-step-1' | 'recover-step-2' | 'recover-step-3'>('login');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // State for recovery process
    const [recoveryUser, setRecoveryUser] = useState<User | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const handleModeChange = (newMode: 'login' | 'register' | 'recover-step-1') => {
        clearMessages();
        setMode(newMode);
    };
    
    return (
        <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            <div className="text-center">
                 <div className="inline-block p-3 bg-rose-100 dark:bg-rose-900/50 rounded-full mb-2">
                    <UserIcon className="w-8 h-8 text-rose-600 dark:text-rose-400"/>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {mode.startsWith('recover') ? 'Password Recovery' : 'Digital Debt Book'}
                </h1>
                <p className="text-sm text-gray-500">
                    {mode === 'login' && 'Sign in to access your records.'}
                    {mode === 'register' && 'Create a new account to get started.'}
                </p>
            </div>

            {error && <p className="text-sm text-center text-red-500 bg-red-100/50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
            {success && <p className="text-sm text-center text-green-500 bg-green-100/50 dark:bg-green-900/20 p-3 rounded-md">{success}</p>}

            {isLoading ? <div className="text-center">Loading...</div> : (
                <>
                    {mode === 'login' && <LoginForm onLoginSuccess={onLoginSuccess} setError={setError} setIsLoading={setIsLoading} onSwitchToRegister={() => handleModeChange('register')} onSwitchToRecover={() => handleModeChange('recover-step-1')} />}
                    {mode === 'register' && <RegisterForm onRegisterSuccess={onLoginSuccess} setError={setError} setIsLoading={setIsLoading} onSwitchToLogin={() => handleModeChange('login')} />}
                    
                    {mode === 'recover-step-1' && <RecoverStep1 setRecoveryUser={setRecoveryUser} setMode={setMode} setError={setError} setIsLoading={setIsLoading} onSwitchToLogin={() => handleModeChange('login')} />}
                    {mode === 'recover-step-2' && recoveryUser && <RecoverStep2 recoveryUser={recoveryUser} setMode={setMode} setError={setError} setIsLoading={setIsLoading} onSwitchToLogin={() => handleModeChange('login')} />}
                    {mode === 'recover-step-3' && recoveryUser && <RecoverStep3 recoveryUser={recoveryUser} setSuccess={setSuccess} setMode={setMode} setError={setError} setIsLoading={setIsLoading} />}
                </>
            )}
        </div>
    );
};

// --- Form Components ---

const PasswordInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, id: string}> = ({ value, onChange, placeholder, id }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative">
            <input id={id} type={isVisible ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10" required />
            <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500" aria-label="Toggle password visibility">
                {isVisible ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
        </div>
    );
};

const LoginForm: React.FC<{onLoginSuccess: (t:string, u:string)=>void, setError: (e:string)=>void, setIsLoading: (l:boolean)=>void, onSwitchToRegister: ()=>void, onSwitchToRecover: ()=>void}> = ({ onLoginSuccess, setError, setIsLoading, onSwitchToRegister, onSwitchToRecover }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { token, username: loggedInUsername } = await api.login(username, password);
            onLoginSuccess(token, loggedInUsername);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="login-username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input id="login-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" required />
            </div>
            <div>
                <label htmlFor="login-password"  className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <PasswordInput id="login-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-rose-700 transition-colors">Login</button>
            <div className="text-center text-sm">
                <button type="button" onClick={onSwitchToRegister} className="font-medium text-rose-600 dark:text-rose-400 hover:underline">Create an account</button>
                <span className="mx-2 text-gray-400">|</span>
                <button type="button" onClick={onSwitchToRecover} className="font-medium text-rose-600 dark:text-rose-400 hover:underline">Forgot Password?</button>
            </div>
        </form>
    );
};

const RegisterForm: React.FC<{onRegisterSuccess: (t:string, u:string)=>void, setError: (e:string)=>void, setIsLoading: (l:boolean)=>void, onSwitchToLogin: ()=>void}> = ({ onRegisterSuccess, setError, setIsLoading, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryQuestion, setRecoveryQuestion] = useState('');
    const [recoveryAnswer, setRecoveryAnswer] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            return setError("Passwords do not match.");
        }
        if (password.length < 6) {
            return setError("Password must be at least 6 characters long.");
        }
        setIsLoading(true);
        try {
            const { token, username: newUsername } = await api.register({ username, password, recoveryQuestion, recoveryAnswer });
            onRegisterSuccess(token, newUsername);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" required />
            <PasswordInput id="reg-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <PasswordInput id="reg-confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
            <input type="text" value={recoveryQuestion} onChange={e => setRecoveryQuestion(e.target.value)} placeholder="Security Question (e.g., first pet's name?)" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" required />
            <input type="text" value={recoveryAnswer} onChange={e => setRecoveryAnswer(e.target.value)} placeholder="Answer to Security Question" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" required />
            <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-rose-700 transition-colors">Register</button>
            <div className="text-center text-sm">
                <button type="button" onClick={onSwitchToLogin} className="font-medium text-rose-600 dark:text-rose-400 hover:underline">Already have an account? Login</button>
            </div>
        </form>
    );
};

const RecoverStep1: React.FC<{setRecoveryUser: (u:User)=>void, setMode: (m:any)=>void, setError: (e:string)=>void, setIsLoading: (l:boolean)=>void, onSwitchToLogin: ()=>void}> = ({ setRecoveryUser, setMode, setError, setIsLoading, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await api.findUserForRecovery(username);
            setRecoveryUser(user);
            setMode('recover-step-2');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-center text-gray-500">Enter your username to begin the recovery process.</p>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" required autoFocus />
            <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-rose-700 transition-colors">Find Account</button>
            <div className="text-center text-sm">
                <button type="button" onClick={onSwitchToLogin} className="font-medium text-rose-600 dark:text-rose-400 hover:underline">Back to Login</button>
            </div>
        </form>
    );
};

const RecoverStep2: React.FC<{recoveryUser: User, setMode: (m:any)=>void, setError: (e:string)=>void, setIsLoading: (l:boolean)=>void, onSwitchToLogin: ()=>void}> = ({ recoveryUser, setMode, setError, setIsLoading, onSwitchToLogin }) => {
    const [answer, setAnswer] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.verifyRecoveryAnswer(recoveryUser.username, answer);
            setMode('recover-step-3');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-sm text-gray-500">Security Question:</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{recoveryUser.recoveryQuestion}</p>
            </div>
            <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your Answer" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" required autoFocus />
            <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-rose-700 transition-colors">Verify Answer</button>
            <div className="text-center text-sm">
                <button type="button" onClick={onSwitchToLogin} className="font-medium text-rose-600 dark:text-rose-400 hover:underline">Cancel Recovery</button>
            </div>
        </form>
    );
};

const RecoverStep3: React.FC<{recoveryUser: User, setMode: (m:any)=>void, setError: (e:string)=>void, setSuccess: (s:string)=>void, setIsLoading: (l:boolean)=>void}> = ({ recoveryUser, setMode, setError, setSuccess, setIsLoading }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            return setError("New passwords do not match.");
        }
        if (newPassword.length < 6) {
            return setError("Password must be at least 6 characters long.");
        }
        setIsLoading(true);
        try {
            await api.resetPassword(recoveryUser.username, newPassword);
            setSuccess("Your password has been successfully reset! Please log in.");
            setMode('login');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-center text-gray-500">Enter a new password for {recoveryUser.username}.</p>
            <PasswordInput id="recover-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" />
            <PasswordInput id="recover-confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" />
            <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-rose-700 transition-colors">Reset Password</button>
        </form>
    );
};

export default Auth;
