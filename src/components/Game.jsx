import { useEffect, useRef, useState } from "react";

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 10;
const BALL_SPEED = 2;
const PADDLE_SPEED = 5;
const AI_ERROR_MARGIN = 50; // margen de error de la IA

export default function Game({ mode, onExit }) {
    const canvasRef = useRef(null);
    const [score, setScore] = useState([0, 0]);
    const gameLoopRef = useRef(null);
    const paddleMovement = useRef({
        up: false,
        down: false,
        paddle2Up: false,
        paddle2Down: false,
    });

    const [gameState, setGameState] = useState({
        ball: {
            x: 400,
            y: 300,
            dx: BALL_SPEED,
            dy: BALL_SPEED,
        },
        paddles: [
            { y: 250 }, //pala izquierda
            { y: 250 }, //pala derecha
        ],
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        let animationFrameId;

        const handleKeyPress = (e) => {
            //previene comportamiento predeterminado de las arrow key de scroll de pagina
            if (["ArrowUp", "ArrowDown"].includes(e.key)) {
                e.preventDefault();
            }

            //controles del jugador 1
            if (e.key === "w") paddleMovement.current.up = true;
            if (e.key === "s") paddleMovement.current.down = true;

            //cntroles del jugador 2 (humano/IA)
            if (mode === "multi") {
                if (e.key === "ArrowUp")
                    paddleMovement.current.paddle2Up = true;
                if (e.key === "ArrowDown")
                    paddleMovement.current.paddle2Down = true;
            }
        };

        const handleKeyRelease = (e) => {
            if (["ArrowUp", "ArrowDown"].includes(e.key)) {
                e.preventDefault();
            }
            //cuando se suelta la tecla la pala deja de moverse
            if (e.key === "w") paddleMovement.current.up = false;
            if (e.key === "s") paddleMovement.current.down = false;

            if (mode === "multi") {
                if (e.key === "ArrowUp")
                    paddleMovement.current.paddle2Up = false;
                if (e.key === "ArrowDown")
                    paddleMovement.current.paddle2Down = false;
            }
        };

        const updatePaddles = () => {
            setGameState((prev) => {
                const newState = { ...prev };
                const canvasHeight = canvas.height;

                 //jugador
                if (paddleMovement.current.up && newState.paddles[0].y > 0) {
                    newState.paddles[0].y -= PADDLE_SPEED;
                }
                if (
                    paddleMovement.current.down &&
                    newState.paddles[0].y < canvasHeight - PADDLE_HEIGHT
                ) {
                    newState.paddles[0].y += PADDLE_SPEED;
                }

                //jugador 2 (IA/humano)
                if (mode === "multi") {
                    if (
                        paddleMovement.current.paddle2Up &&
                        newState.paddles[1].y > 0
                    ) {
                        newState.paddles[1].y -= PADDLE_SPEED;
                    }
                    if (
                        paddleMovement.current.paddle2Down &&
                        newState.paddles[1].y < canvasHeight - PADDLE_HEIGHT
                    ) {
                        newState.paddles[1].y += PADDLE_SPEED;
                    }
                }

                return newState;
            });
        };

        const updateAI = () => {
            if (mode === "single") {
                setGameState((prev) => {
                    const newState = { ...prev };
                    const paddleCenter = prev.paddles[1].y + PADDLE_HEIGHT / 2;
                    const ballY = prev.ball.y;

                    // MOVIMIENTO DE LA IA: si la pelota está por encima del centro de la pala, mover hacia arriba; si está por debajo, mover hacia abajo
                    if (paddleCenter < ballY - AI_ERROR_MARGIN) {
                        newState.paddles[1].y += PADDLE_SPEED * 0.6;
                    } else if (paddleCenter > ballY + AI_ERROR_MARGIN) {
                        newState.paddles[1].y -= PADDLE_SPEED * 0.6;
                    }

                    return newState;
                });
            }
        };

        const updateBall = () => {
            setGameState((prev) => {
                const newState = { ...prev };

                //ovimiento de la pelota
                newState.ball.x += newState.ball.dx;
                newState.ball.y += newState.ball.dy;

                //colisión de la pelota con los limites superior/inferior
                if (
                    newState.ball.y <= 0 ||
                    newState.ball.y >= canvas.height - BALL_SIZE
                ) {
                    newState.ball.dy *= -1;
                }

                //colisión de la pelota con las palas
                const checkPaddleCollision = (paddleIndex) => {
                    const paddle = prev.paddles[paddleIndex];
                    const paddleX =
                        paddleIndex === 0
                            ? PADDLE_WIDTH
                            : canvas.width - PADDLE_WIDTH * 2;

                    if (
                        newState.ball.x <= paddleX + PADDLE_WIDTH &&
                        newState.ball.x >= paddleX &&
                        newState.ball.y >= paddle.y &&
                        newState.ball.y <= paddle.y + PADDLE_HEIGHT
                    ) {
                        newState.ball.dx *= -1;

                        // pequeño ángulo de desviación a la pelota para evitar el rebote en linea recta
                        const paddleCenter = paddle.y + PADDLE_HEIGHT / 2;
                        const ballHitPosition = newState.ball.y - paddleCenter; //distancia desde el centro de la pala

                        // modifica la dirección de la pelota dependiendo de donde colisiona en la pala
                        newState.ball.dy =
                            (ballHitPosition / PADDLE_HEIGHT) * BALL_SPEED * 2; // Factor de desviación

                        //desvio para rebotes mas aleatorios
                        newState.ball.dy += (Math.random() - 0.5) * 0.5; //aleatorio entre -0.25 y 0.25

                        //si la pelota golpea muy cerca del borde superior/inferior de la pala asegura que no se quede atrapada
                        if (Math.abs(newState.ball.dy) < 0.5) {
                            newState.ball.dy += (Math.random() - 0.5) * 2; // Pequeña corrección aleatoria
                        }
                    }
                };

                checkPaddleCollision(0);
                checkPaddleCollision(1);

                //pelota fuera de limites
                if (newState.ball.x <= 0) {
                    setScore((prev) => [prev[0], prev[1] + 1]);
                    newState.ball = {
                        x: 400,
                        y: 300,
                        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                        dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                    };
                }
                if (newState.ball.x >= canvas.width) {
                    setScore((prev) => [prev[0] + 1, prev[1]]);
                    newState.ball = {
                        x: 400,
                        y: 300,
                        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                        dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                    };
                }

                return newState;
            });
        };

        const gameLoop = () => {
            context.fillStyle = "black";
            context.fillRect(0, 0, canvas.width, canvas.height);

            //linea central
            context.strokeStyle = "white";
            context.setLineDash([10, 10]);
            context.beginPath();
            context.moveTo(canvas.width / 2, 0);
            context.lineTo(canvas.width / 2, canvas.height);
            context.stroke();

            //puntuación
            context.font = "48px monospace";
            context.fillStyle = "white";
            context.fillText(score[0], canvas.width / 4, 60);
            context.fillText(score[1], (canvas.width / 4) * 3, 60);

            //palas
            context.fillStyle = "white";
            gameState.paddles.forEach((paddle, index) => {
                context.fillRect(
                    index === 0
                        ? PADDLE_WIDTH
                        : canvas.width - PADDLE_WIDTH * 2,
                    paddle.y,
                    PADDLE_WIDTH,
                    PADDLE_HEIGHT
                );
            });

            //pelota
            context.fillRect(
                gameState.ball.x,
                gameState.ball.y,
                BALL_SIZE,
                BALL_SIZE
            );

            updateBall();
            updateAI(); //asegura que la IA se mueva automáticamente en modo 1player
            updatePaddles();
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("keyup", handleKeyRelease);
        gameLoopRef.current = gameLoop;
        animationFrameId = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
            window.removeEventListener("keyup", handleKeyRelease);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mode, score, gameState.ball.x]);

    return (
        <div className="game-container">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="game-canvas"
            />
            <button className="exit-button" onClick={onExit}>
                Exit Game
            </button>
        </div>
    );
}
