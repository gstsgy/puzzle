// ==UserScript==
// @name         拼图
// @namespace    http://tampermonkey.net/
// @version      2025-08-12
// @description  自动拼图脚本
// @author       gstsgy
// @match        https://cn.bing.com/spotlight/imagepuzzle*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=polyt.cn
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
function solvePuzzle(start, target) {
  const dirs = [[-1,0], [1,0], [0,-1], [0,1]]; // 上、下、左、右
  const queue = [];
  const visited = new Set();

  queue.push({ board: start, steps: [] });
  visited.add(JSON.stringify(start));

  while (queue.length) {
    const { board, steps } = queue.shift();

    if (JSON.stringify(board) === JSON.stringify(target)) {
      return steps;
    }

    // 找到空格(0)的位置
    let x, y;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === 0) {
          x = i;
          y = j;
          break;
        }
      }
    }

    // 尝试四个方向移动
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < 3 && ny >= 0 && ny < 3) {
        const newBoard = board.map(row => [...row]);
        [newBoard[x][y], newBoard[nx][ny]] = [newBoard[nx][ny], newBoard[x][y]]; // 交换
        const strSteps = newBoard[x][y];
        const key = JSON.stringify(newBoard);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({
            board: newBoard,
            steps: [...steps, strSteps]
          });
        }
      }
    }
  }
  return null;
};
function smartClick(el) {
  //const el = document.querySelector(selector);
  //if (!el) return console.error('元素未找到');

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || getComputedStyle(el).pointerEvents === 'none') {
    return console.warn('元素不可点击');
  }

  // 随机位置
  const x = rect.left + 10 + Math.random() * (rect.width - 20);
  const y = rect.top + 10 + Math.random() * (rect.height - 20);

  // 随机延迟（模拟人类）
  //const delay = 400 + Math.random() * 1500;

  //setTimeout(() => {
    ['mousedown', 'mouseup', 'click'].forEach(type => {
      const evt = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: type === 'mousedown' ? 1 : 0
      });
      el.dispatchEvent(evt);
    });
    console.log(`✅ 点击完成 [${el}] at (${x|0}, ${y|0})`);
 // }, delay);
}
async function start(solution){

  if (solution) {
    console.log(solution);
    for (const solutionElement of solution) {
      await new Promise(resolve => setTimeout(()=>{
        const parentDiv = document.getElementById("tiles");
        const childDiv = parentDiv.querySelectorAll(':scope > div');
        let targetEle = null;
        childDiv.forEach(div=>{
          const value = div.querySelector('.tileNumber');
          if(value&&solutionElement===parseInt(value.innerHTML)){
              targetEle = div.querySelector('img');
          }
        })
        if(targetEle){
            smartClick(targetEle);
        }
        resolve();
      },Math.random()*400+400))
    }
  } else {
    console.log("无解");
  }
}

setTimeout(()=>{
 const parentDiv = document.getElementById('tiles'); // 获取父div

  const childDivs = parentDiv.querySelectorAll(':scope > div'); // 只选择直接子div
  const board = [];
// 遍历这些div
    childDivs.forEach(div => {
        const row = parseInt(div.getAttribute('x'));
        const col = parseInt(div.getAttribute('y'));
        if (!board[row]) board[row] = [];
        const value =div.querySelector('.tileNumber');

        if(value){

            board[row][col] = parseInt(value.innerText);
        }else{
            board[row][col] = 0;
        }
    });


const target = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0]
];
const solution = solvePuzzle(board, target);
console.log(solution)
start(solution);


},500);
})();
