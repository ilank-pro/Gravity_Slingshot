# Gravity Slingshot Challenge

A 3D solar system simulation game where players launch probes from outside the galaxy to hit targets using planetary gravity wells. This is a physics-based puzzle game that demonstrates orbital mechanics and gravity assist maneuvers.

## Features

- **3D Solar System**: Complete solar system with 8 planets orbiting the sun
- **Realistic Physics**: Gravity simulation with proper orbital mechanics
- **Gravity Slingshot**: Use planetary gravity to change probe trajectories
- **Interactive Controls**: 
  - Click and drag to aim probes
  - Mouse wheel to zoom
  - Right-click drag to rotate view
- **Power Control**: Adjustable launch power slider
- **Probe Tracking**: Follow launched probes through space
- **Target System**: Hit both stationary targets to win
- **Beautiful UI**: Modern space-themed interface

## How to Play

### Objective
Launch probes from outside the solar system and use planetary gravity to hit both red targets - one inside the solar system and one outside.

### Controls
- **Left Click + Drag**: Aim the probe launch direction
- **Mouse Wheel**: Zoom in/out of the solar system
- **Right Click + Drag**: Rotate the camera view around the solar system
- **Power Slider**: Adjust the launch power (10-100%)
- **Launch Probe Button**: Fire a probe with current settings
- **Track Probe Button**: Toggle camera following the active probe
- **Reset Button**: Clear all probes and restart the challenge

### Gameplay Tips
1. **Study the Orbital Patterns**: Planets move in real-time, so timing matters
2. **Use Gravity Wells**: Get close to large planets (especially Jupiter) to change direction
3. **Plan Your Trajectory**: The larger the planet, the stronger its gravitational pull
4. **Experiment with Power**: Different launch speeds create different orbital paths
5. **Watch for Slingshot Opportunities**: Use planetary flybys to gain speed and change direction

### Winning Condition
Hit both red targets to complete the challenge. Targets turn green when hit.

## Technical Details

### Physics Simulation
- Real-time gravitational forces from the sun and all planets
- Accurate mass-based gravity calculations
- Orbital mechanics with proper acceleration and velocity
- Collision detection for targets

### Solar System
- **Sun**: Central star with strong gravitational pull
- **8 Planets**: Mercury through Neptune with realistic relative sizes and orbits
- **Orbital Paths**: Visible orbit rings for reference
- **Dynamic Movement**: All planets orbit at different speeds

## Running the Game

### Local Development
1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. The game will load automatically

### Requirements
- Modern web browser with WebGL support
- Internet connection (for Three.js CDN)

### Files
- `index.html` - Main game page with UI
- `game.js` - Complete game logic and 3D rendering
- `README.md` - This documentation

## Game Architecture

### Classes and Components
- **GravitySlingshotGame**: Main game class managing all systems
- **Solar System**: 3D scene with sun, planets, and orbital mechanics
- **Physics Engine**: Real-time gravity simulation and collision detection
- **UI System**: Controls, stats, and visual feedback
- **Camera System**: 3D navigation and probe tracking

### Technologies Used
- **Three.js**: 3D graphics and rendering
- **WebGL**: Hardware-accelerated graphics
- **HTML5 Canvas**: Rendering surface
- **Modern JavaScript**: ES6 classes and features

## Future Enhancements

Potential improvements for the game:
- Multiple difficulty levels
- More complex target patterns
- Additional celestial bodies (moons, asteroids)
- Probe trail visualization
- Multiplayer challenges
- Achievement system
- Sound effects and music

## Credits

Inspired by real space missions that use gravity assist maneuvers, such as:
- Voyager spacecraft missions
- Cassini-Huygens mission to Saturn
- New Horizons mission to Pluto

Built with Three.js and modern web technologies. 