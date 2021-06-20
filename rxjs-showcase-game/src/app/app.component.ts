import { CanvasCoordinates, GameAction, GAME_ACTOR, GameState } from './../models/interfaces';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Observable, Subscription, timer, merge, fromEvent, Subject, interval } from 'rxjs';
import { first, map, mapTo, scan, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;  
  game$: Observable<any>;
  gameTimer$: Observable<GameAction>;
  computerMove$: Observable<any>;
  userMove$: Observable<any>;
  subcriptions: Subscription[] = [];
  countDown: number = 60;
  CELL_SIZE: number = 100;
  initGameState: GameState;
  
  private ctx: CanvasRenderingContext2D;

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.drawCanvas();
    this.initGame();
  }
 
  initGame() {
    this.initGameBoard();
    this.setGameTimer();
    this.simulateComputerMove();
    this.setUserMove();

    this.game$ = merge(this.gameTimer$, this.computerMove$, this.userMove$);
    this.subcriptions.push(this.game$.pipe(
      // startWith( () => null),
      scan(this.updateGameState, this.initGameState)
    ).subscribe( gameState => {
      console.log('Emilio gameState: ', gameState);
    }));
  }

  initGameBoard() {
    this.initGameState = {
      score: 0,
      finished: false,
      board: Array(3).fill(null).map( () => Array(3).fill(0)),
      time_left: this.countDown
    }; 
  }

  updateGameState = (gameState: GameState, action: GameAction): GameState => {
    if (!action) return gameState;
    if (action.actor === GAME_ACTOR.TIMER) {
      gameState.time_left = action.time_left;
      if (action.time_left <= 0) gameState.finished = true;
    } else if (action.actor === GAME_ACTOR.COMPUTER) {
      const computerAction: GameAction = this.computerMove(gameState.board)
      this.drawVirus(computerAction.coordinates);
      gameState.board[computerAction.coordinates.cell_y][computerAction.coordinates.cell_x] = 1;
    } else if (action.actor === GAME_ACTOR.USER) {
      this.removeVirus(action.coordinates);
      gameState.score++;
    }
    return gameState;
  };

  setGameTimer() {
    this.gameTimer$ = timer(1000, 2000).pipe(
      startWith(() => this.countDown + 1),
      map( () => {
        return {actor: GAME_ACTOR.TIMER, time_left: this.countDown}
      })
    );
  }
  simulateComputerMove() {
    this.computerMove$ =  interval(1000).pipe(
      mapTo({actor: GAME_ACTOR.COMPUTER})
    );
  }
  computerMove(board: any): GameAction {
    const randomEmptyCell = this.getEmptyCell(board);
    const computerAction: GameAction = {actor: GAME_ACTOR.COMPUTER, coordinates: randomEmptyCell};
    return computerAction;
  }
  setUserMove() {
    this.userMove$ = fromEvent(this.canvas.nativeElement, 'click').pipe(
      map( (event: Event) => {
        const clickCoordinates: CanvasCoordinates = { 
          cell_x: Math.floor(event['offsetX'] / this.CELL_SIZE),
          cell_y: Math.floor(event['offsetY'] / this.CELL_SIZE)
        };
        const gameAction: GameAction= {actor: GAME_ACTOR.USER, coordinates: clickCoordinates };
        return gameAction;
      })
    );
  }

  getEmptyCell(gameState: GameState): CanvasCoordinates {
    const getValidCells = (board: any[]): CanvasCoordinates[] => {
      const cells: CanvasCoordinates[] = [];
      const boardLength: number = board.length;
      const board_X_axix_Length: number = board[0].length;
      for(let x=0; x < boardLength; x++) {
        for(let y=0; y < board_X_axix_Length; y++) {
          if (gameState.board[y][x] == 0) cells.push({cell_x: x, cell_y: y});
        }
      }
      return cells;
    };
    const validCells: CanvasCoordinates[] = getValidCells(gameState.board);
    const getRamdomCellIndex = (): number => Math.floor(Math.random() * validCells.length);
    return validCells[getRamdomCellIndex()];
  }

  drawCanvas() {
    this.drawVerticalLines(100, 500,  1);
    this.drawVerticalLines(200, 500,  1);
    this.drawVerticalLines(300, 500,  1);
    this.drawVerticalLines(400, 500,  1);
    this.drawVerticalLines(500, 500,  1);
    this.drawVerticalLines(600, 500,  1);
    this.drawVerticalLines(700, 500,  1);
    this.drawVerticalLines(800, 500,  1);
    this.drawVerticalLines(900, 500,  1);

    this.drawHorizontalLines(1000, 100);
    this.drawHorizontalLines(1000, 200);
    this.drawHorizontalLines(1000, 300);
    this.drawHorizontalLines(1000, 400);

  }

 
  
  
  drawVerticalLines(x: number, y: number, z: number) {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  drawHorizontalLines(x: number, y: number) {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  drawVirus(coordinates: CanvasCoordinates) {
    let img = new Image();
    img.src = './assets/covid.jpg';
    img.onload = () => {
      this.ctx.drawImage(img, coordinates.cell_x * 100, coordinates.cell_y*100, 100, 100)
    }
  }
  removeVirus(coordinates: CanvasCoordinates) {
    let img = new Image();
    img.src = './assets/covidProtected.png';
    img.onload = () => {
      this.ctx.drawImage(img, coordinates.cell_x * 100, coordinates.cell_y*100, 100, 100)
    }
  }


  ngOnDestroy(): void {
    this.subcriptions.forEach( (subscription: Subscription) => subscription.unsubscribe());
  }

}
