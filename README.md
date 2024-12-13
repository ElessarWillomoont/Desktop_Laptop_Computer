# Desktop-Laptop Computer

# Raycaster Interaction Project

## Overview
This project implements interactive 3D objects using Three.js and raycasting techniques. Users can interact with objects through rotation, movement, toggling visibility, and hovering tooltips.

## Interaction Logic

### Types of Interactive Objects
1. **Movement Objects**: Objects with motion functionality are marked by a blinking white dot. Interaction is enabled by clicking on the object.

2. **Transformation Objects**: Objects with transformation functionality highlight in yellow when hovered. Clicking on these objects triggers a transformation.

3. **Explanation Objects**: Objects with explanatory functionality display a circular progress indicator around the cursor when hovered. After the circle fills, a text box appears, which can be closed by clicking the `x` in the top-right corner.

### Known Issue
- The raycaster occasionally interacts with all objects aligned along a straight line, causing interactions with multiple objects simultaneously. The cause of this issue is currently under investigation.

## Features
- **Rotation Interaction**: Selected objects can rotate around a defined axis when clicked.
- **Movement Interaction**: Objects can move linearly in a defined direction on interaction.
- **Mesh Toggle Interaction**: Enables toggling between different mesh states of the same object.
- **Hover Tooltips**: Displays explanatory tooltips for specific objects when hovered.

## Dependencies
- [Three.js](https://threejs.org/) for 3D rendering.
- [GSAP](https://greensock.com/gsap/) for animations.

## Setup Instructions
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the development server using `npm start`.
4. Access the application in your browser at `http://localhost:8080`.

## File Structure
- `index.html`: Entry point for the application.
- `src/`: Contains the main scripts for rendering and interaction.
  - `main.js`: Initializes the scene, renderer, and camera.
  - `animations.js`: Handles object animations and interactions.
  - `utils.js`: Utility functions for object traversal and material application.
  - `materials.js`: Material definitions for different object types.

## Referenced Models:

- **E-ATX Motherboard:**
  [Asset NUMI E-ATX Hole Pattern](https://sketchfab.com/3d-models/asset-numi-e-atx-hole-pattern-dc47b893dc7a4ef581f4fe1195c78693)

- **ATX Motherboard:**
  [X570 Prime Motherboard HQ PBR](https://sketchfab.com/3d-models/x570-prime-motherboard-hq-pbr-25b3659935774b1e9d73d8954be065d8)

- **Case Fan (currently unused):**
  [Simple Computer Fan](https://sketchfab.com/3d-models/simple-computer-fan-87e0b81409ca4a5cbf5ab194c73ba33a)

- **ATX Power Supply:**
  [ATX Power Supply](https://grabcad.com/library/atx-power-supply-2)

- **Graphics Card:**
  [EVGA RTX 3090](https://grabcad.com/library/evga-rtx-3090-1)

- **Keyboard (currently unused):**
  [Keyboard PC](https://grabcad.com/library/keyboard-pc-1)

- **Top-Down Air Cooler:**
  [ID-COOLING IS-30](https://grabcad.com/library/id-cooling-is-30-step-by-lee-dada-1)

- **Liquid Cooler:**
  [PC CPU Liquid Cooler](https://www.turbosquid.com/3d-models/pc-cpu-liquid-cooler-3d-1973422)

- The original page for the laptop model (used for extracting the screen and keyboard layout) is currently lost and will be updated later.

## Acknowledgments:
Special thanks to the authors of the above models for their selfless contributions, which made this project possible.
