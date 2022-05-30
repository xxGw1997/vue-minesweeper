import { BlockState } from "~/types";

const directions = [
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
];

export class GamePlay {
    state = ref<BlockState[][]>([]);
    mineGenerated = false;


    constructor(public width: number, public height: number) {
        this.reset()
    }

    reset() {
        this.mineGenerated = false
        this.state.value = Array.from({ length: this.height }, (_, y) =>
            Array.from(
                { length: this.width },
                (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false })
            )
        )
    }

    generateMines(state: BlockState[][], initial: BlockState) {
        for (const row of state) {
            for (const block of row) {
                if (Math.abs(initial.x - block.x) <= 1) continue;
                if (Math.abs(initial.y - block.y) <= 1) continue;
                block.mine = Math.random() < 0.2;
            }
        }
        this.updateNumber();
    }



    updateNumber() {
        this.state.value.forEach((raw) => {
            raw.forEach((block) => {
                if (block.mine) return;
                this.getSiblings(block).forEach((b) => {
                    if (b.mine) block.adjacentMines += 1;
                });
            });
        });
    }

    expendZero(block: BlockState) {
        if (block.adjacentMines) return;
        this.getSiblings(block).forEach((s) => {
            if (!s.revealed) {
                s.revealed = true;
                this.expendZero(s);
            }
        });
    }


    onClick(block: BlockState) {
        block.flagged = false;
        if (!this.mineGenerated) {
            this.generateMines(this.state.value, block);
            this.mineGenerated = true;
        }
        block.revealed = true;
        if (block.mine) {
            alert('BOOOM!')
        }
        this.expendZero(block);
        // checkGameState();
    }

    onRightClick(block: BlockState) {
        if (block.revealed) return;
        block.flagged = !block.flagged;
        // checkGameState();
    }



    getSiblings(block: BlockState) {
        return directions
            .map(([dx, dy]) => {
                const x2 = block.x + dx;
                const y2 = block.y + dy;
                if (x2 < 0 || y2 < 0 || x2 >= this.width || y2 >= this.height) return undefined;
                return this.state.value[y2][x2];
            })
            .filter(Boolean) as BlockState[];
    }


    checkGameState() {
        const blocks = this.state.value.flat();
        if (blocks.every((block) => block.revealed || block.flagged)) {
            if (blocks.every((block) => block.flagged && !block.mine))
                setTimeout(() => {
                    alert("Don't cheat yourself.");
                }, 500);
            else
                setTimeout(() => {
                    alert("Win!!");
                }, 500);
        }
    }
}