/**
 * Background - Creates the ethereal floating circles in the background
 * These represent overlapping notes and create a dreamy atmosphere
 * Rendered as thick fading ring outlines, not filled gradients
 */

class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Floating circles configuration
        this.circles = [];
        this.maxCircles = 15;

        // Configurable multipliers (set from side panel)
        this.opacityMultiplier = 0.5;
        this.lineWidthMultiplier = 1.0;
        this.pulseMultiplier = 0.5;

        // Create initial circles
        this.initCircles();
    }

    initCircles() {
        this.circles = [];

        // Create circles in different zones of the screen
        const zones = [
            { x: 0.12, y: 0.35 },   // Left side
            { x: 0.88, y: 0.25 },   // Right side top
            { x: 0.92, y: 0.65 },   // Right side bottom
            { x: 0.08, y: 0.75 },   // Left side bottom
            { x: 0.06, y: 0.15 },   // Top left
            { x: 0.94, y: 0.45 },   // Right middle
            { x: 0.15, y: 0.55 },   // Left middle
            { x: 0.85, y: 0.85 },   // Bottom right
        ];

        // Create grouped circles (like in the reference image)
        zones.forEach((zone, groupIndex) => {
            const numInGroup = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numInGroup; i++) {
                this.circles.push(this.createCircle(zone, groupIndex));
            }
        });
    }

    createCircle(zone, groupIndex) {
        const colors = [
            { h: 240, s: 30, l: 55 },  // Soft blue
            { h: 280, s: 25, l: 50 },  // Soft purple
            { h: 200, s: 20, l: 45 },  // Steel blue
            { h: 320, s: 20, l: 50 },  // Soft pink
            { h: 180, s: 25, l: 45 },  // Teal
            { h: 30, s: 25, l: 55 },   // Warm beige
            { h: 260, s: 30, l: 50 },  // Violet
            { h: 210, s: 25, l: 50 },  // Sky blue
        ];

        const color = colors[groupIndex % colors.length];
        const baseSize = 100 + Math.random() * 180;

        return {
            // Position relative to canvas (will be scaled on resize)
            relX: zone.x + (Math.random() - 0.5) * 0.12,
            relY: zone.y + (Math.random() - 0.5) * 0.15,
            x: 0,
            y: 0,
            radius: baseSize,
            targetRadius: baseSize,
            color: color,
            // Alpha cycles for fade in/out effect
            alpha: 0.1 + Math.random() * 0.15,
            baseAlpha: 0.1 + Math.random() * 0.15,
            fadeSpeed: 0.0003 + Math.random() * 0.0005,
            fadePhase: Math.random() * Math.PI * 2,
            // Line thickness
            lineWidth: 2 + Math.random() * 3,
            // Breathing/pulsing
            pulseSpeed: 0.0003 + Math.random() * 0.0006,
            pulsePhase: Math.random() * Math.PI * 2,
            breathAmount: 0.08 + Math.random() * 0.08,
            // Gentle drift
            driftX: (Math.random() - 0.5) * 0.00003,
            driftY: (Math.random() - 0.5) * 0.00003,
        };
    }

    resize(width, height) {
        // Update absolute positions based on relative positions
        this.circles.forEach(circle => {
            circle.x = circle.relX * width;
            circle.y = circle.relY * height;
        });
    }

    update(deltaTime, triggered = false) {
        const time = performance.now();

        this.circles.forEach(circle => {
            // Gentle drifting movement
            circle.relX += circle.driftX * deltaTime;
            circle.relY += circle.driftY * deltaTime;

            // Bounce off edges
            if (circle.relX < 0.03 || circle.relX > 0.97) circle.driftX *= -1;
            if (circle.relY < 0.03 || circle.relY > 0.97) circle.driftY *= -1;

            // Update absolute position
            circle.x = circle.relX * this.canvas.width;
            circle.y = circle.relY * this.canvas.height;

            // Breathing/pulsing effect
            const pulse = Math.sin(time * circle.pulseSpeed + circle.pulsePhase);
            circle.radius = circle.targetRadius * (1 + pulse * circle.breathAmount * this.pulseMultiplier);

            // Fade in/out effect
            const fade = Math.sin(time * circle.fadeSpeed + circle.fadePhase);
            circle.alpha = circle.baseAlpha * (0.5 + fade * 0.5);

            // React slightly to triggers - brief brightening
            if (triggered) {
                circle.alpha = Math.min(0.35, circle.alpha + 0.08);
            }
        });
    }

    draw() {
        // Clear the background canvas completely each frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw each circle as a ring outline
        this.circles.forEach(circle => {
            this.drawCircleRing(circle);
        });
    }

    drawCircleRing(circle) {
        const { x, y, radius, color, lineWidth } = circle;

        // Safety checks
        if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius <= 0) return;

        // Apply multipliers
        const effectiveAlpha = circle.alpha * this.opacityMultiplier;
        const effectiveLineWidth = lineWidth * this.lineWidthMultiplier;

        if (effectiveAlpha <= 0) return;

        // Draw the ring as a stroke (not filled)
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);

        // Set stroke style with HSL color and current alpha
        this.ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${effectiveAlpha})`;
        this.ctx.lineWidth = effectiveLineWidth;
        this.ctx.stroke();

        // Optional: draw a second, slightly larger/smaller ring for depth
        if (effectiveAlpha > 0.05) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 1.05, 0, Math.PI * 2);
            this.ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l + 10}%, ${effectiveAlpha * 0.4})`;
            this.ctx.lineWidth = effectiveLineWidth * 0.6;
            this.ctx.stroke();
        }
    }

    // Trigger a pulse effect on all background circles
    pulse() {
        this.circles.forEach(circle => {
            circle.alpha = Math.min(0.4, circle.alpha + 0.1);
        });
    }
}

// Export for use in other modules
window.Background = Background;
