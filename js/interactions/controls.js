export class ControlsManager {
    constructor(onReset, onClearWalls, onRandomWalls, onRun, onStep, onStop, onSpeedChange) {
        this.setupButtons(onReset, onClearWalls, onRandomWalls, onRun, onStep, onStop);
        this.setupSpeedSlider(onSpeedChange);
    }

    setupButtons(onReset, onClearWalls, onRandomWalls, onRun, onStep, onStop) {
        document.getElementById('resetBtn').addEventListener('click', onReset);
        document.getElementById('clearWallsBtn').addEventListener('click', onClearWalls);
        document.getElementById('randomWallsBtn').addEventListener('click', onRandomWalls);
        document.getElementById('runBtn').addEventListener('click', onRun);
        document.getElementById('stepBtn').addEventListener('click', onStep);
        document.getElementById('stopBtn').addEventListener('click', onStop);
    }

    setupSpeedSlider(onSpeedChange) {
        const slider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (val < 0.6) speedValue.innerText = "Slow";
            else if (val > 1.4) speedValue.innerText = "Fast";
            else speedValue.innerText = "Normal";
            onSpeedChange(val);
        });
    }
}