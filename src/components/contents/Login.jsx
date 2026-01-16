// src/components/contents/Login.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { refreshTranslations } from '../../i18n';

const Login = () => {
    const { t } = useTranslation();
    const { login } = useAuth();                  
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/index';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPending(true);
        try {
            await login(username, password);          
            navigate(from, { replace: true });        
        } catch (err) {
            setError(err.message || t('login.global_error'));
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="row">
            <div className="offset-sm-2 col-sm-8">
                <div className="pb-2 mt-4 mb-4 border-bottom">
                    <h3>{t('login.title')}</h3>
                </div>

                <form id="form_login" onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label htmlFor="login_username">{t('login.username')}</label>
                        <input
                            className="form-control"
                            id="login_username"
                            type="text"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck="false"
                            placeholder={t('login.username_placeholder')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={pending}
                        />
                    </div>

                    <div className="mb-3">
                        {/* <div className="float-end">
                            <a id="reset_password" href="#">{t('login.forgot_password')}</a>
                        </div> */}
                        <label htmlFor="login_password">{t('login.password')}</label>
                        <input
                            className="form-control"
                            id="login_password"
                            type="password"
                            placeholder={t('login.password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={pending}
                        />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="d-grid pb-1">
                        <button id="login_button" type="submit" className="btn btn-primary btn-lg" disabled={pending}>
                            {pending ? t('login.loading') : t('login.submit')}
                        </button>
                    </div>
                </form>

                <br />
                <p className="text-center">- {t('login.or')} -</p>
                <div className="d-grid pb-1">
                    <a id="signup_button" className="btn btn-lg btn-outline-primary" disabled={pending} href="https://portal.mwater.co/#/signup" target="_blank" rel="noopener noreferrer">
                        {t('login.register')}
                    </a>
                </div>
                <br /><br />
            </div>
        </div>
    );
};

export default Login;
