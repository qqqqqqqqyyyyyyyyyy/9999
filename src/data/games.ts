export type GameCategory = 'all' | 'action' | 'casual' | 'puzzle' | 'shooting' | 'racing';

export interface Game {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  category: Exclude<GameCategory, 'all'>;
  cover: string;
  instructions: string[];
}

export const categories: { id: GameCategory; name: string; icon: string }[] = [
  { id: 'all', name: '全部', icon: 'Gamepad2' },
  { id: 'action', name: '动作', icon: 'Zap' },
  { id: 'casual', name: '休闲', icon: 'Coffee' },
  { id: 'puzzle', name: '益智', icon: 'Puzzle' },
  { id: 'shooting', name: '射击', icon: 'Crosshair' },
  { id: 'racing', name: '赛车', icon: 'Car' },
];

export const games: Game[] = [
  {
    id: '2048',
    name: '2048',
    nameCn: '2048',
    description: '经典的数字合并游戏，移动数字方块让它们成对合并，最终得到2048！',
    category: 'puzzle',
    cover: 'https://play-lh.googleusercontent.com/vq7pyJFMkbKBKPsJMwTPYsbMNyNxSIoLhvBFKQOlwM8ln8LfJLpUPFh5P4BnAQrJog',
    instructions: ['使用方向键或滑动屏幕移动方块', '相同数字的方块碰撞会合并', '目标是将数字加到2048'],
  },
  {
    id: 'tetris',
    name: 'Tetris',
    nameCn: '俄罗斯方块',
    description: '永恒的经典！旋转下落的方块，填满整行消除得分。',
    category: 'puzzle',
    cover: 'https://play-lh.googleusercontent.com/IH-hq0LFi4jKiFcU5qJNP1EEUA2HQyPZ8UhH3zqV4n5iGVZn7-xY-eLRiCAVjE-YYc',
    instructions: ['方向键控制方块移动', '上键旋转方块', '下键加速下落', '填满一行即可消除'],
  },
  {
    id: 'snake',
    name: 'Snake',
    nameCn: '贪吃蛇',
    description: '控制蛇的移动，吃掉食物让蛇变长，注意不要撞到墙壁或自己的身体！',
    category: 'casual',
    cover: 'https://play-lh.googleusercontent.com/Go0C1Dz9nKzNL-ovR2UL0HwAC9qYp3eJV3A8gCoJvPse6n-MT5Gjtj8QbJdUwwlVg',
    instructions: ['使用方向键控制蛇的移动方向', '吃掉食物得分并变长', '不要撞到墙壁或自己的身体'],
  },
  {
    id: 'brickbreaker',
    name: 'Brick Breaker',
    nameCn: '打砖块',
    description: '用弹球击碎所有的砖块，控制好挡板的角度和力度！',
    category: 'action',
    cover: 'https://play-lh.googleusercontent.com/0VH6N6XvWxrJZ5WgftJ9l2bwMZYMWHbfJVfC9bp0Bvhc4QdGMtm9h5a8W-gZFQZ6lg',
    instructions: ['鼠标或方向键控制挡板', '反弹球击碎砖块', '球掉落则失去一条生命'],
  },
  {
    id: 'flappybird',
    name: 'Flappy Bird',
    nameCn: '飞翔的小鸟',
    description: '点击或按空格键让小鸟飞翔，穿过管道缝隙，看看你能飞多远！',
    category: 'casual',
    cover: 'https://play-lh.googleusercontent.com/wL7X4-YJqQjE4r5kJP3X346K8CjX0c2l_WuDwR4iV4s8gL8hQ4Z5p6r7s8t9u0v',
    instructions: ['点击屏幕或按空格键让小鸟向上飞', '穿过管道缝隙得分', '碰到管道或地面游戏结束'],
  },
];
