import {Redirect} from "react-router-dom";
import React from "react";

import Game from "../game";

const MainGamePage = ({ isLoggedIn, onExit }) => {

    if (isLoggedIn) {
        return (
            <Game onExit={onExit}/>
        );
    }

    return <Redirect to="/tic-tac-toe/login" />;
};

export default MainGamePage;
