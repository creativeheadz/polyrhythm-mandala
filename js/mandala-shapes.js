/**
 * Mandala Shapes Module
 * Provides alternative geometric shapes and patterns for the mandala
 */

class MandalaShapes {
    // Shape type definitions
    static SHAPES = {
        'circular': {
            name: 'Circular',
            description: 'Classic concentric circles',
            icon: '⭕'
        },
        'hexagonal': {
            name: 'Hexagonal',
            description: 'Honeycomb-like hexagonal grid',
            icon: '⬡'
        },
        'spiral': {
            name: 'Spiral',
            description: 'Nodes along spiral arms',
            icon: '🌀'
        },
        'flower': {
            name: 'Flower of Life',
            description: 'Sacred geometry pattern',
            icon: '🌸'
        },
        'star': {
            name: 'Star',
            description: 'Star polygon patterns',
            icon: '⭐'
        },
        'lissajous': {
            name: 'Lissajous',
            description: 'Mathematical curves',
            icon: '∞'
        },
        'grid': {
            name: 'Grid',
            description: 'Rectangular grid pattern',
            icon: '▦'
        },
        'tree': {
            name: 'Tree',
            description: 'Branching fractal tree',
            icon: '🌳'
        }
    };

    constructor(mandala) {
        this.mandala = mandala;
        this.currentShape = 'circular';
        this.shapeParams = {
            // Hexagonal
            hexSize: 30,
            hexRings: 4,
            // Spiral
            spiralArms: 6,
            spiralTurns: 3,
            spiralTightness: 0.1,
            // Flower
            flowerPetals: 6,
            flowerLayers: 3,
            // Star
            starPoints: 5,
            starLayers: 4,
            // Lissajous
            lissajousA: 3,
            lissajousB: 4,
            lissajousPoints: 100,
            // Grid
            gridCols: 8,
            gridRows: 8,
            // Tree
            treeBranches: 2,
            treeDepth: 5
        };
    }

    /**
     * Generate node positions for a specific shape
     */
    generateShape(shapeName, centerX, centerY, maxRadius, ringCount = 6) {
        this.currentShape = shapeName;

        switch (shapeName) {
            case 'hexagonal':
                return this.generateHexagonal(centerX, centerY, maxRadius);
            case 'spiral':
                return this.generateSpiral(centerX, centerY, maxRadius, ringCount);
            case 'flower':
                return this.generateFlowerOfLife(centerX, centerY, maxRadius);
            case 'star':
                return this.generateStar(centerX, centerY, maxRadius, ringCount);
            case 'lissajous':
                return this.generateLissajous(centerX, centerY, maxRadius);
            case 'grid':
                return this.generateGrid(centerX, centerY, maxRadius);
            case 'tree':
                return this.generateTree(centerX, centerY, maxRadius);
            case 'circular':
            default:
                return null; // Use default mandala behavior
        }
    }

