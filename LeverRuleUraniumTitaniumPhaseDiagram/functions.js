// U-Ti Phase Diagram Functions
// Translated from Mathematica code

// Phase diagram constants (from Mathematica code)
const pureTiU2x = 2/3;
const e1T = 655;
const e2T = 720;
const e1x = 0.28;
const e2x = 0.95;
const pureTiT = 882;
const pureUT = 770;
const pureTiU2T = 890;

// Helper functions
function slope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function intercept(x1, y1, x2, y2) {
    return (x1 * y2 - x2 * y1) / (x1 - x2);
}

function phaseBoundary(x1, y1, x2, y2, x) {
    return slope(x1, y1, x2, y2) * x + intercept(x1, y1, x2, y2);
}

function xFromT(x1, y1, x2, y2, T) {
    return (T - intercept(x1, y1, x2, y2)) / slope(x1, y1, x2, y2);
}

function lever1Amount(lever1, lever2) {
    return (lever2 / lever1) / (1 + (lever2 / lever1));
}

function lever2Amount(lever1, lever2) {
    return 1 - lever1Amount(lever1, lever2);
}

// Main drawing function for phase diagram
function drawPhaseDiagram() {
    push();
    
    // Draw main graph frame
    strokeWeight(1);
    stroke(0);
    noFill();
    rect(g.lx, g.ty, g.rx - g.lx, g.by - g.ty);
    
    // Draw phase boundaries
    stroke(0);
    strokeWeight(2);
    noFill();
    
    // pb1: Ti solid to e1 (liquidus from Ti)
    beginShape();
    for(let x = 0; x <= e1x; x += 0.01) {
        let T = phaseBoundary(0, pureTiT, e1x, e1T, x);
        let px = map(x, 0, 1, g.lx, g.rx);
        let py = map(T, 600, 925, g.by, g.ty);
        vertex(px, py);
    }
    endShape();
    
    // pb2: e1 to TiU2 (liquidus)
    beginShape();
    for(let x = e1x; x <= pureTiU2x; x += 0.01) {
        let T = phaseBoundary(e1x, e1T, pureTiU2x, pureTiU2T, x);
        let px = map(x, 0, 1, g.lx, g.rx);
        let py = map(T, 600, 925, g.by, g.ty);
        vertex(px, py);
    }
    endShape();
    
    // pb3: TiU2 to e2 (liquidus)
    beginShape();
    for(let x = pureTiU2x; x <= e2x; x += 0.01) {
        let T = phaseBoundary(pureTiU2x, pureTiU2T, e2x, e2T, x);
        let px = map(x, 0, 1, g.lx, g.rx);
        let py = map(T, 600, 925, g.by, g.ty);
        vertex(px, py);
    }
    endShape();
    
    // pb4: e2 to U solid (liquidus from U)
    beginShape();
    for(let x = e2x; x <= 1; x += 0.01) {
        let T = phaseBoundary(e2x, e2T, 1, pureUT, x);
        let px = map(x, 0, 1, g.lx, g.rx);
        let py = map(T, 600, 925, g.by, g.ty);
        vertex(px, py);
    }
    endShape();
    
    // pb5: Horizontal line at e1T from Ti to TiU2
    let e1Ty = map(e1T, 600, 925, g.by, g.ty);
    line(g.lx, e1Ty, map(pureTiU2x, 0, 1, g.lx, g.rx), e1Ty);
    
    // pb6: Horizontal line at e2T from TiU2 to U
    let e2Ty = map(e2T, 600, 925, g.by, g.ty);
    line(map(pureTiU2x, 0, 1, g.lx, g.rx), e2Ty, g.rx, e2Ty);
    
    // pb7: Vertical line from bottom to TiU2 compound point
    let TiU2x = map(pureTiU2x, 0, 1, g.lx, g.rx);
    let TiU2y = map(pureTiU2T, 600, 925, g.by, g.ty);
    line(TiU2x, g.by, TiU2x, TiU2y);
    
    // Draw axis labels and tick marks
    drawAxes();
    
    pop();
}

