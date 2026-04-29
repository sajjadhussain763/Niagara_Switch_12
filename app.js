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

    function drawPath(p1, p2, color, style = 'solid', label = '', type = 'external', flowIndex = 0) {
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

        let cp1x = p1.x, cp1y = p1.y;
        let cp2x = p2.x, cp2y = p2.y;

        const distY = Math.abs(p2.y - p1.y);
        const distX = Math.abs(p2.x - p1.x);

        if (type === 'logical-up') {
            cp1y -= 20 + (flowIndex * 4);
            cp2y -= 20 + (flowIndex * 4);
        } else if (type === 'logical-down') {
            cp1y += 20 + (flowIndex * 4);
            cp2y += 20 + (flowIndex * 4);
        } else if (type === 'external-down') {
            cp1y += Math.max(distY * 0.4, 50) + (flowIndex * 2);
            cp2y -= Math.max(distY * 0.4, 60) + (flowIndex * 2);
        } else if (type === 'external-up') {
            cp1y -= Math.max(distY * 0.4, 50) + (flowIndex * 2);
            cp2y += Math.max(distY * 0.4, 60) + (flowIndex * 2);
        }

        path.setAttribute('d', `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', `url(#${markerId})`);

        if (style === 'dashed') {
            path.setAttribute('stroke-dasharray', '6,4');
        }

        svg.appendChild(path);

        if (label) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const textX = p1.x + (p2.x - p1.x) * 0.25;
            const textY = p1.y + (p2.y - p1.y) * 0.25 - 5;
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('fill', color);
            text.setAttribute('font-size', '8.5px');
            text.setAttribute('font-weight', '700');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = label;
            svg.appendChild(text);
        }
    }

    function drawAllFlows() {
        svg.innerHTML = '<defs></defs>';
        
        const P_IN = { x: -6, y: 0 };
        const P_OUT = { x: 6, y: 0 };
        const S_OFF = (idx) => ({ x: (idx - 2.5) * 12, y: 0 });
        const C_OFF = (idx) => ({ x: (idx - 4.5) * 10, y: 0 });

        // --- MODULE 1 ---
        
        // Flow 1 (Pink)
        const f1 = COLORS.flow1;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(1)), getPoint('m1-p9', 'top', P_IN), f1, 'solid', 'IN', 'external-down', 1);
        drawPath(getPoint('m1-p9', 'top', P_OUT), getPoint('m1-p1', 'top', P_IN), f1, 'dashed', '', 'logical-up', 1);
        drawPath(getPoint('m1-p1', 'bottom', P_OUT), getPoint('dpi-1', 'top', S_OFF(1)), f1, 'dashed', '', 'external-down', 1);
        drawPath(getPoint('dpi-1', 'top', S_OFF(1.5)), getPoint('m1-p1', 'bottom', P_IN), f1, 'solid', '', 'external-up', 1);
        drawPath(getPoint('m1-p1', 'bottom', P_OUT), getPoint('m1-p11', 'bottom', P_IN), f1, 'dashed', '', 'logical-down', 1);
        drawPath(getPoint('m1-p11', 'top', P_OUT), getPoint('cloud-out', 'bottom', C_OFF(1)), f1, 'dashed', 'OUT', 'external-up', 1);
        drawPath(getPoint('m1-p10', 'bottom', P_OUT), getPoint('mirror-dpi-1', 'top', S_OFF(1)), f1, 'dashed', 'Mirror', 'external-down', 1);

        // Flow 2 (Blue)
        const f2 = COLORS.flow2;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(2)), getPoint('m1-p11', 'top', P_IN), f2, 'solid', 'IN', 'external-down', 2);
        drawPath(getPoint('m1-p11', 'top', P_OUT), getPoint('m1-p3', 'top', P_IN), f2, 'dashed', '', 'logical-up', 2);
        drawPath(getPoint('m1-p3', 'bottom', P_OUT), getPoint('dpi-1', 'top', S_OFF(2)), f2, 'dashed', '', 'external-down', 2);
        drawPath(getPoint('dpi-1', 'top', S_OFF(2.5)), getPoint('m1-p3', 'bottom', P_IN), f2, 'solid', '', 'external-up', 2);
        drawPath(getPoint('m1-p3', 'bottom', P_OUT), getPoint('m1-p9', 'bottom', P_IN), f2, 'dashed', '', 'logical-down', 2);
        drawPath(getPoint('m1-p9', 'top', P_OUT), getPoint('cloud-out', 'bottom', C_OFF(2)), f2, 'dashed', 'OUT', 'external-up', 2);
        drawPath(getPoint('m1-p12', 'bottom', P_OUT), getPoint('mirror-dpi-1', 'top', S_OFF(2)), f2, 'dashed', 'Mirror', 'external-down', 2);

        // Flow 3 (Orange) - Mirror P16 -> Mirror DPI-2
        const f3 = COLORS.flow3;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(3)), getPoint('m1-p13', 'top', P_IN), f3, 'solid', 'IN', 'external-down', 3);
        drawPath(getPoint('m1-p13', 'top', P_OUT), getPoint('m1-p5', 'top', P_IN), f3, 'dashed', '', 'logical-up', 3);
        drawPath(getPoint('m1-p5', 'bottom', P_OUT), getPoint('dpi-2', 'top', S_OFF(1)), f3, 'dashed', '', 'external-down', 3);
        drawPath(getPoint('dpi-2', 'top', S_OFF(1.5)), getPoint('m1-p5', 'bottom', P_IN), f3, 'solid', '', 'external-up', 3);
        drawPath(getPoint('m1-p5', 'bottom', P_OUT), getPoint('m1-p15', 'bottom', P_IN), f3, 'dashed', '', 'logical-down', 3);
        drawPath(getPoint('m1-p15', 'top', P_OUT), getPoint('cloud-out', 'bottom', C_OFF(3)), f3, 'dashed', 'OUT', 'external-up', 3);
        drawPath(getPoint('m1-p16', 'bottom', P_OUT), getPoint('mirror-dpi-2', 'top', S_OFF(1)), f3, 'dashed', 'Mirror', 'external-down', 3);

        // Flow 4 (Purple) - Mirror P14 -> Mirror DPI-2
        const f4 = COLORS.flow4;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(4)), getPoint('m1-p15', 'top', P_IN), f4, 'solid', 'IN', 'external-down', 4);
        drawPath(getPoint('m1-p15', 'top', P_OUT), getPoint('m1-p7', 'top', P_IN), f4, 'dashed', '', 'logical-up', 4);
        drawPath(getPoint('m1-p7', 'bottom', P_OUT), getPoint('dpi-2', 'top', S_OFF(2)), f4, 'dashed', '', 'external-down', 4);
        drawPath(getPoint('dpi-2', 'top', S_OFF(2.5)), getPoint('m1-p7', 'bottom', P_IN), f4, 'solid', '', 'external-up', 4);
        drawPath(getPoint('m1-p7', 'bottom', P_OUT), getPoint('m1-p13', 'bottom', P_IN), f4, 'dashed', '', 'logical-down', 4);
        drawPath(getPoint('m1-p13', 'top', P_IN), getPoint('cloud-out', 'bottom', C_OFF(4)), f4, 'dashed', 'OUT', 'external-up', 4);
        drawPath(getPoint('m1-p14', 'bottom', P_OUT), getPoint('mirror-dpi-2', 'top', S_OFF(2)), f4, 'dashed', 'Mirror', 'external-down', 4);


        // --- MODULE 2 ---
        
        // Flow 5 (Green)
        const f5 = COLORS.flow5;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(5)), getPoint('m2-p9', 'top', P_IN), f5, 'solid', 'IN', 'external-down', 5);
        drawPath(getPoint('m2-p9', 'top', P_OUT), getPoint('m2-p1', 'top', P_IN), f5, 'dashed', '', 'logical-up', 5);
        drawPath(getPoint('m2-p1', 'bottom', P_OUT), getPoint('dpi-3', 'top', S_OFF(1)), f5, 'dashed', '', 'external-down', 5);
        drawPath(getPoint('dpi-3', 'top', S_OFF(1.5)), getPoint('m2-p1', 'bottom', P_IN), f5, 'solid', '', 'external-up', 5);
        drawPath(getPoint('m2-p1', 'bottom', P_OUT), getPoint('m2-p11', 'bottom', P_IN), f5, 'dashed', '', 'logical-down', 5);
        drawPath(getPoint('m2-p11', 'top', P_OUT), getPoint('cloud-out', 'bottom', C_OFF(5)), f5, 'dashed', 'OUT', 'external-up', 5);
        drawPath(getPoint('m2-p10', 'bottom', P_OUT), getPoint('mirror-dpi-3', 'top', S_OFF(1)), f5, 'dashed', 'Mirror', 'external-down', 5);

        // Flow 6 (Red)
        const f6 = COLORS.flow6;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(6)), getPoint('m2-p11', 'top', P_IN), f6, 'solid', 'IN', 'external-down', 6);
        drawPath(getPoint('m2-p11', 'top', P_OUT), getPoint('m2-p3', 'top', P_IN), f6, 'dashed', '', 'logical-up', 6);
        drawPath(getPoint('m2-p3', 'bottom', P_OUT), getPoint('dpi-3', 'top', S_OFF(2)), f6, 'dashed', '', 'external-down', 6);
        drawPath(getPoint('dpi-3', 'top', S_OFF(2.5)), getPoint('m2-p3', 'bottom', P_IN), f6, 'solid', '', 'external-up', 6);
        drawPath(getPoint('m2-p3', 'bottom', P_OUT), getPoint('m2-p9', 'bottom', P_IN), f6, 'dashed', '', 'logical-down', 6);
        drawPath(getPoint('m2-p9', 'top', P_IN), getPoint('cloud-out', 'bottom', C_OFF(6)), f6, 'dashed', 'OUT', 'external-up', 6);
        drawPath(getPoint('m2-p12', 'bottom', P_OUT), getPoint('mirror-dpi-3', 'top', S_OFF(2)), f6, 'dashed', 'Mirror', 'external-down', 6);

        // Flow 7 (Gold)
        const f7 = COLORS.flow7;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(7)), getPoint('m2-p13', 'top', P_IN), f7, 'solid', 'IN', 'external-down', 7);
        drawPath(getPoint('m2-p13', 'top', P_OUT), getPoint('m2-p5', 'top', P_IN), f7, 'dashed', '', 'logical-up', 7);
        drawPath(getPoint('m2-p5', 'bottom', P_OUT), getPoint('dpi-4', 'top', S_OFF(1)), f7, 'dashed', '', 'external-down', 7);
        drawPath(getPoint('dpi-4', 'top', S_OFF(1.5)), getPoint('m2-p5', 'bottom', P_IN), f7, 'solid', '', 'external-up', 7);
        drawPath(getPoint('m2-p5', 'bottom', P_OUT), getPoint('m2-p15', 'bottom', P_IN), f7, 'dashed', '', 'logical-down', 7);
        drawPath(getPoint('m2-p15', 'top', P_IN), getPoint('cloud-out', 'bottom', C_OFF(7)), f7, 'dashed', 'OUT', 'external-up', 7);
        drawPath(getPoint('m2-p14', 'bottom', P_OUT), getPoint('mirror-dpi-4', 'top', S_OFF(1)), f7, 'dashed', 'Mirror', 'external-down', 7);

        // Flow 8 (Cyan)
        const f8 = COLORS.flow8;
        drawPath(getPoint('cloud-in', 'bottom', C_OFF(8)), getPoint('m2-p15', 'top', P_IN), f8, 'solid', 'IN', 'external-down', 8);
        drawPath(getPoint('m2-p15', 'top', P_OUT), getPoint('m2-p7', 'top', P_IN), f8, 'dashed', '', 'logical-up', 8);
        drawPath(getPoint('m2-p7', 'bottom', P_OUT), getPoint('dpi-4', 'top', S_OFF(2)), f8, 'dashed', '', 'external-down', 8);
        drawPath(getPoint('dpi-4', 'top', S_OFF(2.5)), getPoint('m2-p7', 'bottom', P_IN), f8, 'solid', '', 'external-up', 8);
        drawPath(getPoint('m2-p7', 'bottom', P_OUT), getPoint('m2-p13', 'bottom', P_IN), f8, 'dashed', '', 'logical-down', 8);
        drawPath(getPoint('m2-p13', 'top', P_IN), getPoint('cloud-out', 'bottom', C_OFF(8)), f8, 'dashed', 'OUT', 'external-up', 8);
        drawPath(getPoint('m2-p16', 'bottom', P_OUT), getPoint('mirror-dpi-4', 'top', S_OFF(2)), f8, 'dashed', 'Mirror', 'external-down', 8);
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
