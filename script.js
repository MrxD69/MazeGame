const mazeElement = document.getElementById("maze");
const generateButton = document.getElementById("generate");
const solveButton = document.getElementById("solve");

const mazeWidth = 11; // Must be odd
const mazeHeight = 21; // Must be odd
let maze = [];
let playerPosition = { row: 0, col: 0 }; // Player's position

// Initialize a blank maze
function createBlankMaze() {
  maze = Array.from({ length: mazeHeight }, () =>
    Array(mazeWidth).fill(1) // Fill with walls initially
  );
}

// Render the maze in the HTML
function renderMaze() {
  mazeElement.style.gridTemplateColumns = `repeat(${mazeWidth}, 20px)`;
  mazeElement.style.gridTemplateRows = `repeat(${mazeHeight}, 20px)`;
  mazeElement.innerHTML = "";

  for (let row = 0; row < mazeHeight; row++) {
    for (let col = 0; col < mazeWidth; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (maze[row][col] === 1) cell.classList.add("wall"); // Wall
      else if (row === 0 && col === 0) cell.classList.add("start"); // Start point
      else if (row === mazeHeight - 1 && col === mazeWidth - 1)
        cell.classList.add("end"); // End point
      else cell.classList.add("path"); // Path

      if (row === playerPosition.row && col === playerPosition.col) {
        cell.classList.add("player"); // Player's current position
      }

      mazeElement.appendChild(cell);
    }
  }
}

// Generate a maze using Depth-First Search
function generateMaze() {
  createBlankMaze();
  const stack = [[0, 0]];
  const directions = [
    [0, 2],
    [0, -2],
    [2, 0],
    [-2, 0],
  ];

  maze[0][0] = 0; // Start point is a path

  while (stack.length > 0) {
    const [row, col] = stack.pop();
    shuffleArray(directions);

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < mazeHeight &&
        newCol >= 0 &&
        newCol < mazeWidth &&
        maze[newRow][newCol] === 1 // If the neighbor is a wall
      ) {
        // Remove walls between the current cell and the neighbor
        maze[newRow][newCol] = 0; // Mark the neighbor as a path
        maze[row + dr / 2][col + dc / 2] = 0; // Remove the wall in between
        stack.push([newRow, newCol]); // Add the neighbor to the stack
      }
    }
  }

  playerPosition = { row: 0, col: 0 }; // Reset player position
  renderMaze();
}

// Shuffle an array (for randomizing directions)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Solve the maze using Breadth-First Search (BFS)
function solveMaze() {
  const queue = [[0, 0]];
  const visited = new Set();
  const parent = {};
  const directions = [
    [0, 1], // Right
    [0, -1], // Left
    [1, 0], // Down
    [-1, 0], // Up
  ];

  visited.add("0,0");
  parent["0,0"] = null;

  while (queue.length > 0) {
    const [row, col] = queue.shift();

    // If we've reached the end of the maze
    if (row === mazeHeight - 1 && col === mazeWidth - 1) {
      let path = [[row, col]];
      let current = `${row},${col}`;

      // Backtrack to find the solution path
      while (parent[current]) {
        const [pr, pc] = parent[current].split(",").map(Number);
        path.push([pr, pc]);
        current = parent[current];
      }

      path.reverse();
      drawSolution(path);
      return;
    }

    // Explore neighbors
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < mazeHeight &&
        newCol >= 0 &&
        newCol < mazeWidth &&
        maze[newRow][newCol] === 0 &&
        !visited.has(`${newRow},${newCol}`)
      ) {
        queue.push([newRow, newCol]);
        visited.add(`${newRow},${newCol}`);
        parent[`${newRow},${newCol}`] = `${row},${col}`;
      }
    }
  }
  alert("No solution found!");
}

// Draw the solution path on the maze
function drawSolution(path) {
  for (const [row, col] of path) {
    const cell = mazeElement.children[row * mazeWidth + col];
    if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
      cell.classList.add("solution");
    }
  }
}

// Move the player
function movePlayer(direction) {
  const { row, col } = playerPosition;
  let newRow = row;
  let newCol = col;

  if (direction === "up") newRow -= 1;
  if (direction === "down") newRow += 1;
  if (direction === "left") newCol -= 1;
  if (direction === "right") newCol += 1;

  // Check if the new position is within bounds and not a wall
  if (
    newRow >= 0 &&
    newRow < mazeHeight &&
    newCol >= 0 &&
    newCol < mazeWidth &&
    maze[newRow][newCol] === 0
  ) {
    playerPosition = { row: newRow, col: newCol };
    renderMaze();

    // Check if the player reached the end
    if (newRow === mazeHeight - 1 && newCol === mazeWidth - 1) {
      alert("Congratulations! You reached the end of the maze!");
    }
  }
}

// Handle keyboard input
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "w") movePlayer("up");
  if (event.key === "ArrowDown" || event.key === "s") movePlayer("down");
  if (event.key === "ArrowLeft" || event.key === "a") movePlayer("left");
  if (event.key === "ArrowRight" || event.key === "d") movePlayer("right");
});

// Handle D-pad button clicks
document.getElementById("up").addEventListener("click", () => movePlayer("up"));
document
  .getElementById("down")
  .addEventListener("click", () => movePlayer("down"));
document
  .getElementById("left")
  .addEventListener("click", () => movePlayer("left"));
document
  .getElementById("right")
  .addEventListener("click", () => movePlayer("right"));

// Event listeners
generateButton.addEventListener("click", generateMaze);
solveButton.addEventListener("click", solveMaze);

// Initialize blank maze on page load
createBlankMaze();
renderMaze();
