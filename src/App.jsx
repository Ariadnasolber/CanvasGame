import { useState } from "react";
import Game from "./components/Game";
import "./App.css";

function App() {
    const [gameMode, setGameMode] = useState(null);

    return (
        <div className="app">
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
            <div className="controls">
                <h1>Instrucciones</h1>
                <p>Presiona "1 Player" para jugar contra la computadora.</p>
                <p>Presiona "2 Players" para jugar contra un amigo.</p>
                <p>-----</p>
                <p>Jugador 1: teclas W/S</p>
                <p>Jugador 2: flechas arriba/abajo</p>
            </div>
        </div>
    );
}

export default App;
