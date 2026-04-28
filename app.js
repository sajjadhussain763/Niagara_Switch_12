document.addEventListener("DOMContentLoaded", () => {
    const svg = document.getElementById('connections');
    const container = document.getElementById('diagram-container');

    // 8 Distinct Colors for 8 Flows
    const colorMap = {
        1: '#d6336c', // Pink
        2: '#1a53ff', // Blue
        3: '#e67700', // Orange
        4: '#7b2ff7', // Purple
        5: '#0ca678', // Green
        6: '#c92a2a', // Red
        7: '#b8860b', // Gold
        8: '#0077b6'  // Cyan
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

        // --- MODULE 1 ---
        
        // Flow 1: Cybernet -> P9 -> P1 (dashed) -> DPI-1 -> P1 -> P11 (dashed) + Mirror P12
        const c1 = colorMap[1];
        drawPath(getPoint('cybernet', 'bottom'), getPoint('m1-p9', 'top', TOP_IN), c1, 'solid', 'Cybernet → P9', 'down');
        drawPath(getPoint('m1-p9', 'top', TOP_OUT), getPoint('m1-p1', 'top', TOP_IN), c1, 'dashed', 'P9 → P1 (Logical)', 'inner-up');
        drawPath(getPoint('m1-p1', 'bottom', BOT_OUT), getPoint('dpi-server', 'top', {x:-40, y:0}), c1, 'solid', 'P1 → DPI-1', 'down');
        drawPath(getPoint('dpi-server', 'top', {x:-30, y:0}), getPoint('m1-p1', 'bottom', BOT_IN), c1, 'solid', '', 'up');
        drawPath(getPoint('m1-p1', 'bottom', BOT_OUT), getPoint('m1-p11', 'top', TOP_IN), c1, 'dashed', 'P1 → P11', 'down');
        // Mirror P12 -> Mirror DPI-1
        drawPath(getPoint('m1-p12', 'bottom', BOT_OUT), getPoint('mirror-dpi', 'top', {x:-40, y:0}), c1, 'solid', 'Mirror P12 → Mirror DPI-1', 'down');

        // Flow 2: P11 -> P3 -> P9 (Color 2)
        const c2 = colorMap[2];
        drawPath(getPoint('m1-p11', 'top', TOP_OUT), getPoint('m1-p3', 'top', TOP_IN), c2, 'solid', 'P11 → P3', 'inner-up');
        drawPath(getPoint('m1-p3', 'bottom', BOT_OUT), getPoint('m1-p9', 'bottom', BOT_IN), c2, 'solid', 'P3 → P9', 'inner-down');
        drawPath(getPoint('m1-p12', 'bottom', {x:10, y:2}), getPoint('lea-server', 'top', {x:-40, y:0}), c2, 'solid', 'Clone P12', 'down');

        // Flow 3: P13 -> P5 -> P15 (Color 3)
        const c3 = colorMap[3];
        drawPath(getPoint('m1-p13', 'top', TOP_IN), getPoint('m1-p5', 'top', TOP_IN), c3, 'solid', 'P13 → P5', 'inner-up');
        drawPath(getPoint('m1-p5', 'bottom', BOT_OUT), getPoint('m1-p15', 'bottom', BOT_IN), c3, 'solid', 'P5 → P15', 'inner-down');
        drawPath(getPoint('m1-p16', 'bottom', BOT_OUT), getPoint('lea-server', 'top', {x:-20, y:0}), c3, 'solid', 'Clone P16', 'down');

        // Flow 4: P15 -> P7 -> DPA -> P7 -> P13 (Color 4)
        const c4 = colorMap[4];
        drawPath(getPoint('m1-p15', 'top', TOP_OUT), getPoint('m1-p7', 'top', TOP_IN), c4, 'solid', 'P15 → P7', 'inner-up');
        drawPath(getPoint('m1-p7', 'bottom', BOT_OUT), getPoint('dpa-server', 'top', {x:-30, y:0}), c4, 'solid', 'P7 → DPA', 'down');
        drawPath(getPoint('dpa-server', 'top', {x:-20, y:0}), getPoint('m1-p7', 'bottom', BOT_IN), c4, 'solid', '', 'up');
        drawPath(getPoint('m1-p7', 'top', TOP_OUT), getPoint('m1-p13', 'top', TOP_OUT), c4, 'solid', 'P7 → P13', 'inner-up');
        drawPath(getPoint('m1-p14', 'bottom', BOT_OUT), getPoint('lea-server', 'top', {x:0, y:0}), c4, 'solid', 'Mirror P14', 'down');


        // --- MODULE 2 ---
        
        // Flow 5: P9 -> P1 -> P11 (Color 5)
        const c5 = colorMap[5];
        drawPath(getPoint('m2-p9', 'top', TOP_IN), getPoint('m2-p1', 'top', TOP_IN), c5, 'solid', 'P9 → P1', 'inner-up');
        drawPath(getPoint('m2-p1', 'bottom', BOT_OUT), getPoint('m2-p11', 'bottom', BOT_IN), c5, 'solid', 'P1 → P11', 'inner-down');
        drawPath(getPoint('m2-p10', 'bottom', BOT_OUT), getPoint('lea-server', 'top', {x:20, y:0}), c5, 'solid', 'Copy P10', 'down');

        // Flow 6: Cybernet -> P11 -> P3 -> DPI -> P3 -> P9 (Color 6)
        const c6 = colorMap[6];
        drawPath(getPoint('cybernet', 'bottom', {x:50, y:0}), getPoint('m2-p11', 'top', TOP_IN), c6, 'solid', 'Cybernet → P11', 'down');
        drawPath(getPoint('m2-p11', 'top', TOP_OUT), getPoint('m2-p3', 'top', TOP_IN), c6, 'solid', 'P11 → P3', 'inner-up');
        drawPath(getPoint('m2-p3', 'bottom', BOT_OUT), getPoint('dpi-server', 'top', {x:10, y:0}), c6, 'solid', 'P3 → DPI', 'down');
        drawPath(getPoint('dpi-server', 'top', {x:20, y:0}), getPoint('m2-p3', 'bottom', BOT_IN), c6, 'solid', '', 'up');
        drawPath(getPoint('m2-p3', 'top', TOP_OUT), getPoint('m2-p9', 'top', TOP_OUT), c6, 'solid', 'P3 → P9', 'inner-up');
        drawPath(getPoint('m2-p12', 'bottom', BOT_OUT), getPoint('lea-server', 'top', {x:40, y:0}), c6, 'solid', 'Clone P12', 'down');

        // Flow 7: IT Cybernet -> P13 -> P5 -> DPA -> P5 -> P15 (Color 7)
        const c7 = colorMap[7];
        drawPath(getPoint('it-cybernet', 'bottom'), getPoint('m2-p13', 'top', TOP_IN), c7, 'solid', 'IT Cybernet → P13', 'down');
        drawPath(getPoint('m2-p13', 'top', TOP_OUT), getPoint('m2-p5', 'top', TOP_IN), c7, 'solid', 'P13 → P5', 'inner-up');
        drawPath(getPoint('m2-p5', 'bottom', BOT_OUT), getPoint('dpa-server', 'top', {x:10, y:0}), c7, 'solid', 'P5 → DPA', 'down');
        drawPath(getPoint('dpa-server', 'top', {x:20, y:0}), getPoint('m2-p5', 'bottom', BOT_IN), c7, 'solid', '', 'up');
        drawPath(getPoint('m2-p5', 'top', TOP_OUT), getPoint('m2-p15', 'top', TOP_OUT), c7, 'solid', 'P5 → P15', 'inner-up');
        drawPath(getPoint('m2-p14', 'bottom', BOT_OUT), getPoint('mirror-dpi', 'top', {x:10, y:0}), c7, 'solid', 'Clone P14', 'down');

        // Flow 8: P15 -> P7 -> DPA -> P7 -> P13 (Color 8)
        const c8 = colorMap[8];
        drawPath(getPoint('m2-p15', 'top', TOP_IN), getPoint('m2-p7', 'top', TOP_IN), c8, 'solid', 'P15 → P7', 'inner-up');
        drawPath(getPoint('m2-p7', 'bottom', BOT_OUT), getPoint('dpa-server', 'top', {x:40, y:0}), c8, 'solid', 'P7 → DPA', 'down');
        drawPath(getPoint('dpa-server', 'top', {x:50, y:0}), getPoint('m2-p7', 'bottom', BOT_IN), c8, 'solid', '', 'up');
        drawPath(getPoint('m2-p7', 'top', TOP_OUT), getPoint('m2-p13', 'top', TOP_OUT), c8, 'solid', 'P7 → P13', 'inner-up');
        drawPath(getPoint('m2-p16', 'bottom', BOT_OUT), getPoint('lea-server', 'top', {x:60, y:0}), c8, 'solid', 'Mirror P16', 'down');
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
