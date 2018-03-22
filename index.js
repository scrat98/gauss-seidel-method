const LogTable = require("./logTable.js");
const math = require("mathjs");
const _cloneDeep = require("lodash/cloneDeep");
const _times = require("lodash/times");

function getFormatNumber(number, first = false, dgt = null) {
  const formatNumber = math.format(math.abs(number), {
    notation: "fixed",
    precision: dgt ? dgt : "auto"
  });

  if (first === false) {
    if (number >= 0) return ` + ${formatNumber}`;
    else return ` - ${formatNumber}`;
  } else {
    if (number < 0) return `-${formatNumber}`;
    else return `${formatNumber}`;
  }
}

function getIterationMatrix(matrixA, matrixB) {
  let iterationMatrixA = _cloneDeep(matrixA);
  let iterationMatrixB = _cloneDeep(matrixB);
  for (let i = 0; i < matrixA.length; i++) {
    iterationMatrixB[i] = math.divide(matrixB[i], matrixA[i][i]);
    for (let j = 0; j < matrixA[i].length; j++) {
      iterationMatrixA[i][j] = math.divide(matrixA[i][j], matrixA[i][i]);
    }
  }

  return {
    iterationMatrixA: iterationMatrixA,
    iterationMatrixB: iterationMatrixB
  };
}

function evalToFunc(originalEval) {
  return args =>
    originalEval(
      args.reduce(
        (prev, curr, index) => ({
          ...prev,
          [`x${index}`]: curr
        }),
        {}
      )
    );
}

function getIterationFunctions(iterationMatrixA, iterationMatrixB) {
  const functions = [];

  for (let i = 0; i < iterationMatrixA.length; i++) {
    let expr = `x${i}`;
    expr += " = " + getFormatNumber(iterationMatrixB[i], true);
    for (let j = 0; j < iterationMatrixA[i].length; j++) {
      if (i == j) continue;
      const el = iterationMatrixA[i][j];
      const a = getFormatNumber(-el, false);
      const x = `x${j}`;
      expr += `${a}*${x}`;
    }

    functions.push(evalToFunc(math.parse(expr).compile().eval));
  }

  return functions;
}

function gaussSeidelMethod(matrixA, matrixB, epsilon, dgt) {
  let report = "";

  const linearSystem = linearSystemFromMatrix(matrixA, matrixB, dgt);
  const convergence = checkOnConvergence(matrixA, dgt);
  report += linearSystem.toString() + convergence.toString();

  if (convergence.error.code === "ok") {
    const iterationSystem = iterationSystemFromMatrix(matrixA, matrixB, dgt);
    const result = resultTable(matrixA, matrixB, epsilon, dgt);
    report += iterationSystem.toString() + result.toString();
  }

  return report;
}

function linearSystemFromMatrix(matrixA, matrixB, dgt) {
  const linearSystem = new LogTable({
    title: "Linear system"
  });
  linearSystem.setError("ok", "All is done!", "ok");

  for (let i = 0; i < matrixA.length; i++) {
    let expression = "";

    for (let j = 0; j < matrixA[i].length; j++) {
      const el = matrixA[i][j];
      const a = getFormatNumber(el, j === 0, dgt);
      const x = `x${j}`;
      expression += `${a}*${x}`;
    }

    const b = getFormatNumber(matrixB[i], true, dgt);
    linearSystem.push([`${expression} = ${b}`]);
  }

  linearSystem.matrixA = matrixA;
  linearSystem.matrixB = matrixB;

  return linearSystem;
}

function checkOnConvergence(matrixA, dgt) {
  const convergence = new LogTable({
    title: "Check on convergence",
    tableOptions: {
      head: ["check", "isCorrect"]
    }
  });
  convergence.setError("ok", "All is done!", "ok");

  for (let i = 0; i < matrixA.length; i++) {
    let expression = "";
    let sum = 0;
    let isCorrect = false;

    for (let j = 0; j < matrixA[i].length; j++) {
      const el = matrixA[i][j];
      if (j != i) {
        sum += el;
        const formatNumber = getFormatNumber(el, expression.length === 0, dgt);
        expression += `${formatNumber}`;
      }
    }

    if (matrixA[i][i] > sum) isCorrect = true;
    else convergence.setError("error", "Convergence check failed", "error");

    sum = getFormatNumber(sum, true, dgt);
    const centreEl = getFormatNumber(matrixA[i][i], true, dgt);
    convergence.push([`${centreEl} > ${expression} > ${sum}`, isCorrect]);
  }

  return convergence;
}

function iterationSystemFromMatrix(matrixA, matrixB, dgt) {
  const iterationSystem = new LogTable({
    title: "Iteration system"
  });
  iterationSystem.setError("ok", "All is done!", "ok");

  const { iterationMatrixA, iterationMatrixB } = getIterationMatrix(
    matrixA,
    matrixB
  );

  for (let i = 0; i < iterationMatrixA.length; i++) {
    let expression = getFormatNumber(iterationMatrixB[i], true, dgt);
    for (let j = 0; j < iterationMatrixA[i].length; j++) {
      if (i == j) continue;
      const el = iterationMatrixA[i][j];
      const a = getFormatNumber(-el, false, dgt);
      const x = `x${j}(${j > i ? "k" : "k+1"})`;
      expression += `${a}*${x}`;
    }

    const x = `x${i}(k+1)`;
    iterationSystem.push([`${x} = ${expression}`]);
  }

  return iterationSystem;
}

function resultTable(matrixA, matrixB, epsilon, dgt) {
  const resultTable = new LogTable({
    title: "Result table",
    tableOptions: {
      head: ["k", ..._times(matrixA.length, n => `x${n}`), "delta"]
    }
  });
  resultTable.setError("ok", "All is done!", "ok");

  const { iterationMatrixA, iterationMatrixB } = getIterationMatrix(
    matrixA,
    matrixB
  );
  const iterationFunctions = getIterationFunctions(
    iterationMatrixA,
    iterationMatrixB
  );
  let x = new Array(matrixA.length);
  x.fill(0);
  resultTable.push([0, ...x, "-"]);

  for (let k = 1; ; k++) {
    let maxDifference = 0;
    for (let i = 0; i < x.length; i++) {
      const newX = iterationFunctions[i](x);
      maxDifference = math.max(maxDifference, math.abs(newX - x[i]));
      x[i] = getFormatNumber(newX, true, dgt);
    }
    maxDifference = getFormatNumber(maxDifference, true, dgt);
    resultTable.push([k, ...x, maxDifference]);
    if (maxDifference < epsilon) break;
  }
  return resultTable.toString();
}

// my variant
const matrixA = [
  [3.857, 0.239, 0.272, 0.258],
  [0.491, 3.941, 0.131, 0.178],
  [0.436, 0.281, 4.189, 0.416],
  [0.317, 0.229, 0.326, 2.971]
];
const matrixB = [0.19, 0.179, 0.753, 0.86];

// example from labs
// const matrixA = [
//   [5.526, 0.305, 0.887, 0.037],
//   [0.658, 2.453, 0.678, 0.192],
//   [0.398, 0.232, 4.957, 0.567],
//   [0.081, 0.521, 0.192, 4.988]
// ];
// const matrixB = [0.774, 0.245, 0.343, 0.263];
const epsilon = 1e-3;
const dgt = 4;

console.log(gaussSeidelMethod(matrixA, matrixB, epsilon, dgt));
