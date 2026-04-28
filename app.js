document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('connections-svg');
    const container = document.getElementById('diagram-container');

    const COLORS = {
        m1: '#2563eb',
        m2: '#059669',
        mirror: '#ea580c'
    };

    function resize() {
        const rect = container.getBoundingClientRect();
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);
        svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    }

    window.addEventListener('resize', () => { resize(); drawFlows(); });
    resize();

    function getPos(id, side = 'center', offset = { x: 0, y: 0 }) {
        const el = document.getElementById(id);
        if (!el) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        const crect = container.getBoundingClientRect();

        let x = rect.left - crect.left;
        let y = rect.top - crect.top;

        if (side.includes('top')) y += 0;
        else if (side.includes('bottom')) y += rect.height;
        else y += rect.height / 2;

        if (side.includes('left')) x += 0;
        else if (side.includes('right')) x += rect.width;
        else x += rect.width / 2;

        return { x: x + offset.x, y: y + offset.y };
    }

    function createMarker(id, color) {
        if (document.getElementById(id)) return;
        const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '6');
        marker.setAttribute('markerHeight', '6');
        marker.setAttribute('orient', 'auto-start-reverse');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        path.setAttribute('fill', color);
        marker.appendChild(path);
        defs.appendChild(marker);
    }

    function drawLine(p1, p2, color, style = 'solid', label = '') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const markerId = `arrow-${color.replace('#', '')}`;
        createMarker(markerId, color);

        // Calculate control points for a nice curve
        const dx = Math.abs(p2.x - p1.x);
        const dy = Math.abs(p2.y - p1.y);
        const vertical = dy > dx;
        
        let cp1x = p1.x, cp1y = p1.y;
        let cp2x = p2.x, cp2y = p2.y;

        if (vertical) {
            const midY = (p1.y + p2.y) / 2;
            cp1y = midY;
            cp2y = midY;
        } else {
            const midX = (p1.x + p2.x) / 2;
            cp1x = midX;
            cp2x = midX;
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
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            text.setAttribute('x', midX);
            text.setAttribute('y', midY - 5);
            text.setAttribute('fill', color);
            text.setAttribute('font-size', '10px');
            text.setAttribute('font-weight', '700');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = label;
            svg.appendChild(text);
        }
    }

    function drawFlows() {
        svg.innerHTML = '';
        
        // Offset definitions for IN/OUT on ports
        const IN = { x: -15, y: 0 };
        const OUT = { x: 15, y: 0 };
        const TOP_IN = { x: 0, y: -5 };
        const BOT_OUT = { x: 0, y: 5 };

        // --- MODULE 1 FLOWS (BLUE) ---
        
        // Flow 1: Cybernet -> P9 -> P1 -> DPI -> P1 -> P11 (dashed)
        const f1p1 = getPos('cybernet', 'bottom');
        const f1p2 = getPos('m1-p9', 'top', TOP_IN);
        drawLine(f1p1, f1p2, COLORS.m1, 'solid', 'Cybernet IN → P9');

        drawLine(getPos('m1-p9', 'top', {x:5, y:-5}), getPos('m1-p1', 'top', {x:-5, y:-5}), COLORS.m1, 'solid', 'P9 → P1');
        drawLine(getPos('m1-p1', 'bottom', BOT_OUT), getPos('dpi-server', 'top', {x:-40, y:0}), COLORS.m1, 'solid', 'P1 → DPI Server');
        drawLine(getPos('dpi-server', 'top', {x:-30, y:0}), getPos('m1-p1', 'bottom', {x:5, y:5}), COLORS.m1, 'solid');
        drawLine(getPos('m1-p1', 'bottom', {x:10, y:5}), getPos('m1-p11', 'top', TOP_IN), COLORS.m1, 'dashed', 'P1 → P11');
        
        // Flow 1 Mirror: P10 -> Mirror DPI
        drawLine(getPos('m1-p10', 'bottom', BOT_OUT), getPos('mirror-dpi', 'top', {x:-20, y:0}), COLORS.mirror, 'solid', 'Mirror Copy: P10 → Mirror DPI on LEA');

        // Flow 2: P11 -> P3 -> P9
        drawLine(getPos('m1-p11', 'top', {x:10, y:-5}), getPos('m1-p3', 'top', TOP_IN), COLORS.m1, 'solid', 'P11 → P3');
        drawLine(getPos('m1-p3', 'bottom', BOT_OUT), getPos('m1-p9', 'bottom', {x:10, y:5}), COLORS.m1, 'solid', 'P3 → P9');
        // Flow 2 Clone: P12
        drawLine(getPos('m1-p12', 'bottom', BOT_OUT), getPos('lea-server', 'top', {x:-60, y:0}), COLORS.mirror, 'solid', 'Clone on P12 → Saved');

        // Flow 3: P13 -> P5 -> P15
        drawLine(getPos('m1-p13', 'top', TOP_IN), getPos('m1-p5', 'top', TOP_IN), COLORS.m1, 'solid', 'P13 → P5');
        drawLine(getPos('m1-p5', 'bottom', BOT_OUT), getPos('m1-p15', 'bottom', {x:10, y:5}), COLORS.m1, 'solid', 'P5 → P15');
        // Flow 3 Clone: P16
        drawLine(getPos('m1-p16', 'bottom', BOT_OUT), getPos('lea-server', 'top', {x:-40, y:0}), COLORS.mirror, 'solid', 'Clone on P16 → Saved');

        // Flow 4: P15 -> P7 -> DPA -> P7 -> P13
        drawLine(getPos('m1-p15', 'top', TOP_IN), getPos('m1-p7', 'top', TOP_IN), COLORS.m1, 'solid', 'P15 → P7');
        drawLine(getPos('m1-p7', 'bottom', BOT_OUT), getPos('dpa-server', 'top', {x:-40, y:0}), COLORS.m1, 'solid', 'P7 → DPA Server');
        drawLine(getPos('dpa-server', 'top', {x:-30, y:0}), getPos('m1-p7', 'bottom', {x:5, y:5}), COLORS.m1, 'solid');
        drawLine(getPos('m1-p7', 'top', {x:10, y:-5}), getPos('m1-p13', 'top', {x:10, y:-5}), COLORS.m1, 'solid', 'P7 → P13');
        // Flow 4 Mirror: P14
        drawLine(getPos('m1-p14', 'bottom', BOT_OUT), getPos('lea-server', 'top', {x:-20, y:0}), COLORS.mirror, 'solid', 'Mirror on P14 → LEA Server');


        // --- MODULE 2 FLOWS (GREEN) ---

        // Flow 5: P9 -> P1 -> P11
        drawLine(getPos('m2-p9', 'top', TOP_IN), getPos('m2-p1', 'top', TOP_IN), COLORS.m2, 'solid', 'P9 → P1');
        drawLine(getPos('m2-p1', 'bottom', BOT_OUT), getPos('m2-p11', 'bottom', {x:10, y:5}), COLORS.m2, 'solid', 'P1 → P11');
        // Flow 5 Copy: P10
        drawLine(getPos('m2-p10', 'bottom', BOT_OUT), getPos('lea-server', 'top', {x:20, y:0}), COLORS.mirror, 'solid', 'Copy on P10 → LEA');

        // Flow 6: Cybernet -> P11 -> P3 -> DPI -> P3 -> P9
        drawLine(getPos('cybernet', 'bottom', {x:20, y:0}), getPos('m2-p11', 'top', TOP_IN), COLORS.m2, 'solid', 'Cybernet → P11');
        drawLine(getPos('m2-p11', 'top', {x:10, y:-5}), getPos('m2-p3', 'top', TOP_IN), COLORS.m2, 'solid', 'P11 → P3');
        drawLine(getPos('m2-p3', 'bottom', BOT_OUT), getPos('dpi-server', 'top', {x:20, y:0}), COLORS.m2, 'solid', 'P3 → DPI Server');
        drawLine(getPos('dpi-server', 'top', {x:30, y:0}), getPos('m2-p3', 'bottom', {x:5, y:5}), COLORS.m2, 'solid');
        drawLine(getPos('m2-p3', 'top', {x:10, y:-5}), getPos('m2-p9', 'top', {x:10, y:-5}), COLORS.m2, 'solid', 'P3 → P9');
        // Flow 6 Clone: P12
        drawLine(getPos('m2-p12', 'bottom', BOT_OUT), getPos('lea-server', 'top', {x:40, y:0}), COLORS.mirror, 'solid', 'Clone on P12 → LEA');

        // Flow 7: IT Cybernet -> P13 -> P5 -> DPA -> P5 -> P15
        drawLine(getPos('it-cybernet', 'bottom'), getPos('m2-p13', 'top', TOP_IN), COLORS.m2, 'solid', 'IT Cybernet → P13');
        drawLine(getPos('m2-p13', 'top', {x:10, y:-5}), getPos('m2-p5', 'top', TOP_IN), COLORS.m2, 'solid', 'P13 → P5');
        drawLine(getPos('m2-p5', 'bottom', BOT_OUT), getPos('dpa-server', 'top', {x:20, y:0}), COLORS.m2, 'solid', 'P5 → DPA Server');
        drawLine(getPos('dpa-server', 'top', {x:30, y:0}), getPos('m2-p5', 'bottom', {x:5, y:5}), COLORS.m2, 'solid');
        drawLine(getPos('m2-p5', 'top', {x:10, y:-5}), getPos('m2-p15', 'top', {x:10, y:-5}), COLORS.m2, 'solid', 'P5 → P15');
        // Flow 7 Clone: P14
        drawLine(getPos('m2-p14', 'bottom', BOT_OUT), getPos('mirror-dpi', 'top', {x:20, y:0}), COLORS.mirror, 'solid', 'Clone on P14 → Mirror Server LEA');

        // Flow 8: P15 -> P7 -> DPA -> P7 -> P13
        drawLine(getPos('m2-p15', 'top', TOP_IN), getPos('m2-p7', 'top', TOP_IN), COLORS.m2, 'solid', 'P15 → P7');
        drawLine(getPos('m2-p7', 'bottom', BOT_OUT), getPos('dpa-server', 'top', {x:40, y:0}), COLORS.m2, 'solid', 'P7 → DPA Server');
        drawLine(getPos('dpa-server', 'top', {x:50, y:0}), getPos('m2-p7', 'bottom', {x:5, y:5}), COLORS.m2, 'solid');
        drawLine(getPos('m2-p7', 'top', {x:10, y:-5}), getPos('m2-p13', 'top', {x:15, y:-5}), COLORS.m2, 'solid', 'P7 → P13');
        // Flow 8 Mirror: P16
        drawLine(getPos('m2-p16', 'bottom', BOT_OUT), getPos('lea-server', 'top', {x:60, y:0}), COLORS.mirror, 'solid', 'Mirror on P16 → LEA');
    }

    // Download Feature
    document.getElementById('download-png').addEventListener('click', () => {
        html2canvas(container).then(canvas => {
            const link = document.createElement('a');
            link.download = 'Niagara_NPB_Switch_12_Diagram.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    document.getElementById('download-pdf').addEventListener('click', () => {
        html2canvas(container).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('l', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10, 280, 190);
            pdf.save('Niagara_NPB_Switch_12_Diagram.pdf');
        });
    });

    setTimeout(drawFlows, 500);
});