function drawAxes() {
    push();
    
    // Y-axis tick marks and labels
    strokeWeight(1);
    stroke(0);
    let yLabels = ['600', '650', '700', '750', '800', '850', '900'];
    for(let i = 0; i <= 6; i++) {
        let T = 600 + i * 50;
        let y = map(T, 600, 925, g.by, g.ty);
        line(g.lx, y, g.lx + 7, y);
        line(g.rx, y, g.rx - 7, y);
        
        push();
        noStroke();
        textSize(12);
        textAlign(RIGHT, CENTER);
        text(yLabels[i], g.lx - 10, y);
        pop();
    }
    
    // X-axis tick marks and labels
    let xLabels = ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'];
    for(let i = 0; i <= 5; i++) {
        let x = i * 0.2;
        let px = map(x, 0, 1, g.lx, g.rx);
        line(px, g.by, px, g.by - 7);
        line(px, g.ty, px, g.ty + 7);
        
        push();
        noStroke();
        textSize(12);
        textAlign(CENTER, TOP);
        text(xLabels[i], px, g.by + 10);
        pop();
    }
    
    // Axis labels
    noStroke();
    textSize(16);
    textAlign(CENTER);
    text('mole fraction uranium x_U', (g.lx + g.rx) / 2, g.by + 35);
    
    push();
    translate(g.lx - 45, (g.ty + g.by) / 2);
    rotate(-PI / 2);
    text('temperature (°C)', 0, 0);
    pop();
    
    pop();
}

function drawPhasePoint() {
    let px = map(g.pointX, 0, 1, g.lx, g.rx);
    let py = map(g.pointT, 600, 925, g.by, g.ty);
    
    // Determine which phase region the point is in and draw accordingly
    let phaseInfo = determinePhaseRegion(g.pointX, g.pointT);
    
    push();
    
    // Draw tie lines and phase points based on region
    if(phaseInfo.type === "two-phase") {
        // Draw dashed tie line
        drawingContext.setLineDash([5, 5]);
        strokeWeight(2);
        
        if(phaseInfo.phase1 === "Ti") {
            stroke(g.solidTi);
            let x1 = map(0, 0, 1, g.lx, g.rx);
            let y1 = map(g.pointT, 600, 925, g.by, g.ty);
            line(x1, y1, px, py);
            
            // Dotted line down from Ti
            drawingContext.setLineDash([2, 6]);
            strokeWeight(1.5);
            line(x1, y1, x1, g.by);
            
            // Draw Ti point
            noStroke();
            fill(g.solidTi);
            ellipse(x1, y1, 2 * g.radius);
        }
        
        if(phaseInfo.phase2 === "TiU2") {
            drawingContext.setLineDash([5, 5]);
            strokeWeight(2);
            stroke(g.solidTiU2);
            let x2 = map(pureTiU2x, 0, 1, g.lx, g.rx);
            let y2 = map(g.pointT, 600, 925, g.by, g.ty);
            line(px, py, x2, y2);
            
            // Dotted line down from TiU2
            drawingContext.setLineDash([2, 6]);
            strokeWeight(1.5);
            line(x2, y2, x2, g.by);
            
            // Draw TiU2 point
            noStroke();
            fill(g.solidTiU2);
            ellipse(x2, y2, 2 * g.radius);
        }
        
        if(phaseInfo.phase2 === "U") {
            drawingContext.setLineDash([5, 5]);
            strokeWeight(2);
            stroke(g.solidU);
            let x2 = map(1, 0, 1, g.lx, g.rx);
            let y2 = map(g.pointT, 600, 925, g.by, g.ty);
            line(px, py, x2, y2);
            
            // Dotted line down from U
            drawingContext.setLineDash([2, 6]);
            strokeWeight(1.5);
            line(x2, y2, x2, g.by);
            
            // Draw U point
            noStroke();
            fill(g.solidU);
            ellipse(x2, y2, 2 * g.radius);
        }
        
        if(phaseInfo.phase1 === "Liquid") {
            drawingContext.setLineDash([5, 5]);
            strokeWeight(2);
            stroke(g.liquid);
            let x1 = map(phaseInfo.liquidX, 0, 1, g.lx, g.rx);
            let y1 = map(g.pointT, 600, 925, g.by, g.ty);
            line(x1, y1, px, py);
            
            // Dotted line down
            drawingContext.setLineDash([2, 6]);
            strokeWeight(1.5);
            line(x1, y1, x1, g.by);
            
            // Draw liquid point
            noStroke();
            fill(g.liquid);
            ellipse(x1, y1, 2 * g.radius);
        }
    }
    
    // Draw main point
    noStroke();
    if(phaseInfo.type === "single-phase") {
        if(phaseInfo.phase1 === "Liquid") {
            fill(g.liquid);
        } else if(phaseInfo.phase1 === "Ti") {
            fill(g.solidTi);
        } else if(phaseInfo.phase1 === "TiU2") {
            fill(g.solidTiU2);
        } else if(phaseInfo.phase1 === "U") {
            fill(g.solidU);
        }
    } else {
        fill(150, 0, 150); // Purple for two-phase
    }
    ellipse(px, py, 2 * g.radius);
    
    // Draw dotted line from point down
    if(phaseInfo.type === "single-phase" || phaseInfo.type === "two-phase") {
        drawingContext.setLineDash([2, 6]);
        strokeWeight(1.5);
        if(phaseInfo.type === "single-phase" && phaseInfo.phase1 === "Liquid") {
            stroke(g.liquid);
        } else {
            stroke(g.liquid);
        }
        line(px, py, px, g.by);
    }
    
    pop();
}

