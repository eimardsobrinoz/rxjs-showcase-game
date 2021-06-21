import { CanvasCoordinates, GameAction, GAME_ACTOR, GameState } from './../models/interfaces';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, Subscription, timer, merge, fromEvent, Subject, interval, BehaviorSubject } from 'rxjs';
import { filter, map, mapTo, mergeMap, scan, startWith, takeWhile, tap, timestamp, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('startButton', { static: true }) startButton: ElementRef;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;  
  game$: Observable<GameState>;
  gameState$: BehaviorSubject<GameState>;
  gameTimer$: Observable<GameAction>;
  computerMove$: Observable<any>;
  userMove$: Observable<any>;
  subcriptions: Subscription[] = [];
  countDown: number = 20;
  score: number = 0;
  CELL_SIZE: number = 100;
  audio: any;
  caputedFailed: any;
  private ctx: CanvasRenderingContext2D;

  ngOnInit(): void {
    this.playPaletteTownAudio();
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d'); 
    this.setGame();
    this.subcriptions.push(
      this.game$.subscribe( (gameState: GameState) => {
        if (gameState.finished)  {
          this.playVictoyAudio();
        }
      })
    );
  }

  setGame() {
    this.drawCanvas();
    this.game$ = fromEvent(this.startButton.nativeElement, 'click').pipe(
      tap( () => this.playBattleAudio()),
      mergeMap( () => this.initGame()),
    );
  }

 
  initGame(): Observable<GameState>  {
    this.initGameBoard();
    this.setGameTimer();
    this.simulateComputerMove();
    this.setUserMove();

    const game$: Observable<GameState> = merge(this.gameTimer$, this.computerMove$, this.userMove$).pipe(
      startWith( () => null),
      scan(this.updateGameState, this.gameState$.value),
      // I use gameState$ behavior subject as a proxy in order to avoid circular dependency
      tap( (gameStateUpdated: GameState) => this.gameState$.next(gameStateUpdated)),
      tap((gameState: GameState) => {
        this.countDown = gameState.time_left;
        this.score = gameState.score;
      }),
      takeWhile( ({finished}) => finished == false, true)
    );
    return game$;
  }

  initGameBoard() {
    const initGameState: GameState= {
      score: 0,
      finished: false,
      board: Array(5).fill(null).map( () => Array(5).fill(0)),
      time_left: this.countDown
    }; 
    this.gameState$ = new BehaviorSubject<GameState>(initGameState);
  }

  updateGameState = (gameState: GameState, action: GameAction): GameState => {
    if (!action) return gameState;
    if (action.actor === GAME_ACTOR.TIMER) {
      gameState.time_left = action.time_left;
      if (action.time_left <= 0) gameState.finished = true;
    } else if (action.actor === GAME_ACTOR.COMPUTER && action.coordinates) {
      this.drawPokemon(action.coordinates);
      gameState.board[action.coordinates.cell_y][action.coordinates.cell_x] = 1;
    } else if (action.actor === GAME_ACTOR.USER) {
      if (gameState.board[action.coordinates.cell_y][action.coordinates.cell_x]) {
        this.capturePokemon(action.coordinates);
        gameState.score++;
      } else {
        this.playCapturedFailed();
        gameState.score--;
      }
    }
    return gameState;
  };

  setGameTimer() {
    this.gameTimer$ = timer(0, 1000).pipe(
      map( () => {
        this.countDown--;
        return {actor: GAME_ACTOR.TIMER, time_left: this.countDown}
      })
    );
  }
  simulateComputerMove() {
    this.computerMove$ =  interval(700).pipe(
      withLatestFrom(this.gameState$),
      filter( ([index, gameState]) => gameState !== null || undefined),
      map( ([index, gameState]) => gameState),
      map((gameState: GameState) => {
        const randomEmptyCell = this.getEmptyCell(gameState);
        const computerAction: GameAction = {actor: GAME_ACTOR.COMPUTER, coordinates: randomEmptyCell};
        return computerAction;
      })
    );
  }

  setUserMove() {
    const click$ = fromEvent(this.canvas.nativeElement, 'click').pipe(
      map( (event: Event) => {
        const clickCoordinates: CanvasCoordinates = { 
          cell_x: Math.floor(event['offsetX'] / this.CELL_SIZE),
          cell_y: Math.floor(event['offsetY'] / this.CELL_SIZE)
        };
        const gameAction: GameAction= {actor: GAME_ACTOR.USER, coordinates: clickCoordinates };
        return gameAction;
      })
    );
    this.userMove$ =  click$.pipe(

    );
  }

  getEmptyCell(gameState: GameState): CanvasCoordinates {
    const validCells: CanvasCoordinates[] = this.getValidCells(gameState.board);
    const getRamdomCellIndex = (): number => Math.floor(Math.random() * validCells.length);
    return validCells.length ? validCells[getRamdomCellIndex()] : null;
  }
  getValidCells = (board: any[]): CanvasCoordinates[] => {
    const cells: CanvasCoordinates[] = [];
    const boardLength: number = board.length;
    const board_X_axix_Length: number = board[0].length;
    for(let x=0; x < boardLength; x++) {
      for(let y=0; y < board_X_axix_Length; y++) {
        if (board[y][x] == 0) cells.push({cell_x: x, cell_y: y});
      }
    }
    return cells;
  };

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

  drawPokemon(coordinates: CanvasCoordinates) {
    let img = new Image();
    img.src = './assets/diglet.png';
    img.onload = () => {
      this.ctx.drawImage(img, coordinates.cell_x * 100, coordinates.cell_y*100, 100, 100)
    }
  }
  capturePokemon(coordinates: CanvasCoordinates) {
    let img = new Image();
    img.src = './assets/pokeball.png';
    img.onload = () => {
      this.ctx.drawImage(img, coordinates.cell_x * 100 + 5, coordinates.cell_y*100 + 5, 90, 90)
    }
  }
  playPaletteTownAudio(){
    this.audio = new Audio();
    this.audio.src = "assets/paletteTownAudio.mp3";
    this.audio.load();
    this.audio.play();
  }
  playBattleAudio(){
    this.audio.src = "assets/battlePokemon.mp3";
    this.audio.load();
    this.audio.play();
  }
  playCapturedFailed(){
    this.caputedFailed = new Audio();
    this.caputedFailed.src = "assets/beep.mp3";
    this.caputedFailed.load();
    this.caputedFailed.play();
  }
  playVictoyAudio(){
    this.audio.pause();
    const audioTimer: Subscription = timer(500).subscribe( () => {
      this.audio.src = "assets/victoryPokemon.mp3";
      this.audio.load();
      this.audio.play();
      audioTimer.unsubscribe();
    });
   
  }

  ngOnDestroy(): void {
    this.subcriptions.forEach( (subscription: Subscription) => subscription.unsubscribe());
  }

}
