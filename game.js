class GravitySlingshotGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Game state
        this.gameState = {
            targetsHit: 0,
            probesUsed: 0,
            power: 100,
            isAiming: false,
            aimStart: { x: 0, y: 0 },
            aimEnd: { x: 0, y: 0 },
            trackProbe: false
        };
        
        // Solar system objects
        this.sun = null;
        this.planets = [];
        this.planetData = [
            { name: 'Mercury', distance: 8, size: 0.8, color: 0xffa500, speed: 0.02, mass: 1 },
            { name: 'Venus', distance: 12, size: 1.2, color: 0xffd700, speed: 0.015, mass: 2 },
            { name: 'Earth', distance: 16, size: 1.5, color: 0x6b93d6, speed: 0.01, mass: 3 },
            { name: 'Mars', distance: 20, size: 1.0, color: 0xff4500, speed: 0.008, mass: 1.5 },
            { name: 'Jupiter', distance: 28, size: 4, color: 0xffa500, speed: 0.005, mass: 20 },
            { name: 'Saturn', distance: 36, size: 3.5, color: 0xffeb3b, speed: 0.004, mass: 15 },
            { name: 'Uranus', distance: 44, size: 2.5, color: 0x4fc3f7, speed: 0.003, mass: 8 },
            { name: 'Neptune', distance: 52, size: 2.5, color: 0x3f51b5, speed: 0.002, mass: 8 }
        ];
        
        // Targets and probes
        this.targets = [];
        this.probes = [];
        this.trajectoryLines = [];
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupLighting();
        this.setupSolarSystem();
        this.setupTargets();
        this.setupControls();
        this.setupEventListeners();
        this.updateUI();
        this.animate();
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 30, 60);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('canvas3d'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Sun light
        const sunLight = new THREE.PointLight(0xffffff, 2, 300);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
    }
    
    setupSolarSystem() {
        // Create sun
        const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // Create orbit lines
        this.planetData.forEach(planetInfo => {
            const orbitGeometry = new THREE.RingGeometry(planetInfo.distance - 0.1, planetInfo.distance + 0.1, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x333333,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = -Math.PI / 2;
            this.scene.add(orbit);
        });
        
        // Create planets
        this.planetData.forEach((planetInfo, index) => {
            const geometry = new THREE.SphereGeometry(planetInfo.size, 16, 16);
            const material = new THREE.MeshLambertMaterial({ color: planetInfo.color });
            const planet = new THREE.Mesh(geometry, material);
            
            planet.castShadow = true;
            planet.receiveShadow = true;
            planet.userData = {
                distance: planetInfo.distance,
                speed: planetInfo.speed,
                angle: Math.random() * Math.PI * 2,
                mass: planetInfo.mass,
                name: planetInfo.name
            };
            
            this.planets.push(planet);
            this.scene.add(planet);
        });
    }
    
    setupTargets() {
        // Target 1: Inside solar system
        const target1Geometry = new THREE.RingGeometry(1, 1.5, 8);
        const target1Material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const target1 = new THREE.Mesh(target1Geometry, target1Material);
        target1.position.set(25, 0, 0);
        target1.rotation.x = -Math.PI / 2;
        target1.userData = { hit: false, id: 1 };
        this.targets.push(target1);
        this.scene.add(target1);
        
        // Target 2: Outside solar system
        const target2 = target1.clone();
        target2.position.set(-70, 0, 0);
        target2.userData = { hit: false, id: 2 };
        this.targets.push(target2);
        this.scene.add(target2);
    }
    
    setupControls() {
        // Simple orbit controls
        this.setupOrbitControls();
    }
    
    setupOrbitControls() {
        let isRotating = false;
        let isZooming = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Right click
                isRotating = true;
                previousMousePosition = { x: event.clientX, y: event.clientY };
            } else if (event.button === 0) { // Left click
                this.startAiming(event);
            }
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (isRotating) {
                const deltaX = event.clientX - previousMousePosition.x;
                const deltaY = event.clientY - previousMousePosition.y;
                
                // Rotate camera around origin
                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= deltaX * 0.01;
                spherical.phi += deltaY * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                
                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);
                
                previousMousePosition = { x: event.clientX, y: event.clientY };
            } else if (this.gameState.isAiming) {
                this.updateAiming(event);
            }
        });
        
        canvas.addEventListener('mouseup', (event) => {
            if (event.button === 2) {
                isRotating = false;
            } else if (event.button === 0 && this.gameState.isAiming) {
                this.endAiming(event);
            }
        });
        
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            const zoom = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(zoom);
            
            // Clamp zoom
            const distance = this.camera.position.length();
            if (distance < 10) this.camera.position.normalize().multiplyScalar(10);
            if (distance > 200) this.camera.position.normalize().multiplyScalar(200);
        });
        
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setupEventListeners() {
        // Wait for DOM to be fully loaded
        setTimeout(() => {
            // Power slider
            const powerSlider = document.getElementById('powerSlider');
            if (powerSlider) {
                powerSlider.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = powerSlider.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const width = rect.width;
                    this.gameState.power = Math.max(10, Math.min(100, (x / width) * 100));
                    this.updateUI();
                });
            }
            
            // Buttons
            const launchBtn = document.getElementById('launchBtn');
            if (launchBtn) {
                launchBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.launchProbe();
                });
            }
            
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resetGame();
                });
            }
            
            const trackBtn = document.getElementById('trackBtn');
            if (trackBtn) {
                trackBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.gameState.trackProbe = !this.gameState.trackProbe;
                    this.updateUI();
                });
            }
        }, 100);
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    startAiming(event) {
        this.gameState.isAiming = true;
        this.gameState.aimStart = { x: event.clientX, y: event.clientY };
        this.gameState.aimEnd = { x: event.clientX, y: event.clientY };
        
        const crosshair = document.getElementById('crosshair');
        crosshair.style.display = 'block';
        crosshair.style.left = (event.clientX - 10) + 'px';
        crosshair.style.top = (event.clientY - 10) + 'px';
    }
    
    updateAiming(event) {
        this.gameState.aimEnd = { x: event.clientX, y: event.clientY };
        
        const crosshair = document.getElementById('crosshair');
        crosshair.style.left = (event.clientX - 10) + 'px';
        crosshair.style.top = (event.clientY - 10) + 'px';
        
        this.showTrajectoryPreview();
    }
    
    endAiming(event) {
        this.gameState.isAiming = false;
        document.getElementById('crosshair').style.display = 'none';
        this.clearTrajectoryPreview();
    }
    
    showTrajectoryPreview() {
        this.clearTrajectoryPreview();
        
        const dx = this.gameState.aimEnd.x - this.gameState.aimStart.x;
        const dy = this.gameState.aimEnd.y - this.gameState.aimStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 10) {
            const line = document.createElement('div');
            line.className = 'trajectory-line';
            line.style.left = this.gameState.aimStart.x + 'px';
            line.style.top = this.gameState.aimStart.y + 'px';
            line.style.width = length + 'px';
            line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
            
            document.body.appendChild(line);
            this.trajectoryLines.push(line);
        }
    }
    
    clearTrajectoryPreview() {
        this.trajectoryLines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        });
        this.trajectoryLines = [];
    }
    
    launchProbe() {
        if (this.gameState.isAiming) return;
        
        // Calculate launch direction from camera position
        const launchPosition = this.camera.position.clone().normalize().multiplyScalar(80);
        
        // Random slight variation in launch position
        launchPosition.x += (Math.random() - 0.5) * 10;
        launchPosition.z += (Math.random() - 0.5) * 10;
        
        // Direction towards center with some user input influence
        const direction = new THREE.Vector3(0, 0, 0).sub(launchPosition).normalize();
        
        // Add user aim influence
        const aimDx = (this.gameState.aimEnd.x - this.gameState.aimStart.x) * 0.01;
        const aimDy = (this.gameState.aimEnd.y - this.gameState.aimStart.y) * 0.01;
        
        direction.x += aimDx;
        direction.y -= aimDy;
        direction.normalize();
        
        // Create probe
        const probeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const probeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            emissive: 0x003300
        });
        const probe = new THREE.Mesh(probeGeometry, probeMaterial);
        probe.position.copy(launchPosition);
        
        // Set velocity based on power
        const velocity = direction.multiplyScalar(this.gameState.power * 0.02);
        
        probe.userData = {
            velocity: velocity,
            trail: [],
            active: true
        };
        
        this.probes.push(probe);
        this.scene.add(probe);
        
        this.gameState.probesUsed++;
        this.updateUI();
    }
    
    updatePhysics() {
        const dt = 0.016; // 60 FPS
        const G = 50; // Gravity constant (scaled for gameplay)
        
        this.probes.forEach((probe, probeIndex) => {
            if (!probe.userData.active) return;
            
            const acceleration = new THREE.Vector3(0, 0, 0);
            
            // Sun gravity
            const sunDistance = probe.position.length();
            if (sunDistance > 3) { // Don't let probes crash into sun
                const sunForce = G * 100 / (sunDistance * sunDistance); // Sun mass = 100
                const sunDirection = probe.position.clone().normalize().multiplyScalar(-1);
                acceleration.add(sunDirection.multiplyScalar(sunForce));
            }
            
            // Planet gravity
            this.planets.forEach(planet => {
                const planetPos = planet.position;
                const distance = probe.position.distanceTo(planetPos);
                
                if (distance > planet.userData.mass && distance < planet.userData.mass * 20) {
                    const force = G * planet.userData.mass / (distance * distance);
                    const direction = planetPos.clone().sub(probe.position).normalize();
                    acceleration.add(direction.multiplyScalar(force));
                }
            });
            
            // Update velocity and position
            probe.userData.velocity.add(acceleration.multiplyScalar(dt));
            probe.position.add(probe.userData.velocity.clone().multiplyScalar(dt));
            
            // Add to trail
            probe.userData.trail.push(probe.position.clone());
            if (probe.userData.trail.length > 100) {
                probe.userData.trail.shift();
            }
            
            // Check target collisions
            this.targets.forEach(target => {
                if (!target.userData.hit && probe.position.distanceTo(target.position) < 2) {
                    target.userData.hit = true;
                    target.material.color.setHex(0x00ff00);
                    this.gameState.targetsHit++;
                    this.updateUI();
                    
                    // Victory check
                    if (this.gameState.targetsHit >= 2) {
                        setTimeout(() => {
                            alert('Congratulations! You hit both targets!');
                        }, 100);
                    }
                }
            });
            
            // Remove probe if too far away
            if (probe.position.length() > 150) {
                probe.userData.active = false;
                this.scene.remove(probe);
                this.probes.splice(probeIndex, 1);
            }
        });
    }
    
    updatePlanets() {
        this.planets.forEach(planet => {
            planet.userData.angle += planet.userData.speed;
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
            planet.rotation.y += 0.02;
        });
    }
    
    updateCamera() {
        if (this.gameState.trackProbe && this.probes.length > 0) {
            const activeProbe = this.probes.find(p => p.userData.active);
            if (activeProbe) {
                const offset = new THREE.Vector3(0, 10, 20);
                this.camera.position.copy(activeProbe.position).add(offset);
                this.camera.lookAt(activeProbe.position);
            }
        }
    }
    
    updateUI() {
        document.getElementById('targetsHit').textContent = this.gameState.targetsHit;
        document.getElementById('probesUsed').textContent = this.gameState.probesUsed;
        document.getElementById('powerValue').textContent = Math.round(this.gameState.power);
        document.getElementById('powerFill').style.width = this.gameState.power + '%';
        document.getElementById('trackBtn').textContent = 
            'Track Probe: ' + (this.gameState.trackProbe ? 'ON' : 'OFF');
    }
    
    resetGame() {
        // Remove all probes
        this.probes.forEach(probe => {
            this.scene.remove(probe);
        });
        this.probes = [];
        
        // Reset targets
        this.targets.forEach(target => {
            target.userData.hit = false;
            target.material.color.setHex(0xff0000);
        });
        
        // Reset game state
        this.gameState.targetsHit = 0;
        this.gameState.probesUsed = 0;
        this.gameState.trackProbe = false;
        
        // Reset camera
        this.camera.position.set(0, 30, 60);
        this.camera.lookAt(0, 0, 0);
        
        this.clearTrajectoryPreview();
        this.updateUI();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updatePlanets();
        this.updatePhysics();
        this.updateCamera();
        
        // Animate targets
        this.targets.forEach(target => {
            if (!target.userData.hit) {
                target.rotation.z += 0.02;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new GravitySlingshotGame();
}); 