function determinePhaseRegion(x, T) {
    // Determine which phase region the point is in
    
    // Check pure components first
    if(x === 0) {
        return {type: "single-phase", phase1: "Ti"};
    }
    if(x === 1) {
        return {type: "single-phase", phase1: "U"};
    }
    
    // Check if in left region (x < pureTiU2x)
    if(x < pureTiU2x) {
        if(T < e1T) {
            // Two-phase: Ti(s) + TiU2(s)
            return {type: "two-phase", phase1: "Ti", phase2: "TiU2"};
        } else {
            // Above eutectic
            if(x < e1x) {
                // Check if above liquidus
                let liquidusT = phaseBoundary(0, pureTiT, e1x, e1T, x);
                if(T >= liquidusT) {
                    // Liquid region
                    return {type: "single-phase", phase1: "Liquid"};
                } else {
                    // Two-phase: Ti(s) + Liquid
                    let liquidX = xFromT(0, pureTiT, e1x, e1T, T);
                    return {type: "two-phase", phase1: "Ti", phase2: "Liquid", liquidX: liquidX};
                }
            } else {
                // x >= e1x
                let liquidusT = phaseBoundary(e1x, e1T, pureTiU2x, pureTiU2T, x);
                if(T >= liquidusT) {
                    // Liquid region
                    return {type: "single-phase", phase1: "Liquid"};
                } else {
                    // Two-phase: Liquid + TiU2(s)
                    let liquidX = xFromT(e1x, e1T, pureTiU2x, pureTiU2T, T);
                    return {type: "two-phase", phase1: "Liquid", phase2: "TiU2", liquidX: liquidX};
                }
            }
        }
    }
    
    // Check if in right region (x >= pureTiU2x)
    if(x >= pureTiU2x) {
        if(T < e2T) {
            // Two-phase: TiU2(s) + U(s)
            return {type: "two-phase", phase1: "TiU2", phase2: "U"};
        } else {
            // Above eutectic
            if(x < e2x) {
                let liquidusT = phaseBoundary(pureTiU2x, pureTiU2T, e2x, e2T, x);
                if(T >= liquidusT) {
                    // Liquid region
                    return {type: "single-phase", phase1: "Liquid"};
                } else {
                    // Two-phase: TiU2(s) + Liquid
                    let liquidX = xFromT(pureTiU2x, pureTiU2T, e2x, e2T, T);
                    return {type: "two-phase", phase1: "TiU2", phase2: "Liquid", liquidX: liquidX};
                }
            } else {
                // x >= e2x
                let liquidusT = phaseBoundary(e2x, e2T, 1, pureUT, x);
                if(T >= liquidusT) {
                    // Liquid region
                    return {type: "single-phase", phase1: "Liquid"};
                } else {
                    // Two-phase: Liquid + U(s)
                    let liquidX = xFromT(e2x, e2T, 1, pureUT, T);
                    return {type: "two-phase", phase1: "Liquid", phase2: "U", liquidX: liquidX};
                }
            }
        }
    }
    
    return {type: "single-phase", phase1: "Liquid"};
}

