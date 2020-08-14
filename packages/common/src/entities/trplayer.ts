import { Schema, type } from "@colyseus/schema";

const validateName = (name: string) => name.trim().slice(0, 16);

class RGB extends Schema {
  @type("number")
  r: number;

  @type("number")
  g: number;

  @type("number")
  b: number;
}

export class TRPlayer extends Schema {
  @type("string")
  public id: string;

  @type("string")
  public name: string;

  @type("number")
  public x: number;

  @type("number")
  public y: number;

  @type("number")
  public startX: number;

  @type("number")
  public startY: number;

  @type("string")
  public sentence: string;

  @type("number")
  public currentIndex: number;

  @type("number")
  public startTime: number;

  @type("number")
  public currentSpeed: number;

  @type(RGB)
  public rgb: RGB = new RGB();

  @type("boolean")
  public winner: boolean;

  @type("boolean")
  public finished: boolean;

  // Init
  constructor(id: string, name: string, sentence: string) {
    super();
    this.id = id;
    this.name = validateName(name);
    this.x = 400;
    this.y = 200;
    this.startX = 200;
    this.startY = 200;
    this.sentence = sentence;
    this.currentIndex = 0;
    this.startTime = Date.now();
    this.currentSpeed = 0;
    this.rgb = new RGB(
      Math.random() * 255,
      Math.random() * 255,
      Math.random() * 255
    );
    this.winner = false;
    this.finished = false;
  }

  reset(sentence: string) {
    this.sentence = sentence;
    this.x = 400;
    this.y = this.startY;
    this.currentIndex = 0;
    this.currentSpeed = 0;
    this.startTime = Date.now();
    this.winner = false;
    this.finished = false;
  }

  correctKeyPressed(key: string) {
    if (key === this.sentence[this.currentIndex]) {
      this.currentIndex++;
      this.onCorrectKeyPress();
      return true;
    } else {
      return false;
    }
  }
  hasFinished() {
    return this.currentIndex > this.sentence.length - 1;
  }

  onCorrectKeyPress() {
    this.currentSpeed = this.calcCharPerSec();
  }

  calcCharPerSec() {
    const timeElapsed = Date.now() - this.startTime;
    const cps = this.currentIndex / (timeElapsed / 1000);
    // Round to tenth
    return Math.round(cps * 10) / 10;
  }
}
