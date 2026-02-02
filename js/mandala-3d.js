/**
 * 3D Mandala Mode
 * Renders the mandala using Three.js for depth and perspective effects
 */

class Mandala3D {
    constructor(container) {
        this.container = container;
        this.isActive = false;
        this.mandala2D = null; // Reference to 2D mandala for data

        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // 3D objects
        this.ringMeshes = [];
        this.nodeMeshes = [];
        this.triggerLine = null;
        this.centerGlow = null;
        this.connectionLines = [];

        // Animation
        this.rotationSpeed = 0.001;
        this.cameraOrbit = { angle: 0, radius: 500, height: 200 };
        this.autoRotate = true;

        // Reactive state
        this.reactiveState = null;
    }

    init(mandala2D) {
        this.mandala2D = mandala2D;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a12);
        this.scene.fog = new THREE.Fog(0x0a0a12, 400, 1000);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            1,
            2000
        );
        this.camera.position.set(0, 200, 500);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.display = 'none';
        this.renderer.domElement.id = 'three-canvas';
        this.container.appendChild(this.renderer.domElement);

        // Add lights
        this.addLights();

        // Create mandala geometry
        this.createMandala();

        // Add ambient particles
        this.createAmbientParticles();

        console.log('3D Mandala initialized');
    }

    addLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambient);

        // Point light at center
        const centerLight = new THREE.PointLight(0x6464c8, 1, 500);
        centerLight.position.set(0, 50, 0);
        this.scene.add(centerLight);
        this.centerLight = centerLight;

        // Directional light from above
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight.position.set(0, 300, 100);
        this.scene.add(dirLight);
    }

    createMandala() {
        if (!this.mandala2D || !this.mandala2D.rings) return;

        const maxRadius = 200; // 3D world units

        // Create rings
        this.mandala2D.rings.forEach((ring, ringIndex) => {
            const radius = ring.radiusRatio * maxRadius;
            const height = (this.mandala2D.rings.length - ringIndex) * 10; // Stack rings in Z

            // Ring geometry (torus)
            const ringGeometry = new THREE.TorusGeometry(radius, 1, 8, 64);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(ring.color),
                emissive: new THREE.Color(ring.color),
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.6
            });
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.rotation.x = Math.PI / 2;
            ringMesh.position.y = height;
            ringMesh.userData = { ringIndex, baseHeight: height };
            this.scene.add(ringMesh);
            this.ringMeshes.push(ringMesh);

            // Create nodes for this ring
            ring.nodes.forEach((node, nodeIndex) => {
                const nodeGeometry = new THREE.SphereGeometry(4, 16, 16);
                const nodeMaterial = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(node.color),
                    emissive: new THREE.Color(node.color),
                    emissiveIntensity: 0.3,
                    transparent: true,
                    opacity: 0.8
                });

                const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
                const x = Math.cos(node.baseAngle) * radius;
                const z = Math.sin(node.baseAngle) * radius;
                nodeMesh.position.set(x, height, z);
                nodeMesh.userData = { ringIndex, nodeIndex, radius, baseAngle: node.baseAngle };

                this.scene.add(nodeMesh);
                this.nodeMeshes.push(nodeMesh);
            });
        });

        // Create trigger line
        const lineGeometry = new THREE.BufferGeometry();
        const linePoints = [
            new THREE.Vector3(0, -50, -maxRadius * 1.1),
            new THREE.Vector3(0, 150, -maxRadius * 1.1)
        ];
        lineGeometry.setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        this.triggerLine = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(this.triggerLine);

        // Create center glow
        const glowGeometry = new THREE.SphereGeometry(20, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x6464c8,
            transparent: true,
            opacity: 0.3
        });
        this.centerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.centerGlow.position.y = 50;
        this.scene.add(this.centerGlow);
    }

    createAmbientParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 800;
            positions[i * 3 + 1] = Math.random() * 400 - 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x6688cc,
            size: 2,
            transparent: true,
            opacity: 0.4
        });

        this.ambientParticles = new THREE.Points(geometry, material);
        this.scene.add(this.ambientParticles);
    }

    activate() {
        this.isActive = true;
        this.renderer.domElement.style.display = 'block';
    }

    deactivate() {
        this.isActive = false;
        this.renderer.domElement.style.display = 'none';
    }

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
        return this.isActive;
    }

    update(deltaTime) {
        if (!this.isActive || !this.mandala2D) return;

        const time = performance.now() * 0.001;

        // Update camera orbit
        if (this.autoRotate) {
            this.cameraOrbit.angle += 0.0005 * deltaTime;
            this.camera.position.x = Math.sin(this.cameraOrbit.angle) * this.cameraOrbit.radius;
            this.camera.position.z = Math.cos(this.cameraOrbit.angle) * this.cameraOrbit.radius;
            this.camera.position.y = this.cameraOrbit.height + Math.sin(time * 0.5) * 50;
            this.camera.lookAt(0, 50, 0);
        }

        // Update rings and nodes based on 2D mandala state
        this.mandala2D.rings.forEach((ring, ringIndex) => {
            const ringMesh = this.ringMeshes[ringIndex];
            if (ringMesh) {
                // Rotate ring
                ringMesh.rotation.z = ring.currentRotation;

                // Reactive breathing
                const breathScale = this.reactiveState?.breathScale || 1;
                ringMesh.scale.set(breathScale, breathScale, 1);
            }
        });

        // Update nodes
        this.nodeMeshes.forEach(nodeMesh => {
            const { ringIndex, nodeIndex, radius, baseAngle } = nodeMesh.userData;
            const ring = this.mandala2D.rings[ringIndex];
            if (!ring) return;

            const node = ring.nodes[nodeIndex];
            if (!node) return;

            // Update position based on ring rotation
            const angle = ring.currentRotation + baseAngle;
            nodeMesh.position.x = Math.cos(angle) * radius;
            nodeMesh.position.z = Math.sin(angle) * radius;

            // Trigger effect
            if (node.triggerFade > 0) {
                const scale = 1 + node.triggerFade * 0.5;
                nodeMesh.scale.set(scale, scale, scale);
                nodeMesh.material.emissiveIntensity = 0.3 + node.triggerFade * 0.7;
            } else {
                nodeMesh.scale.set(1, 1, 1);
                nodeMesh.material.emissiveIntensity = 0.3;
            }
        });

        // Update center glow with reactive state
        if (this.centerGlow && this.reactiveState) {
            const pulse = this.reactiveState.glowPulse || 0;
            const scale = 1 + pulse * 0.5;
            this.centerGlow.scale.set(scale, scale, scale);
            this.centerGlow.material.opacity = 0.3 + pulse * 0.3;
        }

        // Animate ambient particles
        if (this.ambientParticles) {
            this.ambientParticles.rotation.y += 0.0001 * deltaTime;
        }
    }

    render() {
        if (!this.isActive) return;
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        if (!this.renderer) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        // Clean up Three.js resources
        this.scene?.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });

        this.renderer?.dispose();
        this.renderer?.domElement.remove();
    }

    // Settings
    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    setCameraHeight(height) {
        this.cameraOrbit.height = height;
    }

    setCameraDistance(distance) {
        this.cameraOrbit.radius = distance;
    }
}

window.Mandala3D = Mandala3D;