function drawBarChart() {
    // Calculate phase amounts
    let phaseAmounts = calculatePhaseAmounts(g.pointX, g.pointT);
    
    // Bar chart position (right side)
    let barX = g.rx + 20;
    let barY = g.by - 40;
    let barWidth = 35;
    let barHeight = 300;
    
    push();
    
    // Draw frame
    strokeWeight(1);
    stroke(0);
    noFill();
    rect(barX, barY - barHeight, barWidth * 4 + 15, barHeight);
    
    // Draw bars
    strokeWeight(0.5);
    
    // Liquid (red)
    fill(g.liquid);
    rect(barX + 5, barY, barWidth, -phaseAmounts.liquid * barHeight);
    
    // Ti(s) (blue)
    fill(g.solidTi);
    rect(barX + barWidth + 10, barY, barWidth, -phaseAmounts.Ti * barHeight);
    
    // TiU2(s) (green)
    fill(g.solidTiU2);
    rect(barX + 2 * barWidth + 15, barY, barWidth, -phaseAmounts.TiU2 * barHeight);
    
    // U(s) (brown)
    fill(g.solidU);
    rect(barX + 3 * barWidth + 20, barY, barWidth, -phaseAmounts.U * barHeight);
    
    // Y-axis labels
    noStroke();
    fill(0);
    textSize(11);
    textAlign(RIGHT, CENTER);
    for(let i = 0; i <= 5; i++) {
        let val = i * 0.2;
        let y = barY - val * barHeight;
        text(val.toFixed(1), barX - 5, y);
    }
    
    // Labels below bars
    textSize(11);
    textAlign(CENTER, TOP);
    text("liquid", barX + barWidth / 2 + 5, barY + 5);
    text("Ti(s)", barX + barWidth + barWidth / 2 + 10, barY + 5);
    text("TiU₂(s)", barX + 2 * barWidth + barWidth / 2 + 15, barY + 5);
    text("U(s)", barX + 3 * barWidth + barWidth / 2 + 20, barY + 5);
    
    // Title
    textSize(14);
    textAlign(CENTER);
    text("relative amounts", barX + (barWidth * 4 + 15) / 2, g.ty + 15);
    
    // Display liquid composition if present
    if(phaseAmounts.liquid > 0 && phaseAmounts.liquidComp !== undefined) {
        textSize(12);
        text("x_U = " + phaseAmounts.liquidComp.toFixed(2), barX + (barWidth * 4 + 15) / 2, barY - barHeight - 15);
    }
    
    pop();
}

function calculatePhaseAmounts(x, T) {
    let amounts = {
        liquid: 0,
        Ti: 0,
        TiU2: 0,
        U: 0,
        liquidComp: undefined
    };
    
    let phaseInfo = determinePhaseRegion(x, T);
    
    if(phaseInfo.type === "single-phase") {
        if(phaseInfo.phase1 === "Liquid") {
            amounts.liquid = 1;
            amounts.liquidComp = x;
        } else if(phaseInfo.phase1 === "Ti") {
            amounts.Ti = 1;
        } else if(phaseInfo.phase1 === "TiU2") {
            amounts.TiU2 = 1;
        } else if(phaseInfo.phase1 === "U") {
            amounts.U = 1;
        }
    } else if(phaseInfo.type === "two-phase") {
        // Apply lever rule
        if(phaseInfo.phase1 === "Ti" && phaseInfo.phase2 === "TiU2") {
            let lever1 = Math.abs(0 - x);
            let lever2 = Math.abs(x - pureTiU2x);
            amounts.Ti = lever1Amount(lever1, lever2);
            amounts.TiU2 = lever2Amount(lever1, lever2);
        } else if(phaseInfo.phase1 === "TiU2" && phaseInfo.phase2 === "U") {
            let lever1 = Math.abs(pureTiU2x - x);
            let lever2 = Math.abs(x - 1);
            amounts.TiU2 = lever1Amount(lever1, lever2);
            amounts.U = lever2Amount(lever1, lever2);
        } else if(phaseInfo.phase1 === "Ti" && phaseInfo.phase2 === "Liquid") {
            let lever1 = Math.abs(0 - x);
            let lever2 = Math.abs(x - phaseInfo.liquidX);
            amounts.Ti = lever1Amount(lever1, lever2);
            amounts.liquid = lever2Amount(lever1, lever2);
            amounts.liquidComp = phaseInfo.liquidX;
        } else if(phaseInfo.phase1 === "Liquid" && phaseInfo.phase2 === "TiU2") {
            let lever1 = Math.abs(phaseInfo.liquidX - x);
            let lever2 = Math.abs(x - pureTiU2x);
            amounts.liquid = lever1Amount(lever1, lever2);
            amounts.TiU2 = lever2Amount(lever1, lever2);
            amounts.liquidComp = phaseInfo.liquidX;
        } else if(phaseInfo.phase1 === "TiU2" && phaseInfo.phase2 === "Liquid") {
            let lever1 = Math.abs(pureTiU2x - x);
            let lever2 = Math.abs(x - phaseInfo.liquidX);
            amounts.TiU2 = lever1Amount(lever1, lever2);
            amounts.liquid = lever2Amount(lever1, lever2);
            amounts.liquidComp = phaseInfo.liquidX;
        } else if(phaseInfo.phase1 === "Liquid" && phaseInfo.phase2 === "U") {
            let lever1 = Math.abs(phaseInfo.liquidX - x);
            let lever2 = Math.abs(x - 1);
            amounts.liquid = lever1Amount(lever1, lever2);
            amounts.U = lever2Amount(lever1, lever2);
            amounts.liquidComp = phaseInfo.liquidX;
        }
    }
    
    return amounts;
}
