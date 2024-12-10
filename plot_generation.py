import os
import argparse
import numpy as np
from typing import List, Tuple
import matplotlib.pyplot as plt

from generate_levels import generate_board

def plot_generation(history: List[np.ndarray]) -> None:
    """Plot the generation of a board."""

    grid_size = len(history[0])
    for i_grid, colour_grid in enumerate(history):
        # Ensure the cmap is consistent across all plots
        cmap = plt.get_cmap('tab20', grid_size)

        # Set colour of -1 cells
        cmap.set_under('white')

        plt.figure(figsize=(grid_size, grid_size))
        for i in range(grid_size):
            for j in range(grid_size):
                plt.fill_between([j, j+1], grid_size-i, grid_size-i-1, color=cmap(colour_grid[i][j]))

        # Place solid queen icon
        for i, j in enumerate(queens):
            plt.text(j+0.5, grid_size-i-0.5, '♛', fontsize=20, ha='center', va='center', color='black')

        # Draw gridlines
        for i in range(grid_size+1):
            plt.plot([0, grid_size], [i, i], color='black', lw=1)
            plt.plot([i, i], [0, grid_size], color='black', lw=1)

        if not os.path.exists("images"):
            os.makedirs("images")
        plt.axis('off')
        # Zero pad the image number
        file_num = str(i_grid).zfill(4) 
        plt.savefig(f"images/queens_{file_num}.png", bbox_inches='tight', dpi=250)
        plt.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Queens level generation history.")
    parser.add_argument("grid_size", type=int, help="Size of the grid.")
    args = parser.parse_args()

    grid_size = args.grid_size
    threshold = 2000
    queens, colour_grid, history = generate_board(grid_size, threshold, save_history=True)
    plot_generation(history)