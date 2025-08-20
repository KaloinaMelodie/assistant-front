import React from 'react';
import { useTranslation } from "react-i18next";


const Login = () => {
    const { t } = useTranslation();
    
    return (
        <>
            <div className="row">
                <div className="offset-sm-2 col-sm-8">
                    <div className="pb-2 mt-4 mb-4 border-bottom">
                        <h3>{t('login.title')}</h3>
                    </div>
                    <form id="form_login">
                        <div className="mb-3">
                            <label for="login_username">{t('login.username')}</label>
                            <input className="form-control" id="login_username" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder={t('login.username_placeholder')} value="" />
                        </div>
                        <div className="mb-3">
                            <div className="float-end">
                                <a id="reset_password">{t('login.forgot_password')}</a>
                            </div>
                            <label>{t('login.password')}</label>
                            <input className="form-control" id="login_password" type="password" placeholder={t('login.password')} value="" />
                        </div>
                        <div className="d-grid pb-1">
                            <button id="login_button" type="submit" className="btn btn-primary btn-lg">
                                <span className=""></span>{t('login.submit')}</button>
                        </div>
                    </form>
                    <br />
                    <p className="text-center"> - {t('login.or')} - </p><div className="d-grid pb-1"><button id="signup_button" className="btn btn-lg btn-outline-primary">{t('login.register')}</button></div><br /><br />
                </div >
            </div >
        </>
    );
}

export default Login;