<template>
  <div class="minesweeper" ref="minesweeper">
    <canvas
      :style="{
        width: state.cellSize * state.colNum + 'px',
        height: state.cellSize * state.rowNum + 'px'
      }"
      ref="canvas"
      @click="handleClick"
      @contextmenu="handleMenu"
    ></canvas>
    <div>{{ state.boomTags }}/{{ state.boomNum }}</div>
    <div>判断次数:{{ state.judgeTime }}</div>
    <el-button @click="restart">重开</el-button>
  </div>
</template>
<script lang="ts" setup>
import { useSettingStore } from '@/stores/setting';
import { onMounted, reactive, ref } from 'vue';

type CellType = {
  open: boolean;
  boom: boolean;
  number: number;
  tag?: boolean | null; //true:标记为炸弹,false怀疑是炸弹,null为不标记
};
const settingStore = useSettingStore();
const canvas = ref(null) as unknown as { value: HTMLCanvasElement };
let ctx: CanvasRenderingContext2D;
const state = reactive({
  cellSize: 25,
  rowNum: 20,
  colNum: 20,
  boomNum: 100,
  theme: getTheme(),
  gameOver: false,
  celldata: [] as Array<Array<CellType>>, //[[CellType]]
  cache: {
    grid: createCanvas()
  },
  boomTags: 0,
  rightTags: 0,
  judgeTime: 0
});

//生命周期
onMounted(() => {
  init();
});

//事件
function handleClick(e: MouseEvent) {
  if (!state.gameOver) {
    const { x, y } = identifyCell(e.offsetX, e.offsetY);
    state.judgeTime = 0;
    judgeOpen(x, y);
  } else {
    restart();
  }
}
function handleMenu(e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  if (!state.gameOver) {
    const { x, y } = identifyCell(e.offsetX, e.offsetY);
    const cell = state.celldata[y][x];
    if (!cell.open) {
      if (cell.tag === null || cell.tag === undefined) {
        cell.tag = true;
        state.boomTags++;
        if (cell.boom) {
          state.rightTags++;
        }
      } else if (cell.tag === true) {
        cell.tag = false;
        state.boomTags--;
        if (cell.boom) {
          state.rightTags--;
        }
      } else {
        cell.tag = null;
      }
      tagCell(x, y);
      if (state.rightTags === state.boomNum) {
        gameOver(true);
      }
    }
  } else {
    restart();
  }
}

//函数
/**
 * 初始化
 */
function init() {
  canvas.value.width = state.cellSize * state.colNum;
  canvas.value.height = state.cellSize * state.rowNum;
  state.cache.grid.canvas.width = canvas.value.width;
  state.cache.grid.canvas.height = canvas.value.height;
  ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D;
  if (ctx === null) {
    return;
  }
  drawGrid();
  createCellData();
  createBoom();
  startOpen();
  // drawTest();
}
/**
 * 重新开始
 */
function restart() {
  state.judgeTime = 0;
  state.gameOver = false;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  const grid = state.cache.grid;
  ctx.drawImage(grid.canvas, 0, 0, grid.canvas.width, grid.canvas.height);
  createCellData();
  createBoom();
  startOpen();
}
/**
 * 游戏结束
 * @param type 胜利/失败
 */
function gameOver(type?: boolean) {
  ctx.font = canvas.value.width / 5 + 'px bold serif';
  ctx.fillStyle = state.theme.lane;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(type ? '游戏胜利' : '游戏失败', canvas.value.width / 2, canvas.value.width / 2);
  state.gameOver = true;
}
/**
 * 确定点击的格子
 * @param x
 * @param y
 */
function identifyCell(x: number, y: number) {
  return { x: Math.floor(x / state.cellSize), y: Math.floor(y / state.cellSize) };
}
/**
 * 绘制格子
 */
