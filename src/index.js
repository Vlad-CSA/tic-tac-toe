import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './index.scss';

function Square({ onClick, value }) {
    return (
        <button
            className="square"
            onClick={ onClick }>
            { value }
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i) {
        return (
            <Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div className={this.props.boardClasses}>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            user: 'Vlad',
            statistics: {
                user: {
                    wins: 0,
                    loses: 0,
                    draws: 0,
                },
                computer: {
                    wins: 0,
                    loses: 0,
                    draws: 0,
                },
            },
        };
        this.networkService = new NetworkService();
        this.networkService
            .receiveDataFromServer()
            .then(res => res ? this.setState(res) : null);
    }

    handleClick(i) {
        if (!this.state.xIsNext) return;

        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length-1];
        const squares = current.squares.slice();
        //  если кто то выиграл или поле заполнено, то выходим из функции
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = 'X';
        this.setState({
            history: history.concat([{
                squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    randomTurn() {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length-1];
        const squares = current.squares.slice();

        //  если ход игрока то компьютеру запрещено ходить
        if (this.state.xIsNext || calculateWinner(squares).winner) return;

        while(true) {
            const i = Math.floor(Math.random() * 9);
            if (squares[i]) continue;
            squares[i] = 'O';
            this.setState({
                history: history.concat([{
                    squares,
                }]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
            });
            return;
        }
    }

    handleNextMatch(winner) {
        if (!winner) return;
        const { user } = this.state.statistics;
        const { computer } = this.state.statistics;
        this.setState({
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            statistics: {
                user: {
                    wins: winner === 'X' ? user.wins + 1 : user.wins,
                    loses: winner === 'O' ? user.loses + 1 : user.loses,
                    draws: winner === 'nobody' ? user.draws + 1 : user.draws,
                },
                computer: {
                    wins: winner === 'O' ? computer.wins + 1 : computer.wins,
                    loses: winner === 'X' ? computer.loses + 1 : computer.loses,
                    draws: winner === 'nobody' ? computer.draws + 1 : computer.draws,
                },
            }
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //  отправляем весь state на сервер, потому что выбора особо нет
        //  в данном случае нам дается возможность управлять только одной
        //  строкой с данными на сервере
        this.networkService
            .sendDataFromUser(this.state);
    }

    render() {

        //есть минус у деструктуризации - конструкция this.%что-то% заметнее чем просто переменная
        const { history, xIsNext, user, statistics } = this.state;
        const current = history[this.state.stepNumber];
        //  небольшой прием, что бы не использовать переменную с глобальной областью видимости как подумал изначально
        const { winner, i } = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                `Go to move #${move}` :
                `Go to game start`;
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status, boardClasses = 'board';
        if (winner) {
            if (winner === 'nobody') {
                status = 'Winner: nobody';
            } else {
                // каждый раз когда происходят изменения в стейте и компонент вызывает заново метод рендер
                // происходит создание переменной boardClasses
                // итого - это простая алтернатива удержанию значения в стейте
                boardClasses += ` board-${i}`;
                status = `Winner: ${winner === 'X' ? user + '(X)' : 'Computer(O)'}`;
            }
        } else {
            status = `Next player: ${xIsNext ? user + '(X)' : 'computer(O)'}`;
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        // тут "костыль" с классами, что бы реализовать перечеркивание
                        boardClasses={boardClasses}
                    />
                </div>
                <div className="game-info">
                    <button onClick={() => this.randomTurn()}>Computer Turn</button><br/>
                    <button
                        onClick={() => this.handleNextMatch(winner)}
                        style={{color: "blue"}}>
                        Next Match
                    </button>
                    <button onClick={this.props.onExit}>Exit</button><br/>
                    <div>{ status }</div>
                    <ol>{ moves }</ol>
                </div>
                <div className="statistics">
                    <div>
                        <p><b>{this.state.user}</b></p>
                        <ul>
                            <li>Wins: <b>{statistics.user.wins}</b></li>
                            <li>Loses: <b>{statistics.user.loses}</b></li>
                            <li>Draws: <b>{statistics.user.draws}</b></li>
                        </ul>
                    </div>
                    <div>
                        <p><b>Computer</b></p>
                        <ul>
                            <li>Wins: <b>{statistics.computer.wins}</b></li>
                            <li>Loses: <b>{statistics.computer.loses}</b></li>
                            <li>Draws: <b>{statistics.computer.draws}</b></li>
                        </ul>
                    </div>
                </div>

            </div>
        );
    }
}

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

const SecretPage = ({ isLoggedIn, onExit }) => {

    if (isLoggedIn) {
        return (
            <Game onExit={onExit}/>
        );
    }

    return <Redirect to="/login" />;
};

class NetworkService {

    // реализовал все методы для работы с API, хоть по сути можно обойтись 4-мя

    _apiBase = 'http://localhost:8421/api.';

    signInReq = async (data) => {
        return await fetch(`${this._apiBase}authentication.signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            // нужно для передачи cookie
            credentials: 'include',
            body: JSON.stringify(data),
        });
    };

    signOutReq = async () => {
        return await fetch(`${this._apiBase}authentication.signout`, {
            method: 'GET',
            credentials: 'include',
        });
    };

    userCheck = async () => {
        return await fetch(`${this._apiBase}authentication.check`,{
            method: 'GET',
            credentials: 'include',
        });
    };

    sendDataFromUser = async (data) => {
        return await fetch(`${this._apiBase}user.setstate`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(data),
        });
    };

    receiveDataFromServer = async () => {
        return await fetch(`${this._apiBase}user.getstate`, {
            method: 'GET',
            credentials: 'include',
        }).then(res => res.json())
    }
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            hasError: false,
            networkService: new NetworkService(),
        };
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

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/login"
                           render={() =>
                               <LoginPage
                                   isLoggedIn={this.state.isLoggedIn}
                                   onLogin={this.onLogin}
                                   hasError={this.state.hasError}/>
                           }/>
                    <Route path="/game"
                           render={() =>
                               <SecretPage
                                   isLoggedIn={this.state.isLoggedIn}
                                   onExit={this.onExit}/>
                           }/>
                    <Redirect to="/login"/>
                    {/* альтернативный вариант неправильных адресов */}
                    {/* но redirect более user-friendly как по мне, особенно для SPA */}
                    <Route render={() => <h2>Page not found</h2>} />
                </Switch>
            </Router>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            console.log({ winner:squares[a], i });
            return { winner:squares[a], i };
        }
    }
    //  проверка на ничью
    if (squares.filter((i)=>i).length === 9) return { winner:'nobody', i:null };
    return { winner: null, i: null };
}
