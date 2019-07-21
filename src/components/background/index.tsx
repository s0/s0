import * as React from 'react';
import styled from 'styled-components';
import bezierEasing from 'bezier-easing';

const EASE_OUT = bezierEasing(0.0, 0.0, 0.2, 1);

/**
 * Return true if 2 numbers are "close enough"
 */
function closeEnough(a: number, b: number) {
  return Math.abs(a - b) < 0.1;
}

const SVG_XMLNS = "http://www.w3.org/2000/svg";

const AFFECT_DISTANCE = 200;
const PUSH_DISTANCE = 50;
const PUSH_ANIM_DURATION = 300;

interface Props {
  className?: string;
}

interface Animated<P extends { [id: string]: number }> {
  current: P;
  animation?: {
    /**
     * How long the animation should go for
     */
    duration: number;
    /**
     * How far into the animation we are
     */
    time: number;
    /**
     * The state at the start of the animation
     */
    start: P;
    /**
     * Our target state
     */
    end: P;
  }
}

interface Point extends Animated<{x: number; y: number}> {
  base: {
    x: number;
    y: number;
  };
  svg: SVGCircleElement;
}

interface Line {
  p1: Point;
  p2: Point;
  svg: SVGLineElement;
}

function advanceAnimation<P extends { [id: string]: number }>(target: Animated<P>, advanceMs: number) {
  if (target.animation) {
    target.animation.time += advanceMs;
    if (target.animation.duration < target.animation.time) {
      target.current = target.animation.end;
      target.animation = undefined;
    } else {
      // calculate new frame
      const ratio = EASE_OUT(target.animation.time / target.animation.duration);
      let key: keyof P;
      for (key of Object.keys(target.animation.end)) {
        (target.current[key] as number) = (target.animation.end[key] - target.animation.start[key]) * ratio + target.animation.start[key];
      }
    }
  }
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
  private lastFrame: number | null = null;

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
        const base = {
          x: x + (Math.random() - 0.5) * skew,
          y: y + (Math.random() - 0.5) * skew
        };
        const point: Point = {
          base,
          svg: document.createElementNS(SVG_XMLNS, 'circle'),
          current: Object.assign({}, base)
        }
        point.svg.cx.baseVal.value = point.current.x;
        point.svg.cy.baseVal.value = point.current.y;
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
            line.x1.baseVal.value = point.current.x;
            line.y1.baseVal.value = point.current.y;
            line.x2.baseVal.value = p2.current.x;
            line.y2.baseVal.value = p2.current.y;
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
    const now = performance.now();
    const frameMs = this.lastFrame ? now - this.lastFrame : 20;
    // Adjust position of points (and hence lines)
    if (this.mouse) {
      if (!this.lastMouse || this.mouse.x !== this.lastMouse.x || this.mouse.y !== this.lastMouse.y) {
        this.lastMouse = this.mouse;
        for (const point of this.data.points.values()) {
          const dx = point.base.x - this.mouse.x;
          const dy = point.base.y - this.mouse.y;
          const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          const target = Object.assign({}, point.base);
          if (distance < AFFECT_DISTANCE) {
            const push = (AFFECT_DISTANCE - distance) / AFFECT_DISTANCE * PUSH_DISTANCE;
            target.x += dx / distance * push;
            target.y += dy / distance * push;
          }
          const currentTarget = point.animation ? point.animation.end : point.current;
          if (currentTarget.x != target.x || currentTarget.y != target.y) {
            point.animation = {
              duration: PUSH_ANIM_DURATION,
              time: 0,
              start: Object.assign({}, point.current),
              end: target
            }
          }
        }
      }
    }
    // Advance animations and update positions
    for (const point of this.data.points.values()) {
      advanceAnimation(point, frameMs);
      // Update position
      if (!closeEnough(point.svg.cx.baseVal.value, point.current.x)) point.svg.cx.baseVal.value = point.current.x;
      if (!closeEnough(point.svg.cy.baseVal.value, point.current.y)) point.svg.cy.baseVal.value = point.current.y;
    }
    for (const line of this.data.lines) {
      if (!closeEnough(line.svg.x1.baseVal.value, line.p1.current.x)) line.svg.x1.baseVal.value = line.p1.current.x;
      if (!closeEnough(line.svg.y1.baseVal.value, line.p1.current.y)) line.svg.y1.baseVal.value = line.p1.current.y;
      if (!closeEnough(line.svg.x2.baseVal.value, line.p2.current.x)) line.svg.x2.baseVal.value = line.p2.current.x;
      if (!closeEnough(line.svg.y2.baseVal.value, line.p2.current.y)) line.svg.y2.baseVal.value = line.p2.current.y;
    }
    this.frameAnimationFrameRequest = requestAnimationFrame(this.frame);
    this.lastFrame = now;
  }

  public render() {
    return (
      <div className={this.props.className}>
        <svg ref={ref => this.ref.svg = ref}>
          <defs>
            <linearGradient id="shine">
              <stop className="start" offset="0%" />
              <stop className="mid" offset="50%" />
              <stop className="end" offset="100%" />
            </linearGradient>
          </defs>
          <mask className="gridMask" id="grid">
            <g className="points" ref={ref => this.ref.points = ref} />
            <g className="lines" ref={ref => this.ref.lines = ref} />
          </mask>
          <g className="gridLayers" mask='url(#grid)'>
            <rect className="bg" />
            <rect className="shine" />
          </g>
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
  background: #240152;

  @keyframes shine-move {
    0% {
      x: -20%;
    }
    100% {
      x: 160%;
    }
  }

  svg {
    width: 100%;
    height: 100%;

    defs {
      #shine {
        .start, .end {
          stop-color: rgba(251, 57, 248, 0);
        }
        .mid {
          stop-color: rgba(251, 57, 248, 0.8);
        }
      }
    }

    .gridMask {
      .points circle {
        fill: #fff;
        r: 5px;
      }

      .lines line {
        stroke-width: 2px;
        stroke: rgba(255, 255, 255, 0.8);
      }
    }

    .gridLayers {
      > .bg {
        width: 100%;
        height: 100%;
        x: 0;
        y: 0;
        fill: rgba(177, 0, 174, 0.49);
      }

      > .shine {
        x: -20%;
        y: 0;
        width: 20%;
        height: 100%;
        fill: url(#shine);
        animation: shine-move 5s linear infinite;
      }
    }
  }
`;