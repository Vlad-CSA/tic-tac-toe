import {Redirect} from "react-router-dom";
import React from "react";

import Game from "../game";

const MainGamePage = ({ isLoggedIn, onExit }) => {

    if (isLoggedIn) {
        return (
            <Game onExit={onExit}/>
        );
    }

    return <Redirect to="/login" />;
};

export default MainGamePage;
