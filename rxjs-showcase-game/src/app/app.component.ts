import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;  
  
  private ctx: CanvasRenderingContext2D;

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.drawCanvas();
  }
  
  animate() {

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

    this.drawImage(100, 0);
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

  drawImage(x: number, y: number) {
    let img = new Image();
    img.src = './assets/covid.jpg';
    img.onload = () => {
      this.ctx.drawImage(img, x, y, 100, 100)
    }
  }
  disinfect(event: Event) {
    console.log(`Coordinates x ${event['x']} and y ${event['y']}`);
  }
}
