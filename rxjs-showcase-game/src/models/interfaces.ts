export interface GameAction {
    actor: GAME_ACTOR,
    coordinates?: CanvasCoordinates;
    time_left?: number;
}
  
export interface CanvasCoordinates {
    cell_x: number;
    cell_y: number;
}
  
export interface GameState {
    score: number;
    finished: boolean;
    board: any;
    time_left: number;
}
  
export enum GAME_ACTOR {
    TIMER = 'timer',
    COMPUTER = 'computer',
    USER = 'user'
}
  