import { useState } from "react";
import Game from "./components/Game";
import "./App.css";

function App() {
    const [gameMode, setGameMode] = useState(null);

    return (
        <div className="app">
            <div className="game">
                <h1 className="title">PONG</h1>
                {!gameMode ? (
                    <div className="menu">
                        <button onClick={() => setGameMode("single")}>
                            1 Player
                        </button>
                        <button onClick={() => setGameMode("multi")}>
                            2 Players
                        </button>
                    </div>
                ) : (
                    <Game mode={gameMode} onExit={() => setGameMode(null)} />
                )}
            </div>
            <div className="controls">
                <h1>Instructions</h1>
                <p>Press "1 Player" to play against the computer.</p>
                <p>Press "2 Players" to play against a friend.</p>
                <p>-----</p>
                <p>Player 1: W/S keys</p>
                <p>Player 2: Up/Down arrows</p>
            </div>
        </div>
    );
}

export default App;
