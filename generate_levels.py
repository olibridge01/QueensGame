import random
import argparse
import numpy as np
from typing import Tuple, List
import matplotlib.pyplot as plt

def get_neighbours(colour_grid: np.ndarray, i: int, j: int) -> List[Tuple[int, int]]:
    """Get all non-coloured neighbours of a cell."""
    neighbours = []
    if i-1 >= 0 and colour_grid[i-1][j] == -1:
        neighbours.append((i-1, j))
    if i+1 < len(colour_grid) and colour_grid[i+1][j] == -1:
        neighbours.append((i+1, j))
    if j-1 >= 0 and colour_grid[i][j-1] == -1:
        neighbours.append((i, j-1))
    if j+1 < len(colour_grid[0]) and colour_grid[i][j+1] == -1:
        neighbours.append((i, j+1))
    return neighbours

def get_banned_neighbours(colour_grid: np.ndarray, queens: List[int], i_queen: int) -> Tuple[set, set]:
    """If another color is in the row or column of the queen, that color's queen's row/column is banned."""

    # Find which colours are in the same row or column as the queen
    row_colours = {colour_grid[i_queen][j] for j in range(len(colour_grid))} - {-1, i_queen}
    banned_rows = row_colours

    col_colours = {colour_grid[i][queens[i_queen]] for i in range(len(colour_grid))} - {-1, i_queen}
    banned_cols = {queens[j] for j in col_colours}

    return banned_rows, banned_cols

def get_colour_neighbourhood(colour_grid: np.ndarray, colour: int, queens: List[int]) -> List[Tuple[int, int]]:
    """Given colour, return all neighbours of that colour."""
    neighbourhood = []
    colour_area = np.where(colour_grid == colour)
    for i, j in zip(colour_area[0], colour_area[1]):
        neighbours = get_neighbours(colour_grid, i, j)

        # Remove neighbours that are banned
        banned_rows, banned_cols = get_banned_neighbours(colour_grid, queens, colour)
        neighbours = [n for n in neighbours if n[0] not in banned_rows and n[1] not in banned_cols]

        neighbourhood.extend(neighbours)
    return neighbourhood

def coloured(colour_grid: np.ndarray) -> bool:
    """Check if all cells are coloured."""
    return np.all(colour_grid != -1)

def generate_board(grid_size: int, threshold: int = 2000, save_history: bool = False) -> Tuple[List[int], np.ndarray]:
    """Generate a valid queens level."""
    assert grid_size >= 4, "Grid size must be at least 4."
    
    while True:
        queens = []
        valid = False
        while True:
            queens = list(range(grid_size))
            random.shuffle(queens)
            for j in range(grid_size-1):
                if abs(queens[j] - queens[j+1]) <= 1:
                    valid = False
                    break
                else:
                    valid = True
            if valid:
                break

        # Generate colors for the board
        colours = np.full((grid_size, grid_size), -1)

        # Initialise colors at position of queens
        for i in range(grid_size):
            colours[i][queens[i]] = i

        if save_history:
            history = [colours.copy()]

        count = 0
        while not coloured(colours):
            colour = random.randint(0, grid_size-1)
            neighbourhood = get_colour_neighbourhood(colours, colour, queens)
            if neighbourhood:
                i, j = random.choice(neighbourhood)
                colours[i][j] = colour
            count += 1
            if save_history:
                history.append(colours.copy())
            if count > threshold:
                print("Failed to generate a valid board.")
                break

        if coloured(colours):
            print(count)
            print("Board generated successfully.")
            break

    if save_history:
        return queens, colours, history
        
    return queens, colours

def get_colour_nums(colours: np.ndarray) -> dict:
    """Get the number of cells of each colour."""
    colour_nums = {}
    for i in range(len(colours)):
        for j in range(len(colours[0])):
            if colours[i][j] in colour_nums:
                colour_nums[colours[i][j]] += 1
            else:
                colour_nums[colours[i][j]] = 1
    return colour_nums

def save_boards(queens_list: List[List[int]], colours_list: List[np.ndarray], filename: str):
    """Save a series of boards to a JSON file."""
    import json
    data = []
    for queens, colours in zip(queens_list, colours_list):
        data.append({"queens": queens, "grid": colours.tolist()})
    
    # Save to JSON file in a readable format 
    with open(filename, 'w') as f:
        json.dump(data, f)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Generate Queens levels.")
    parser.add_argument("grid_size_min", type=int, help="Minimum grid size.")
    parser.add_argument("grid_size_max", type=int, help="Maximum grid size.")
    parser.add_argument("num_levels", type=int, help="Number of levels to generate.")
    args = parser.parse_args()

    assert args.grid_size_min >= 4, "Minimum grid size must be at least 4."
    assert args.grid_size_max >= args.grid_size_min, "Maximum grid size must be greater than or equal to minimum grid size."
    assert args.num_levels >= 1, "Number of levels must be at least 1."

    # Max grid size assertion for no reason other than that I have hard-coded only 18 colours into the web-app
    assert args.grid_size_max <= 18, "Maximum grid size must be at most 18."

    # Get list of grid sizes of size num_levels distributed evenly between grid_size_min and grid_size_max
    grid_sizes = np.linspace(args.grid_size_min, args.grid_size_max, args.num_levels, dtype=int)

    queens_list = []
    colours_list = []

    for i in range(args.num_levels):
        min_colours = 0
        while min_colours < 2:
            queens, colours = generate_board(grid_sizes[i])
            colour_nums = get_colour_nums(colours)
            min_colours = min(colour_nums.values())
            print(f"min_colours: {min_colours}")
        queens_list.append(queens)
        colours_list.append(colours)

    # Shuffle queens list and colours list
    zipped = list(zip(queens_list, colours_list))
    random.shuffle(zipped)
    queens_list, colours_list = zip(*zipped)

    save_boards(queens_list, colours_list, "assets/levels.json")