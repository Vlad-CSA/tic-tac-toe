import React from "react";
import {Redirect} from "react-router-dom";

import './login-page.scss';

const BadLoginMessage = ({ onCloseMessage }) => {
    return (
        <div className="alert alert-dismissible alert-danger login-message">
            <button type="button" className="close" data-dismiss="alert"
            onClick={onCloseMessage}>
                &times;
            </button>
            <p>Wrong username or password. Try again</p>
        </div>
    );
};

const LoginPage = ({ isLoggedIn, onLogin, hasError, onCloseMessage }) => {

    if (isLoggedIn) {
        return <Redirect to="/tic-tac-toe/game" />
    }

    const Error = hasError ? <BadLoginMessage onCloseMessage={onCloseMessage}/> : null;

    return (
        <div className="jumbotron login-form">
            <label htmlFor="user">
                <h4>Welcome to<br/> Tic Tac Toe</h4>
                <p className="text-primary">Login to play the game</p>
            </label>
            <div className="form-group">
                <input type="text" id="user" name="user" className="form-control" placeholder="username"/>
            </div>
            <div className="form-group">
                <input type="text" id="pass" name="pass" className="form-control" placeholder="password"/>
                <button
                    className="btn btn-primary btn-block"
                    onClick={onLogin}>
                    Enter
                </button>
            </div>
            {Error}
        </div>
    );
};

export default LoginPage;
