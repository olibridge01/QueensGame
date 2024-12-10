[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](#)
[![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#)
[![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=fff)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)

<p align="center">
    <img width="80%" src="https://github.com/user-attachments/assets/d52851ba-79b9-4168-8d8b-268a6d2f7f64">
</p>

## Puzzle Web Application Based on *Queens* by LinkedIn

**Play the game at <a href="https://olibridge01.github.io/QueensGame" target="_blank">olibridge01.github.io/QueensGame</a>**

This repository contains an implementation of the [LinkedIn *Queens*](https://www.linkedin.com/games/queens/) puzzle in a web application. The puzzle is a generalization of the $N$-Queens problem, where the goal is to place $N$ queens on an $N \times N$ chessboard such that no two queens attack each other. In this variation, the queens may also only occupy a single colour region each.

### Quick Start
To run the level generation scripts in this repository, run the following:
```bash
git clone https://github.com/olibridge01/QueensGame.git
cd QueensGame
pip install -r requirements.txt

python generate_levels.py [min_grid_size] [max_grid_size] [num_levels]
```
This generates a JSON file, `levels.json`, containing the generated levels.



### Level Generation

The unique thing about the *Queens* puzzle is that each level has a **unique solution**. In order to generate levels, the algorithm is as follows:
1. Generate a random $N \times N$ chessboard, with a queen in each row and columns assigned randomly.
2. Randomly shuffle the columns of the chessboard until it is a valid solution.
4. Generate the colour regions by iteratively expanding from the queen's cells. When assessing candidate cells to expand to, a cell may not expand into the row/column of a queen whose colour already occupies the row/column of the current queen. This ensures there are no trivial swaps of rows/columns that would make the puzzle have multiple solutions.

Below is a `.gif` depiction of the colour region expansion process:


<p align="center">
    <img width="40%" src="https://github.com/user-attachments/assets/75b26b3e-b5ab-4b7a-b86e-414b361e3dbe">
</p>

To plot the frames of the `.gif` yourself, run
```bash
python plot_generation.py [grid_size]
```
This creates an `images/` directory containing the frames of the colour region expansion process. This can be converted to a `.gif` using a tool like `ImageMagick`:
```bash
convert -delay 5 -loop 0 images/*.png queens.gif
```

### Web Application

I built a simple web HTML/CSS/JS app to host some of the levels generated with `generate_levels.py`. The levels are stored in a JSON file and are loaded into the web app using JavaScript. The user can then interact with the levels by placing queens on the board and receive a time for their solve.
<p align="center">
    <img width="48%" alt="queens2" src="https://github.com/user-attachments/assets/772252f9-d10f-470f-8786-45f114142e5a">
    <img width="48%" alt="queens1" src="https://github.com/user-attachments/assets/d8e2e24b-9797-46de-a4a4-cd4be92eec74">
</p>