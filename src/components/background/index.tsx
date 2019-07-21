import * as React from 'react';
import styled from 'styled-components';
import anime from 'animejs';

/**
 * Return true if 2 numbers are "close enough"
 */
function closeEnough(a: number, b: number) {
  return Math.abs(a - b) < 0.1;
}

const SVG_XMLNS = "http://www.w3.org/2000/svg";

const AFFECT_DISTANCE = 200;
const PUSH_DISTANCE = 50;

interface Props {
  className?: string;
}

interface Point {
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
  svg: SVGCircleElement;
  animation?: anime.AnimeInstance;
}

interface Line {
  p1: Point;
  p2: Point;
  svg: SVGLineElement;
  animation?: anime.AnimeInstance;
}

class Background extends React.Component<Props, {}> {

  private resizeAnimationFrameRequest: number | null = 0;
  private frameAnimationFrameRequest: number | null = 0;
  private readonly ref: {
    svg: SVGElement | null;
    points: SVGGElement | null;
    lines: SVGGElement | null;
  } = {
    svg: null,
    points: null,
    lines: null,
  }
  private data: {
    points: Map<string, Point>;
    lines: Line[];
  } | null = null;

  // Mouse Data
  private mouse: { x: number; y: number } | null = null;
  private lastMouse: { x: number; y: number } | null = null;

  public constructor(props: Props) {
    super(props);

    this.createElements = this.createElements.bind(this);
    this.resized = this.resized.bind(this);
    this.frame = this.frame.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
  }

