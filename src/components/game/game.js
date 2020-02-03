import React from "react";
import Board from "../board";
import NetworkService from '../../services/network-service';
import calculateWinner from "../hoc-helpers";

import './game.scss';

export default class Game extends React.Component {

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
                    <button
                        key={move}
                        className="btn btn-secondary dropdown-item"
                        onClick={() => this.jumpTo(move)}>{desc}
                    </button>
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

        const classListComputerTurn = xIsNext ? 'btn btn-secondary disabled' : 'btn btn-info';
        const classListNextMatch = winner === null ? 'btn btn-secondary disabled' : 'btn btn-success';

        return (
            <div className="game">
                <div className="game-board">
                    <h5>{ status }</h5>
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        // тут "костыль" с классами, что бы реализовать перечеркивание
                        boardClasses={boardClasses}
                    />
                </div>
                <div className="wrap">
                    <div className="controls">
                        <button
                            onClick={() => this.randomTurn()}
                            className={classListComputerTurn}
                            disabled={!!xIsNext}>
                            Computer Turn
                        </button>
                        <button
                            onClick={() => this.handleNextMatch(winner)}
                            className={classListNextMatch}
                            disabled={winner === null}>
                            Next Match
                        </button>
                        <button onClick={this.props.onExit} className="btn btn-danger">Exit</button><br/>
                    </div>
                    <div className="statistics">
                        <table className="table table-hover">
                            <thead>
                            <tr className="table-secondary">
                                <th scope="col">Player</th>
                                <th scope="col">Wins</th>
                                <th scope="col">Loses</th>
                                <th scope="col">Draws</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="table-primary">
                                <th scope="row">{this.state.user}</th>
                                <td>{statistics.user.wins}</td>
                                <td>{statistics.user.loses}</td>
                                <td>{statistics.user.draws}</td>
                            </tr>
                            <tr className="table-info">
                                <th scope="row">Computer</th>
                                <td>{statistics.computer.wins}</td>
                                <td>{statistics.computer.loses}</td>
                                <td>{statistics.computer.draws}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="btn-group">
                        <button type="button" className="btn btn-danger dropdown-toggle" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                            History of moves
                        </button>
                        <div className="dropdown-menu">
                            { moves }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
