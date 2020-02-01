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