  public componentDidMount() {
    this.createElements();
    this.frame();
    window.addEventListener('resize', this.resized);
    window.addEventListener('mousemove', this.mouseMove);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.resized);
    window.removeEventListener('mousemove', this.mouseMove);
    if (this.frameAnimationFrameRequest)
      cancelAnimationFrame(this.frameAnimationFrameRequest);
  }

  /**
   * Debounce 
   */
  public resized() {
    if (this.resizeAnimationFrameRequest)
      cancelAnimationFrame(this.resizeAnimationFrameRequest);
    this.resizeAnimationFrameRequest = requestAnimationFrame(this.createElements);
  }

  public mouseMove(e: MouseEvent) {
    this.mouse = {
      x: e.pageX,
      y: e.pageY
    }
  }

  public createElements() {
    if (!this.ref.svg || !this.ref.points || !this.ref.lines) return;
    // clear old elements
    if (this.data) {
      this.data.points.forEach(point => point.svg.remove());
      this.data.lines.forEach(line => line.svg.remove());
    }

    const sizing = this.ref.svg.getBoundingClientRect();
    /**
     * How spread out each dot is along the X
     */
    const xInterval = 100;
    /**
     * How spread out each row of dots is, to arrange the dots as equalateral triangles
     */
    const yInterval = Math.sqrt(3) / 2 * xInterval;

    // How far off the screen we need to draw
    const xPadding = xInterval;
    const yPadding = yInterval;

    const skew = xInterval / 15;

    /**
     * How much the x values of an offset row should be adjusted by
     */
    const xOffsetAmount = xInterval / 2;

    // calculate the starting points
    let x = sizing.width / 2;
    while (x > 0 - xPadding) x -= xInterval;
    let y = sizing.height / 2;
    /** whether or not we're offsetting the X of the current row */
    let offsetX = false;
    while (y > 0 - yPadding) {
      y -= yInterval;
      offsetX = !offsetX;
    }

    const xMin = x;
    const xMax = sizing.width + xPadding;
    const yMax = sizing.height + yPadding;

    // Produce the points and lines
    const points = new Map<string, Point>();
    const lines: Line[] = [];
    let xi:number, yi = 0;
    while (y < yMax) {
      for (
          xi = 0, x = xMin + (offsetX ? xOffsetAmount : 0);
          x < xMax;
          xi++, x += xInterval) {
        const key = `${xi},${yi}`;
        const baseX = x + (Math.random() - 0.5) * skew;
        const baseY = y + (Math.random() - 0.5) * skew;
        const point: Point = {
          baseX,
          baseY,
          svg: document.createElementNS(SVG_XMLNS, 'circle'),
          currentX: baseX,
          currentY: baseY
        }
        point.svg.cx.baseVal.value = point.baseX;
        point.svg.cy.baseVal.value = point.baseY;
        this.ref.points.appendChild(point.svg);
        points.set(key, point);
        // Add lines to (potentially) pre-existing points
        for (const k of [`${xi - 1},${yi}`, `${xi},${yi - 1}`, `${xi + (offsetX ? 1 : -1)},${yi - 1}`]) {
          const p2 = points.get(k);
          if (p2) {
            const line = document.createElementNS(SVG_XMLNS, 'line');
            lines.push({
              p1: point,
              p2,
              svg: line
            });
            line.x1.baseVal.value = point.baseX;
            line.y1.baseVal.value = point.baseY;
            line.x2.baseVal.value = p2.baseX;
            line.y2.baseVal.value = p2.baseY;
            this.ref.lines.appendChild(line);
          }
        }
      }
      y += yInterval;
      yi++;
      offsetX = !offsetX;
    }

    this.data = {
      lines,
      points
    }
  }

  public frame() {
    if (!this.data) return;
    // Adjust position of points (and hence lines)
    if (this.mouse) {
      if (!this.lastMouse || this.mouse.x !== this.lastMouse.x || this.mouse.y !== this.lastMouse.y) {
        this.lastMouse = this.mouse;
        for (const point of this.data.points.values()) {
          const dx = point.baseX - this.mouse.x;
          const dy = point.baseY - this.mouse.y;
          const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          point.currentX = point.baseX;
          point.currentY = point.baseY;
          if (distance < AFFECT_DISTANCE) {
            const push = (AFFECT_DISTANCE - distance) / AFFECT_DISTANCE * PUSH_DISTANCE;
            point.currentX += dx / distance * push;
            point.currentY += dy / distance * push;
          }
          if (!closeEnough(point.svg.cx.baseVal.value, point.currentX) || !closeEnough(point.svg.cy.baseVal.value, point.currentY)) {
            // if (point.animation) point.animation.pause();
            anime.remove(point.svg)
            point.animation = anime({
              targets: point.svg,
              cx: point.currentX,
              cy: point.currentY,
              easing: 'cubicBezier(0.0, 0.0, 0.2, 1)',
              duration: 300
            });
            point.animation.pause();
            point.animation.seek(20);
            point.animation.play();
          }
        }
        for (const line of this.data.lines) {
          if (!closeEnough(line.svg.x1.baseVal.value, line.p1.currentX) ||
              !closeEnough(line.svg.y1.baseVal.value, line.p1.currentY) ||
              !closeEnough(line.svg.x2.baseVal.value, line.p2.currentX) ||
              !closeEnough(line.svg.y2.baseVal.value, line.p2.currentY)) {
            // if (line.animation) line.animation.pause();
            anime.remove(line.svg)
            line.animation = anime({
              targets: line.svg,
              x1: line.p1.currentX,
              y1: line.p1.currentY,
              x2: line.p2.currentX,
              y2: line.p2.currentY,
              easing: 'cubicBezier(0.0, 0.0, 0.2, 1)',
              duration: 300
            })
            line.animation.pause();
            line.animation.seek(20);
            line.animation.play();
          }
        }
      }
    }
    this.frameAnimationFrameRequest = requestAnimationFrame(this.frame);
  }

  public render() {
    return (
      <div className={this.props.className}>
        <svg ref={ref => this.ref.svg = ref}>

          <g className="points" ref={ref => this.ref.points = ref} />
          <g className="lines" ref={ref => this.ref.lines = ref} />
        </svg>
      </div>
    );
  }
}

export default styled(Background)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;


  svg {
    width: 100%;
    height: 100%;

    .points circle {
      fill: #222;
      r: 5px;
    }

    .lines line {
      stroke-width: 2px;
      stroke: #333;
    }
  }
`;