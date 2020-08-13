export default function (s) {
  s.drawMasterBranch = () => {
    s.push();
    s.drawLine();
    s.drawFirstCircle();
    s.drawEndCircle();
    s.pop();
  };

  s.drawLine = () => {
    s.fill(100, 255, 100);
    s.strokeWeight(5);
    s.stroke(100, 255, 100);
    s.line(0, 50, window.innerWidth - 100, 50);
  };

  s.drawFirstCircle = () => {
    s.circle(100, 50, window.innerWidth / 96);
  };

  s.drawEndCircle = () => {
    s.circle(window.innerWidth - 100, 50, window.innerWidth / 96);
  };

  return s;
}
