document.addEventListener("DOMContentLoaded", () => {
    const svg = document.getElementById('connections');
    const container = document.getElementById('diagram-container');

    // 8 Distinct Colors for 8 Flows
    const COLORS = {
        flow1: '#d6336c', // Pink
        flow2: '#1a53ff', // Blue
        flow3: '#e67700', // Orange
        flow4: '#7b2ff7', // Purple
        flow5: '#0ca678', // Green
        flow6: '#c92a2a', // Red
        flow7: '#b8860b', // Gold
        flow8: '#0077b6'  // Cyan
    };

    function resizeSVG() {
        svg.setAttribute('width',   container.offsetWidth);
        svg.setAttribute('height',  container.offsetHeight);
        svg.setAttribute('viewBox', `0 0 ${container.offsetWidth} ${container.offsetHeight}`);
    }

    resizeSVG();
    window.addEventListener('resize', () => { resizeSVG(); drawAllFlows(); });

    function getPoint(id, side = 'center', offset = { x: 0, y: 0 }) {
        const el = document.getElementById(id);
        if (!el) return { x: 0, y: 0 };

        const r  = el.getBoundingClientRect();
        const cr = container.getBoundingClientRect();

        let x = r.left - cr.left;
        let y = r.top  - cr.top;

        if (side.includes('top')) y += 0;
        else if (side.includes('bottom')) y += r.height;
        else y += r.height / 2;

        if (side.includes('left')) x += 0;
        else if (side.includes('right')) x += r.width;
        else x += r.width / 2;

        return { x: x + offset.x, y: y + offset.y };
    }

    function drawPath(p1, p2, color, style = 'solid', label = '', curveDir = 'down') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const markerId = `arrow-${color.replace('#', '')}`;
        
        if (!document.getElementById(markerId)) {
            const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', markerId);
            marker.setAttribute('viewBox', '0 0 10 10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '5');
            marker.setAttribute('markerWidth', '5');
            marker.setAttribute('markerHeight', '5');
            marker.setAttribute('orient', 'auto-start-reverse');
            const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            mpath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
            mpath.setAttribute('fill', color);
            marker.appendChild(mpath);
            defs.appendChild(marker);
        }

        const dx = Math.abs(p2.x - p1.x);
        const dy = Math.abs(p2.y - p1.y);
        let cp1x = p1.x, cp1y = p1.y;
        let cp2x = p2.x, cp2y = p2.y;

        if (curveDir === 'down') {
            cp1y += Math.max(dy * 0.4, 40);
            cp2y -= Math.max(dy * 0.4, 40);
        } else if (curveDir === 'up') {
            cp1y -= Math.max(dy * 0.4, 40);
            cp2y += Math.max(dy * 0.4, 40);
        } else if (curveDir === 'inner-up') {
            cp1y -= 50;
            cp2y -= 50;
        } else if (curveDir === 'inner-down') {
            cp1y += 50;
            cp2y += 50;
        }

        path.setAttribute('d', `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', `url(#${markerId})`);

        if (style === 'dashed') {
            path.setAttribute('stroke-dasharray', '8,5');
        }

        svg.appendChild(path);

        if (label) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', p1.x + (p2.x - p1.x) * 0.3);
            text.setAttribute('y', p1.y + (p2.y - p1.y) * 0.3 - 5);
            text.setAttribute('fill', color);
            text.setAttribute('font-size', '10px');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = label;
            svg.appendChild(text);
        }
    }

    function drawAllFlows() {
        svg.innerHTML = '<defs></defs>';
        
        const TOP_IN = { x: -5, y: -2 };
        const TOP_OUT = { x: 5, y: -2 };
        const BOT_IN = { x: -5, y: 2 };
        const BOT_OUT = { x: 5, y: 2 };

        // Cloud bundle offsets
        const cloudBundle = (i) => ({ x: (i - 4.5) * 8, y: 0 });

        // --- MODULE 1 ---
        
        // Flow 1: Cybernet IN -> P9 (Solid) -> P1 (Dashed) -> DPI-1 (Dashed) -> P1 (Solid) -> P11 (Dashed) + Mirror P10 (Dashed) -> MIRROR DPI-1
        const c1 = COLORS.flow1;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(1)), getPoint('m1-p9', 'top', TOP_IN), c1, 'solid', 'IN', 'down');
        drawPath(getPoint('m1-p9', 'top', TOP_OUT), getPoint('m1-p1', 'top', TOP_IN), c1, 'dashed', 'Logical', 'inner-up');
        drawPath(getPoint('m1-p1', 'bottom', BOT_OUT), getPoint('dpi-1', 'top', {x:-20, y:0}), c1, 'dashed', 'Uplink', 'down');
        drawPath(getPoint('dpi-1', 'top', {x:-10, y:0}), getPoint('m1-p1', 'bottom', BOT_IN), c1, 'solid', 'Downlink', 'up');
        drawPath(getPoint('m1-p1', 'bottom', BOT_OUT), getPoint('m1-p11', 'top', TOP_IN), c1, 'dashed', 'Output P11', 'down');
        drawPath(getPoint('m1-p11', 'top', TOP_OUT), getPoint('cloud-out', 'bottom', cloudBundle(1)), c1, 'dashed', 'OUT', 'up');
        // Mirror P10
        drawPath(getPoint('m1-p10', 'bottom', BOT_OUT), getPoint('mirror-dpi-1', 'top', {x:-20, y:0}), c1, 'dashed', 'Mirror P10', 'down');

        // Flow 2: Cloud IN -> P11 -> P3 -> P9 -> Cloud OUT
        const c2 = COLORS.flow2;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(2)), getPoint('m1-p11', 'top', TOP_IN), c2, 'solid', 'IN', 'down');
        drawPath(getPoint('m1-p11', 'top', TOP_OUT), getPoint('m1-p3', 'top', TOP_IN), c2, 'dashed', 'P11 → P3', 'inner-up');
        drawPath(getPoint('m1-p3', 'bottom', BOT_OUT), getPoint('m1-p9', 'bottom', BOT_IN), c2, 'dashed', 'P3 → P9', 'inner-down');
        drawPath(getPoint('m1-p9', 'top', TOP_OUT), getPoint('cloud-out', 'bottom', cloudBundle(2)), c2, 'dashed', 'OUT', 'up');

        // Flow 3: Cloud IN -> P13 -> P5 -> P15 -> Cloud OUT
        const c3 = COLORS.flow3;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(3)), getPoint('m1-p13', 'top', TOP_IN), c3, 'solid', 'IN', 'down');
        drawPath(getPoint('m1-p13', 'top', TOP_OUT), getPoint('m1-p5', 'top', TOP_IN), c3, 'dashed', 'P13 → P5', 'inner-up');
        drawPath(getPoint('m1-p5', 'bottom', BOT_OUT), getPoint('m1-p15', 'bottom', BOT_IN), c3, 'dashed', 'P5 → P15', 'inner-down');
        drawPath(getPoint('m1-p15', 'top', TOP_OUT), getPoint('cloud-out', 'bottom', cloudBundle(3)), c3, 'dashed', 'OUT', 'up');

        // Flow 4: Cloud IN -> P15 -> P7 -> P13 -> Cloud OUT
        const c4 = COLORS.flow4;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(4)), getPoint('m1-p15', 'top', TOP_IN), c4, 'solid', 'IN', 'down');
        drawPath(getPoint('m1-p15', 'top', TOP_OUT), getPoint('m1-p7', 'top', TOP_IN), c4, 'dashed', 'P15 → P7', 'inner-up');
        drawPath(getPoint('m1-p7', 'top', TOP_OUT), getPoint('m1-p13', 'top', TOP_OUT), c4, 'dashed', 'P7 → P13', 'inner-up');
        drawPath(getPoint('m1-p13', 'top', TOP_IN), getPoint('cloud-out', 'bottom', cloudBundle(4)), c4, 'dashed', 'OUT', 'up');


        // --- MODULE 2 ---
        
        // Flow 5: Cloud IN -> P9 -> P1 -> P11 -> Cloud OUT
        const c5 = COLORS.flow5;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(5)), getPoint('m2-p9', 'top', TOP_IN), c5, 'solid', 'IN', 'down');
        drawPath(getPoint('m2-p9', 'top', TOP_OUT), getPoint('m2-p1', 'top', TOP_IN), c5, 'dashed', 'P9 → P1', 'inner-up');
        drawPath(getPoint('m2-p1', 'bottom', BOT_OUT), getPoint('m2-p11', 'bottom', BOT_IN), c5, 'dashed', 'P1 → P11', 'inner-down');
        drawPath(getPoint('m2-p11', 'top', TOP_OUT), getPoint('cloud-out', 'bottom', cloudBundle(5)), c5, 'dashed', 'OUT', 'up');

        // Flow 6: Cloud IN -> P11 -> P3 -> P9 -> Cloud OUT
        const c6 = COLORS.flow6;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(6)), getPoint('m2-p11', 'top', TOP_IN), c6, 'solid', 'IN', 'down');
        drawPath(getPoint('m2-p11', 'top', TOP_OUT), getPoint('m2-p3', 'top', TOP_IN), c6, 'dashed', 'P11 → P3', 'inner-up');
        drawPath(getPoint('m2-p3', 'top', TOP_OUT), getPoint('m2-p9', 'top', TOP_OUT), c6, 'dashed', 'P3 → P9', 'inner-up');
        drawPath(getPoint('m2-p9', 'top', TOP_IN), getPoint('cloud-out', 'bottom', cloudBundle(6)), c6, 'dashed', 'OUT', 'up');

        // Flow 7: Cloud IN -> P13 -> P5 -> P15 -> Cloud OUT
        const c7 = COLORS.flow7;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(7)), getPoint('m2-p13', 'top', TOP_IN), c7, 'solid', 'IN', 'down');
        drawPath(getPoint('m2-p13', 'top', TOP_OUT), getPoint('m2-p5', 'top', TOP_IN), c7, 'dashed', 'P13 → P5', 'inner-up');
        drawPath(getPoint('m2-p5', 'top', TOP_OUT), getPoint('m2-p15', 'top', TOP_OUT), c7, 'dashed', 'P5 → P15', 'inner-up');
        drawPath(getPoint('m2-p15', 'top', TOP_IN), getPoint('cloud-out', 'bottom', cloudBundle(7)), c7, 'dashed', 'OUT', 'up');

        // Flow 8: Cloud IN -> P15 -> P7 -> P13 -> Cloud OUT
        const c8 = COLORS.flow8;
        drawPath(getPoint('cloud-in', 'bottom', cloudBundle(8)), getPoint('m2-p15', 'top', TOP_IN), c8, 'solid', 'IN', 'down');
        drawPath(getPoint('m2-p15', 'top', TOP_OUT), getPoint('m2-p7', 'top', TOP_IN), c8, 'dashed', 'P15 → P7', 'inner-up');
        drawPath(getPoint('m2-p7', 'top', TOP_OUT), getPoint('m2-p13', 'top', TOP_OUT), c8, 'dashed', 'P7 → P13', 'inner-up');
        drawPath(getPoint('m2-p13', 'top', TOP_IN), getPoint('cloud-out', 'bottom', cloudBundle(8)), c8, 'dashed', 'OUT', 'up');
    }

    function capture(format) {
        const btns = document.querySelector('.btn-group');
        btns.style.display = 'none';
        html2canvas(container, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
            if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('l', 'pt', [canvas.width, canvas.height]);
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save('Niagara_Switch_12_Diagram.pdf');
            } else {
                const link = document.createElement('a');
                link.download = `Niagara_Switch_12_Diagram.${format}`;
                link.href = canvas.toDataURL(`image/${format}`);
                link.click();
            }
            btns.style.display = 'flex';
        });
    }

    document.getElementById('download-png').onclick = () => capture('png');
    document.getElementById('download-jpg').onclick = () => capture('jpeg');
    document.getElementById('download-pdf').onclick = () => capture('pdf');

    setTimeout(drawAllFlows, 500);
});
