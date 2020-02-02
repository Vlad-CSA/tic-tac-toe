import React from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";

import NetworkService from '../../services/network-service';
import MainGamePage from "../pages/main-game-page";
import LoginPage from "../pages/login-page";

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            hasError: false,
            networkService: new NetworkService(),
        };
        this.state.networkService
            .userCheck()
            .then(res => res.ok ? this.setState({ isLoggedIn: true }) : null)
    }

    onLogin = () => {
        const userInfo = {
            "username": document.getElementById('user').value,
            "password": document.getElementById('pass').value
        };
        this.state.networkService
            .signInReq(userInfo)
            .then(res => {
                if (res.ok) {
                    this.setState({ isLoggedIn: true, hasError: false });
                } else {
                    this.setState({ hasError: true });
                }
            });
    };

    onExit = () => {
        this.state.networkService
            .signOutReq()
            .then(res => {
                if (res.ok) {
                    this.setState({ isLoggedIn: false });
                }
            });
    };

    onCloseErrorMessage = () => {
        if (this.state.hasError) {
            this.setState({ hasError: false })
        }
    };

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/tic-tac-toe/login"
                           render={() =>
                               <LoginPage
                                   isLoggedIn={this.state.isLoggedIn}
                                   onLogin={this.onLogin}
                                   hasError={this.state.hasError}
                                   onCloseMessage={this.onCloseErrorMessage}/>
                           }/>
                    <Route path="/tic-tac-toe/game"
                           render={() =>
                               <MainGamePage
                                   isLoggedIn={this.state.isLoggedIn}
                                   onExit={this.onExit}/>
                           }/>
                    <Redirect to="/tic-tac-toe/login"/>
                    {/* альтернативный вариант неправильных адресов */}
                    {/* но redirect более user-friendly как по мне, особенно для SPA */}
                    <Route render={() => <h2>Page not found</h2>} />
                </Switch>
            </Router>
        );
    }
}