function drawGrid() {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let y = 1; y < state.rowNum; y++) {
    ctx.moveTo(0, y * state.cellSize);
    ctx.lineTo(state.cellSize * state.colNum, y * state.cellSize);
  }
  for (let x = 1; x < state.colNum + 0; x++) {
    ctx.moveTo(x * state.cellSize, 0);
    ctx.lineTo(x * state.cellSize, state.cellSize * state.rowNum);
  }
  ctx.moveTo(0, 0);
  ctx.closePath();
  ctx.strokeStyle = state.theme.lane;
  ctx.stroke();
  state.cache.grid.ctx?.drawImage(canvas.value, 0, 0, canvas.value.width, canvas.value.height);
}
/**
 * 创建数据
 */
function createCellData() {
  state.celldata = [];
  for (let y = 0; y < state.rowNum; y++) {
    state.celldata.push([]);
    for (let x = 0; x < state.colNum; x++) {
      state.celldata[y].push({ open: false, boom: false, number: -1 });
    }
  }
}
function createBoom() {
  for (let i = 0; i < state.boomNum; i++) {
    let row = randomInt(0, state.rowNum - 1);
    let col = randomInt(0, state.colNum - 1);
    if (state.celldata[row][col].boom === true) {
      i--;
    } else {
      state.celldata[row][col].boom = true;
    }
  }
}

/**
 * 开始游戏时默认打开格子
 * @param number 第几圈
 */
function startOpen(number: number = 0) {
  //如果全图都找不到空白格则随便弄一个打开
  if (number > state.colNum / 2 && number > state.rowNum / 2) {
    for (let y = 0; y < state.rowNum; y++) {
      for (let x = 0; x < state.colNum; x++) {
        if (!state.celldata[y][x].boom) {
          judgeOpen(x, y);
          return;
        }
      }
    }
  }
  const x = Math.floor(state.colNum / 2);
  const y = Math.floor(state.rowNum / 2);
  if (number === 0) {
    if (!state.celldata[y][x].boom && adjacentBoom(x, y) < 1) {
      judgeOpen(x, y);
      return;
    } else {
      startOpen(number + 1);
    }
  } else {
    //遍历四边形上下两边
    for (let i = 0; i < 2 + number * 4; i++) {
      let _x = x - number + Math.floor(i / 2);
      let _y = y + (i % 2 === 0 ? number : number * -1);
      if (_x < 0 || _y < 0 || _x >= state.colNum || _y >= state.rowNum) {
        continue;
      }
      // console.log(_x, _y, adjacentBoom(_x, _y));

      if (!state.celldata[_y][_x].boom && adjacentBoom(_x, _y) < 1) {
        judgeOpen(_x, _y);
        console.log(_x, _y, state.celldata[_y][_x].boom);

        return;
      }
    }

    for (let i = 0; i < 2 + number * 4; i++) {
      let _x = x + (i % 2 === 0 ? number : number * -1);
      let _y = y - number + Math.floor(i / 2);
      if (_x < 0 || _y < 0 || _x >= state.colNum || _y >= state.rowNum) {
        continue;
      }
      // console.log(_x, _y, adjacentBoom(_x, _y));

      if (!state.celldata[_y][_x].boom && adjacentBoom(_x, _y) < 1) {
        judgeOpen(_x, _y);

        return;
      }
    }
    //没找到扩大一圈重新找
    startOpen(number + 1);
  }
}

/**
 * 判断点击是否打开此格子
 * @param x
 * @param y
 */
function judgeOpen(x: number, y: number) {
  const cell = state.celldata[y][x];
  state.judgeTime++;
  if (cell.tag === null || cell.tag === undefined) {
    if (cell.boom) {
      gameOver();
    } else {
      if (!cell.open) {
        cell.open = true;
        cell.number = adjacentBoom(x, y);
        openCell(x, y);
        if (cell.number < 1) {
          adjacentEach(x, y, (cell, _x, _y) => {
            // openCell(_x, _y);
            judgeOpen(_x, _y);
          });
          // openCell();
        }
      }

      // console.log(state.celldata[y][x].number);
    }
  }
}

/**
 * 打开此格子
 * @param x
 * @param y
 */
