class TreasureMap {
    static async getClue(step) {
        const clues = [
            "在古老的图书馆里，你发现了一本神秘的书籍，书中记载着一个古老的传说。传说中，有一个隐藏在深山中的神庙，里面藏有无尽的宝藏。",
            "你跟随线索来到了神庙，神庙的入口被一块巨大的石门封锁，上面刻着奇怪的符号，似乎是一个谜题。",
            "你解开了石门的谜题，进入神庙内部，发现了一个巨大的石碑，上面刻着警告：‘只有真正的勇士才能通过接下来的考验。’",
            "你继续深入神庙，发现了一个巨大的宝箱，但是宝箱被一个复杂的锁保护着，需要一个密码才能打开。",
            "你输入了正确的密码，宝箱打开了，里面装满了金银财宝！你找到了传说中的宝藏！"
        ];
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(clues[step]);
            }, 1000);
        });
    }
}

let currentStep = 0;
let steps = [
    { text: '', image: 'library' },
    { text: '', image: 'temple' },
    { text: '', image: 'puzzle' },
    { text: '', image: 'treasureBox' },
    { text: '', image: 'treasure' }
];

let playerInfo = JSON.parse(localStorage.getItem('playerInfo')) || {
    playerId: generateUniqueId(),
    nickname: '',
    history: []
};

// 检查并保存玩家昵称
document.getElementById('nicknameInput').addEventListener('input', function(e) {
    playerInfo.nickname = e.target.value;
    localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
});

// 显示玩家历史记录
function displayPlayerHistory() {
    if (playerInfo.history.length > 0) {
        alert('Welcome back, ' + playerInfo.nickname + '! Here is your adventure history:\n' + playerInfo.history.join('\n'));
    }
}

// 显示玩家信息
document.getElementById('adventureLog').innerHTML = 'Welcome back, ' + (playerInfo.nickname || 'Adventurer') + '!';

// 生成唯一玩家ID
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// 初始化音乐播放器
document.getElementById('backgroundMusic').volume = 0.5; // 设置音量为50%
document.getElementById('backgroundMusic').play(); // 自动播放背景音乐

// 音乐播放控制
document.getElementById('playPauseButton').addEventListener('click', function() {
    const music = document.getElementById('backgroundMusic');
    if (music.paused) {
        music.play();
        this.textContent = 'Pause Music';
    } else {
        music.pause();
        this.textContent = 'Play Music';
    }
});

function displayAdventureStep(step) {
    const adventureLog = document.getElementById('adventureLog');
    adventureLog.innerHTML = ''; // 清空日志
    const stepElement = document.createElement('div');
    stepElement.textContent = step.text;
    stepElement.classList.add('step', 'show'); // 立即显示
    adventureLog.appendChild(stepElement);

    document.querySelectorAll('.image-step').forEach(img => {
        img.style.display = 'none'; // 隐藏所有图片
        img.classList.remove('active');
    });

    if (step.image) {
        const imageElement = document.getElementById(step.image);
        imageElement.style.display = 'block'; // 显示当前图片
        imageElement.classList.add('active');
    }
}

// 异步加载数据
async function loadGameData() {
    try {
        const response = await fetch('decoded-clue.txt');
        const data = await response.text();
        const gameData = JSON.parse(data);
        steps.forEach((step, index) => {
            step.text = gameData[step.image] || 'No description available.';
        });
        steps[0].text = await TreasureMap.getClue(0); // 加载第一步的线索
        displayAdventureStep(steps[0]); // 显示第一步
    } catch (error) {
        console.error('Error loading the game data:', error);
    }
}

// 页面加载完毕后显示玩家历史记录
window.onload = function() {
    loadGameData();
    displayPlayerHistory();
};

async function loadNextStep() {
    if (currentStep < steps.length - 1) {
        steps[currentStep + 1].text = await TreasureMap.getClue(currentStep + 1);
        displayAdventureStep(steps[currentStep + 1]);
        playerInfo.history.push(steps[currentStep + 1].text);
        localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
        currentStep++;
    } else {
        document.getElementById('nextButton').disabled = true;
        document.getElementById('treasurePassword').style.display = 'block'; // 显示密码输入框
        document.getElementById('unlockTreasureButton').disabled = false; // 启用解锁按钮
    }
}

document.getElementById('startButton').addEventListener('click', async () => {
    currentStep = 0;
    document.getElementById('nextButton').disabled = false;
    document.getElementById('treasurePassword').value = ''; // 清空密码输入框
    document.getElementById('treasurePassword').style.display = 'none'; // 隐藏密码输入框
    document.getElementById('unlockTreasureButton').disabled = true; // 禁用解锁按钮
    await loadNextStep();
});

document.getElementById('nextButton').addEventListener('click', loadNextStep);

document.getElementById('unlockTreasureButton').addEventListener('click', () => {
    const password = document.getElementById('treasurePassword').value;
    if (password === 'treasure') {
        document.getElementById('treasurePassword').style.display = 'none'; // 隐藏密码输入框
        displayAdventureStep(steps[currentStep]);
        playerInfo.history.push(steps[currentStep].text);
        localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
        currentStep++;
        if (currentStep === steps.length) {
            document.getElementById('nextButton').disabled = true;
            document.getElementById('unlockTreasureButton').disabled = true;
            alert("恭喜你，找到了宝藏！");
        }
    } else {
        document.getElementById('unlockTreasureButton').classList.add('shake');
        setTimeout(() => {
            document.getElementById('unlockTreasureButton').classList.remove('shake');
        }, 500);
        alert('密码错误！请再试一次。');
    }
});
