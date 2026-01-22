
# LexiQuest Game Design

## Game Title
**LexiQuest: The Ultimate Word Journey**

## Game Objective
The goal is to find as many words as possible from a grid of random letters before the timer runs out. Players must reach a specific score threshold to advance to the next level.

## Rules and Gameplay Mechanics
1.  **Grid Selection**: Players click/tap letters in any order from the grid to form words. Letters do not need to be adjacent.
2.  **Word Length**: Words must be at least 3 letters long.
3.  **Submission**: Words are submitted manually. Once a word is used, the score increases. The same cell cannot be used twice in a single word.
4.  **Timer**: Each level has a dynamic timer based on level difficulty.

## Level Progression System
-   **Level 1-4**: 4x4 Grid. Common letters.
-   **Level 5+**: 5x5 Grid. Less common letters (X, Q, Z) and harder distributions introduced.
-   **Minimum Requirements**: Each level requires both a target score and a minimum number of words found (starting at 3).

## Scoring System
-   Base points determined by individual letter values (A=1, Z=10, etc.).
-   Length bonuses for words longer than 4 letters.
-   Score multiplied by the current level.

## Hints and Penalties
-   **Hints**: Powered by Gemini AI. The hint reveals one valid word currently on the board. Cost scales with level.
-   **Penalties**: Invalid word attempts subtract 5 points.

## User Interface Description
-   **Top Bar**: Level display, Timer (circular progress), Score.
-   **Center**: The Letter Grid with interactive selection animations.
-   **Bottom**: Current word preview, Submit/Reset buttons, and collection list.

## Gameplay Loop
1.  **Start**: Board generates based on level configuration.
2.  **Play**: Player selects letters from the grid to build words.
3.  **Feedback**: Instant visual feedback on selection and submission.
4.  **End**: Timer hits zero.
5.  **Evaluate**: If score >= target AND word count >= minimum, Level Up! Else, Game Over.
