const math = require("mathjs");
const log_table = require("cli-table");
const colors = require("colors");

function gaussSeidelMethod(matrixA, matrixB, epsilon) {}

function linearSystemFromMatrix(matrixA, matrixB) {
  const title = colors.red("Linear system\n");
  const linearSystem = new log_table();

  for (let i = 0; i < matrixA.length; i++) {
    let line = "";

    for (let j = 0; j < matrixA[i].length; j++) {
      const el = matrixA[i][j];

      if (j != 0) {
        if (el >= 0) line += " + ";
        else line += " - ";
      } else {
        if (el < 0) line += "-";
      }

      line += `${math.abs(el)}*X${j}`;
    }

    linearSystem.push([`${line} = ${matrixB[i]}`]);
  }

  return "\n" + title + linearSystem.toString() + "\n";
}

function checkOnConvergence(matrixA) {
  const title = colors.red("Check on convergence\n");
  const convergence = new log_table({
    head: ["check", "isCorrect"]
  });

  for (let i = 0; i < matrixA.length; i++) {
    let line = "";
    let sum = 0;
    let isCorrect = false;

    for (let j = 0; j < matrixA[i].length; j++) {
      const el = matrixA[i][j];
      if (j != i) {
        sum += el;
        if (line != "") {
          if (el >= 0) line += ` + `;
          else line += ` - `;
        } else {
          if (el < 0) line += `-`;
        }

        line += `${math.abs(el)}`;
      }
    }

    if (matrixA[i][i] > sum) isCorrect = true;
    convergence.push([`${matrixA[i][i]} > ${line} > ${sum}`, isCorrect]);
  }

  return "\n" + title + convergence.toString() + "\n";
}

function iterationSystemFromMatrix(matrixA, matrixB) {
  const title = colors.red("Iteration system\n");
  const iterationSystem = new log_table();

  return "\n" + title + iterationSystem.toString() + "\n";
}

function resultTable(matrixA, matrixB, epsilon) {
  const title = colors.red("Result table\n");
  const result = new log_table();

  return "\n" + title + result.toString() + "\n";
}

const matrixA = [
  [-3.857, 0.239, 0.272, 0.258],
  [0.491, -3.941, 0.131, 0.178],
  [0.436, 0.281, 4.189, 0.416],
  [-0.317, 0.229, 0.326, -2.971]
];
const matrixB = [-0.19, 0.179, -0.753, 0.86];
const epsilon = 1e-3;
const dgt = 3;

const linearSystem = linearSystemFromMatrix(matrixA, matrixB);
const convergence = checkOnConvergence(matrixA);
const iterationSystem = iterationSystemFromMatrix(matrixA, matrixB);
const result = resultTable(matrixA, matrixB, epsilon);

console.log(linearSystem);
console.log(convergence);
console.log(iterationSystem);
console.log(result);