    /**
     * Generate hexagonal honeycomb pattern
     */
    generateHexagonal(centerX, centerY, maxRadius) {
        const nodes = [];
        const size = this.shapeParams.hexSize;
        const rings = this.shapeParams.hexRings;

        // Hex grid calculations
        const hexWidth = size * 2;
        const hexHeight = Math.sqrt(3) * size;

        for (let ring = 0; ring <= rings; ring++) {
            if (ring === 0) {
                // Center hex
                nodes.push({
                    x: 0, y: 0,
                    ring: 0,
                    color: this.ringColor(0, rings),
                    type: 'bass'
                });
            } else {
                // Each ring has 6 * ring hexes
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < ring; j++) {
                        const angle1 = (i / 6) * Math.PI * 2;
                        const angle2 = ((i + 1) / 6) * Math.PI * 2;

                        // Interpolate between corners
                        const t = j / ring;
                        const cornerX = Math.cos(angle1) * ring * hexWidth * 0.75;
                        const cornerY = Math.sin(angle1) * ring * hexHeight;
                        const nextCornerX = Math.cos(angle2) * ring * hexWidth * 0.75;
                        const nextCornerY = Math.sin(angle2) * ring * hexHeight;

                        const x = cornerX + (nextCornerX - cornerX) * t;
                        const y = cornerY + (nextCornerY - cornerY) * t;

                        // Normalize to -1 to 1 range
                        const maxDist = rings * hexWidth * 0.75;
                        nodes.push({
                            x: x / maxDist,
                            y: y / maxDist,
                            ring: ring,
                            color: this.ringColor(ring, rings),
                            type: this.ringType(ring)
                        });
                    }
                }
            }
        }

        return nodes;
    }

    /**
     * Generate spiral arms pattern
     */
    generateSpiral(centerX, centerY, maxRadius, ringCount) {
        const nodes = [];
        const arms = this.shapeParams.spiralArms;
        const turns = this.shapeParams.spiralTurns;
        const pointsPerArm = ringCount * 4;

        for (let arm = 0; arm < arms; arm++) {
            const armOffset = (arm / arms) * Math.PI * 2;

            for (let i = 0; i < pointsPerArm; i++) {
                const t = i / pointsPerArm;
                const angle = armOffset + t * Math.PI * 2 * turns;
                const radius = t * 0.9 + 0.1; // 0.1 to 1.0

                nodes.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    ring: Math.floor(t * ringCount),
                    color: this.ringColor(Math.floor(t * ringCount), ringCount),
                    type: this.ringType(Math.floor(t * ringCount)),
                    spiralArm: arm,
                    spiralT: t
                });
            }
        }

        return nodes;
    }

    /**
     * Generate Flower of Life sacred geometry
     */
    generateFlowerOfLife(centerX, centerY, maxRadius) {
        const nodes = [];
        const petals = this.shapeParams.flowerPetals;
        const layers = this.shapeParams.flowerLayers;

        // Center
        nodes.push({
            x: 0, y: 0,
            ring: 0,
            color: this.ringColor(0, layers),
            type: 'bass'
        });

        // Generate circles around center
        for (let layer = 1; layer <= layers; layer++) {
            const circlesInLayer = layer === 1 ? petals : petals * layer;
            const radius = layer * 0.25;

            for (let i = 0; i < circlesInLayer; i++) {
                const angle = (i / circlesInLayer) * Math.PI * 2;

                // Main circle center
                const cx = Math.cos(angle) * radius;
                const cy = Math.sin(angle) * radius;

                nodes.push({
                    x: cx,
                    y: cy,
                    ring: layer,
                    color: this.ringColor(layer, layers),
                    type: this.ringType(layer)
                });

                // Add petal intersections for flower of life effect
                if (layer > 1) {
                    const petalAngle = angle + Math.PI / petals;
                    const petalRadius = radius * 0.5;
                    nodes.push({
                        x: cx + Math.cos(petalAngle) * petalRadius * 0.5,
                        y: cy + Math.sin(petalAngle) * petalRadius * 0.5,
                        ring: layer,
                        color: this.ringColor(layer, layers),
                        type: 'sparkle'
                    });
                }
            }
        }

        return nodes;
    }

    /**
     * Generate star polygon pattern
     */
    generateStar(centerX, centerY, maxRadius, ringCount) {
        const nodes = [];
        const points = this.shapeParams.starPoints;
        const layers = this.shapeParams.starLayers;

        // Center
        nodes.push({
            x: 0, y: 0,
            ring: 0,
            color: this.ringColor(0, layers),
            type: 'bass'
        });

        for (let layer = 1; layer <= layers; layer++) {
            const radius = layer / layers;
            const innerRadius = radius * 0.5;

            for (let i = 0; i < points * 2; i++) {
                const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
                const r = i % 2 === 0 ? radius : innerRadius;

                nodes.push({
                    x: Math.cos(angle) * r,
                    y: Math.sin(angle) * r,
                    ring: layer,
                    color: this.ringColor(layer, layers),
                    type: i % 2 === 0 ? 'melodic' : 'sparkle'
                });
            }

            // Connect lines between points
            for (let i = 0; i < points; i++) {
                const angle1 = (i / points) * Math.PI * 2 - Math.PI / 2;
                const angle2 = ((i + 2) / points) * Math.PI * 2 - Math.PI / 2; // Skip one for star

                // Midpoint of star line
                const x1 = Math.cos(angle1) * radius;
                const y1 = Math.sin(angle1) * radius;
                const x2 = Math.cos(angle2) * radius;
                const y2 = Math.sin(angle2) * radius;

                nodes.push({
                    x: (x1 + x2) / 2,
                    y: (y1 + y2) / 2,
                    ring: layer,
                    color: this.ringColor(layer, layers),
                    type: 'atmospheric'
                });
            }
        }

        return nodes;
    }

    /**
     * Generate Lissajous curve
     */
    generateLissajous(centerX, centerY, maxRadius) {
        const nodes = [];
        const a = this.shapeParams.lissajousA;
        const b = this.shapeParams.lissajousB;
        const points = this.shapeParams.lissajousPoints;

        for (let i = 0; i < points; i++) {
            const t = (i / points) * Math.PI * 2;
            const x = Math.sin(a * t) * 0.8;
            const y = Math.sin(b * t) * 0.8;

            nodes.push({
                x,
                y,
                ring: Math.floor((i / points) * 6),
                color: this.ringColor(Math.floor((i / points) * 6), 6),
                type: this.ringType(i % 4),
                lissajousT: t
            });
        }

        return nodes;
    }

    /**
     * Generate grid pattern
     */
    generateGrid(centerX, centerY, maxRadius) {
        const nodes = [];
        const cols = this.shapeParams.gridCols;
        const rows = this.shapeParams.gridRows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Center the grid
                const x = ((col / (cols - 1)) - 0.5) * 1.6;
                const y = ((row / (rows - 1)) - 0.5) * 1.6;

                // Distance from center determines ring
                const dist = Math.sqrt(x * x + y * y);
                const ring = Math.floor(dist * 4);

                nodes.push({
                    x,
                    y,
                    ring,
                    color: this.ringColor(ring, 5),
                    type: this.ringType((row + col) % 4),
                    gridRow: row,
                    gridCol: col
                });
            }
        }

        return nodes;
    }

    /**
     * Generate fractal tree pattern
     */
    generateTree(centerX, centerY, maxRadius) {
        const nodes = [];
        const branches = this.shapeParams.treeBranches;
        const maxDepth = this.shapeParams.treeDepth;

        const generateBranch = (x, y, angle, depth, length) => {
            if (depth > maxDepth) return;

            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;

            nodes.push({
                x: endX,
                y: endY,
                ring: depth,
                color: this.ringColor(depth, maxDepth),
                type: this.ringType(depth),
                treeDepth: depth
            });

            // Create branches
            const branchAngle = Math.PI / 4;
            const newLength = length * 0.7;

            for (let i = 0; i < branches; i++) {
                const newAngle = angle + branchAngle * (i - (branches - 1) / 2);
                generateBranch(endX, endY, newAngle, depth + 1, newLength);
            }
        };

        // Root
        nodes.push({
            x: 0, y: 0.8,
            ring: 0,
            color: this.ringColor(0, maxDepth),
            type: 'bass'
        });

        // Start tree from bottom, growing upward
        generateBranch(0, 0.8, -Math.PI / 2, 1, 0.3);

        return nodes;
    }

    /**
     * Get color for a ring index
     */
    ringColor(ring, maxRings) {
        const colors = [
            '#4a9eff', '#ff6b9d', '#50fa7b', '#ffb86c',
            '#bd93f9', '#ff5555', '#8be9fd', '#f1fa8c'
        ];
        return colors[ring % colors.length];
    }

    /**
     * Get sound type for a ring index
     */
    ringType(ring) {
        const types = ['melodic', 'sparkle', 'atmospheric', 'bass'];
        return types[ring % types.length];
    }

    /**
     * Get available shape names
     */
    static getShapeNames() {
        return Object.keys(MandalaShapes.SHAPES);
    }

    /**
     * Get shape info
     */
    static getShapeInfo(name) {
        return MandalaShapes.SHAPES[name];
    }
}

window.MandalaShapes = MandalaShapes;