function openCell(x: number, y: number) {
  ctx.fillStyle = state.theme.openCell;
  ctx.fillRect(
    x * state.cellSize + 1,
    y * state.cellSize + 1,
    state.cellSize - 2,
    state.cellSize - 2
  );
  const boomNum = state.celldata[y][x].number;
  if (boomNum > 0) {
    ctx.font = '16px bold serif';
    ctx.fillStyle = state.theme.text[boomNum - 1];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      boomNum.toString(),
      x * state.cellSize + state.cellSize / 2,
      y * state.cellSize + state.cellSize / 2
    );
  }
}
/**
 * 标记此格子
 * @param x
 * @param y
 */
function tagCell(x: number, y: number) {
  const cell = state.celldata[y][x];
  ctx.font = '16px bold serif';
  ctx.fillStyle = state.theme.lane;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.clearRect(
    x * state.cellSize + 1,
    y * state.cellSize + 1,
    state.cellSize - 2,
    state.cellSize - 2
  );
  if (cell.tag !== null || (cell.tag !== undefined && cell.tag === true)) {
    ctx.fillText(
      '💣',
      x * state.cellSize + state.cellSize / 2,
      y * state.cellSize + state.cellSize / 2
    );
  } else {
    ctx.fillText(
      '?',
      x * state.cellSize + state.cellSize / 2,
      y * state.cellSize + state.cellSize / 2
    );
  }
}
/**
 * 循环遍历此格子四周
 * @param x
 * @param y
 * @param callback
 */
function adjacentEach(
  x: number,
  y: number,
  callback: { (cell: CellType, _x: number, _y: number): void }
) {
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      continue;
    }
    const _x = x - 1 + (i % 3);
    const _y = y - 1 + Math.floor(i / 3);
    if (_x < 0 || _y < 0 || _x >= state.colNum || _y >= state.rowNum) {
      continue;
    }
    // console.log(_x, _y);

    callback(state.celldata[_y][_x], _x, _y);
  }
}
/**
 * 判断四周的炸弹个数
 * @param x
 * @param y
 */
function adjacentBoom(x: number, y: number) {
  let num = 0;
  adjacentEach(x, y, (cell) => {
    if (cell.boom) {
      num++;
    }
  });
  return num;
}

/**
 * 测试
 */
function drawTest() {
  ctx.font = '16px bold serif';
  ctx.fillStyle = state.theme.lane;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let row = 0; row < state.celldata.length; row++) {
    const cols = state.celldata[row];
    for (let col = 0; col < cols.length; col++) {
      const cell = cols[col];
      ctx.fillText(
        cell.boom ? '1' : '0',
        col * state.cellSize + state.cellSize / 2,
        row * state.cellSize + state.cellSize / 2
      );
      // console.log(col * state.cellSize, row * state.cellSize);
    }
  }
}

/**
 * 创建一个画板
 */
function createCanvas() {
  const canvas = document.createElement('canvas');
  return { canvas, ctx: canvas.getContext('2d') as CanvasRenderingContext2D };
}
/**
 * 随机整数
 * @param min
 * @param max
 */
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
/**
 * 主题色
 */
function getTheme() {
  switch (settingStore.theme) {
    case 'dark':
      return {
        closeCell: 'transparent',
        openCell: 'rgb(70, 70, 71)',
        lane: 'rgb(204, 204, 204)',
        text: [
          '#409EFF',
          '#67C23A',
          '#E6A23C',
          '#F56C6C',
          '#337ecc',
          '#529b2e',
          '#b88230',
          '#c45656'
        ]
      };
    default:
      return {
        closeCell: 'transparent',
        openCell: 'rgb(50, 50, 51)',
        lane: 'rgb(51, 51, 51)',
        text: [
          '#409EFF',
          '#67C23A',
          '#E6A23C',
          '#F56C6C',
          '#337ecc',
          '#529b2e',
          '#b88230',
          '#c45656'
        ]
      };
  }
}
</script>
