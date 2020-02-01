import React from "react";
import {Redirect} from "react-router-dom";

const LoginPage = ({ isLoggedIn, onLogin, hasError }) => {

    if (isLoggedIn) {
        return <Redirect to="/game" />
    }

    const Error = hasError ? <h3 style={{color: "red"}}>Wrong username or password</h3> : null;

    return (
        <div className="login-form">
            <h2>Welcome to Tic Tac Toe</h2>
            <p>Login to play the game</p>
            <p>
                <label htmlFor="user">User name</label>
                <input type="text" id="user" name="user"/>
            </p>
            <p>
                <label htmlFor="pass">Password</label>
                <input type="text" id="pass" name="pass"/>
            </p>
            <button
                onClick={onLogin}>
                Enter
            </button>
            {Error}
        </div>
    );
};

export default LoginPage;
