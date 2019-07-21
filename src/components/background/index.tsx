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
  parallax: number;
  svg: SVGCircleElement;
}

interface Line {
  p1: Point;
  p2: Point;
  svg: {
    mask: SVGLineElement;
    mouse: SVGLineElement;
  }
}

interface Ripple {
  x: number;
  y: number;
  display?: {
    svg: SVGCircleElement;
    opacity: number;
  }
}

interface LineFlash {
  line: Line;
  display?: {
    svg: {
      g: SVGGElement;
      line: SVGLineElement;
      circleA: SVGCircleElement;
      circleB: SVGCircleElement;
    };
    opacity: number;
  }
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
    mouseLines: SVGGElement | null;
    bg: SVGRectElement | null;
    ripples: SVGGElement | null;
    overlays: SVGGElement | null;
  } = {
    svg: null,
    points: null,
    lines: null,
    mouseLines: null,
    bg: null,
    ripples: null,
    overlays: null,
  }
  private data: {
    points: Map<string, Point>;
    lines: Line[];
  } | null = null;

  // Mouse Data
  private mouse: { x: number; y: number } | null = null;
  private lastMouse: { x: number; y: number } | null = null;
  private lastFrame: number | null = null;
  private ripples = new Set<Ripple>();
  private lineFlashes = new Set<LineFlash>();

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
  private resized() {
    if (this.resizeAnimationFrameRequest)
      cancelAnimationFrame(this.resizeAnimationFrameRequest);
    this.resizeAnimationFrameRequest = requestAnimationFrame(this.createElements);
  }

  private mouseMove(e: MouseEvent) {
    this.mouse = {
      x: e.pageX,
      y: e.pageY
    }
  }

  private mouseOverLine(e: MouseEvent, line: Line) {
    this.ripples.add({
      x: e.pageX,
      y: e.pageY
    })
    this.lineFlashes.add({
      line
    });
  }

  private createElements() {
    if (!this.ref.svg || !this.ref.points || !this.ref.lines || !this.ref.mouseLines || !this.ref.bg) return;

    // clear old elements
    if (this.data) {
      this.data.points.forEach(point => point.svg.remove());
      this.data.lines.forEach(line => {
        line.svg.mask.remove();
        line.svg.mouse.remove();
      });
    }

    const sizing = this.ref.svg.getBoundingClientRect();
    this.ref.bg.width.baseVal.value = sizing.width;
    this.ref.bg.height.baseVal.value = sizing.height;

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

    const skew = xInterval / 10;

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
        const parallax = Math.random();
        const point: Point = {
          base,
          parallax,
          svg: document.createElementNS(SVG_XMLNS, 'circle'),
          current: Object.assign({}, base)
        }
        point.svg.cx.baseVal.value = point.current.x;
        point.svg.cy.baseVal.value = point.current.y;
        point.svg.r.baseVal.value = parallax * 6 + 4;
        this.ref.points.appendChild(point.svg);
        points.set(key, point);
        // Add lines to (potentially) pre-existing points
        for (const k of [`${xi - 1},${yi}`, `${xi},${yi - 1}`, `${xi + (offsetX ? 1 : -1)},${yi - 1}`]) {
          const p2 = points.get(k);
          if (p2) {
            const mask = document.createElementNS(SVG_XMLNS, 'line');
            const mouse = document.createElementNS(SVG_XMLNS, 'line');
            const line = {
              p1: point,
              p2,
              svg: { mask, mouse }
            }
            lines.push(line);
            mask.x1.baseVal.value = mouse.x1.baseVal.value = point.current.x;
            mask.y1.baseVal.value = mouse.y1.baseVal.value = point.current.y;
            mask.x2.baseVal.value = mouse.x2.baseVal.value = p2.current.x;
            mask.y2.baseVal.value = mouse.y2.baseVal.value = p2.current.y;
            this.ref.lines.appendChild(mask);
            this.ref.mouseLines.appendChild(mouse);
            mouse.addEventListener('mouseenter', e => this.mouseOverLine(e, line));
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

  private frame() {
    if (!this.data || !this.ref.svg) return;
    const now = performance.now();
    const frameMs = this.lastFrame ? now - this.lastFrame : 20;
    // Adjust position of points (and hence lines)
    if (this.mouse) {
      if (!this.lastMouse || this.mouse.x !== this.lastMouse.x || this.mouse.y !== this.lastMouse.y) {
        this.lastMouse = this.mouse;
        const rect = this.ref.svg.getBoundingClientRect();
        const mouseRatioX = this.mouse.x / rect.width - 0.5;
        const mouseRatioY = this.mouse.y / rect.height - 0.5;
        for (const point of this.data.points.values()) {
          const dx = point.base.x - this.mouse.x;
          const dy = point.base.y - this.mouse.y;
          const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          // Add parralax
          const target = Object.assign({}, point.base);
          target.x -= mouseRatioX * 50 * (point.parallax + 0.5);
          target.y -= mouseRatioY * 50 * (point.parallax + 0.5);
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
      if (!closeEnough(line.svg.mask.x1.baseVal.value, line.p1.current.x)) line.svg.mask.x1.baseVal.value = line.svg.mouse.x1.baseVal.value = line.p1.current.x;
      if (!closeEnough(line.svg.mask.y1.baseVal.value, line.p1.current.y)) line.svg.mask.y1.baseVal.value = line.svg.mouse.y1.baseVal.value = line.p1.current.y;
      if (!closeEnough(line.svg.mask.x2.baseVal.value, line.p2.current.x)) line.svg.mask.x2.baseVal.value = line.svg.mouse.x2.baseVal.value = line.p2.current.x;
      if (!closeEnough(line.svg.mask.y2.baseVal.value, line.p2.current.y)) line.svg.mask.y2.baseVal.value = line.svg.mouse.y2.baseVal.value = line.p2.current.y;
    }
    // Add and animate ripples
    this.ripples.forEach(ripple => {
      if (!this.ref.ripples) return;
      if (!ripple.display) {
        ripple.display = {
          svg: document.createElementNS(SVG_XMLNS, 'circle'),
          opacity: 1
        }
        ripple.display.svg.cx.baseVal.value = ripple.x;
        ripple.display.svg.cy.baseVal.value = ripple.y;
        ripple.display.svg.r.baseVal.value = 1;
        this.ref.ripples.appendChild(ripple.display.svg);
      } else {
        ripple.display.opacity -= frameMs / 1000;
        if (ripple.display.opacity < 0) {
          ripple.display.svg.remove();
          this.ripples.delete(ripple);
        } else {
          ripple.display.svg.setAttribute('opacity', ripple.display.opacity.toString());
          ripple.display.svg.r.baseVal.value += frameMs;
        }
      }
    })
    // Add and animate line flashes
    this.lineFlashes.forEach(flash => {
      if (!this.ref.overlays) return;
      if (!flash.display) {
        flash.display = {
          svg: {
            g: document.createElementNS(SVG_XMLNS, 'g'),
            line: document.createElementNS(SVG_XMLNS, 'line'),
            circleA: document.createElementNS(SVG_XMLNS, 'circle'),
            circleB: document.createElementNS(SVG_XMLNS, 'circle'),
          },
          opacity: 1
        }
        flash.display.svg.circleA.r.baseVal.value = flash.line.p1.parallax * 6 + 4;
        flash.display.svg.circleB.r.baseVal.value = flash.line.p2.parallax * 6 + 4;
        flash.display.svg.g.appendChild(flash.display.svg.line);
        flash.display.svg.g.appendChild(flash.display.svg.circleA);
        flash.display.svg.g.appendChild(flash.display.svg.circleB);
        this.ref.overlays.appendChild(flash.display.svg.g);
      } 
      flash.display.opacity -= frameMs / 2000;
      if (flash.display.opacity < 0) {
        flash.display.svg.g.remove();
        this.lineFlashes.delete(flash);
      } else {
        flash.display.svg.g.setAttribute('opacity', flash.display.opacity.toString());
        if (!closeEnough(flash.display.svg.line.x1.baseVal.value, flash.line.p1.current.x))
          flash.display.svg.circleA.cx.baseVal.value = flash.display.svg.line.x1.baseVal.value = flash.line.p1.current.x;
        if (!closeEnough(flash.display.svg.line.y1.baseVal.value, flash.line.p1.current.y))
          flash.display.svg.circleA.cy.baseVal.value = flash.display.svg.line.y1.baseVal.value = flash.line.p1.current.y;
        if (!closeEnough(flash.display.svg.line.x2.baseVal.value, flash.line.p2.current.x))
          flash.display.svg.circleB.cx.baseVal.value = flash.display.svg.line.x2.baseVal.value = flash.line.p2.current.x;
        if (!closeEnough(flash.display.svg.line.y2.baseVal.value, flash.line.p2.current.y))
          flash.display.svg.circleB.cy.baseVal.value = flash.display.svg.line.y2.baseVal.value = flash.line.p2.current.y;
      }
    })
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
            <rect className="bg" ref={ref => this.ref.bg = ref} />
            <rect className="shine" />
            <g className="ripples" ref={ref => this.ref.ripples = ref} />
          </g>
          <g className="overlays" ref={ref => this.ref.overlays = ref} />
          <g className="mouseDetection">
            <g className="lines" ref={ref => this.ref.mouseLines = ref} />
          </g>
        </svg>
      </div>
    );
  }
}

export default styled(Background)`
  background: #240152;
  background: linear-gradient(#460152, #240152);

  @keyframes shine-move {
    0% {
      x: -40%;
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
      }

      .lines line {
        stroke-width: 2px;
        stroke: rgba(255, 255, 255, 0.5);
      }
    }

    .gridLayers {
      > .bg {
        x: 0;
        y: 0;
        fill: rgba(177, 0, 174, 0.49);
      }

      > .shine {
        x: -40%;
        y: 0;
        width: 40%;
        height: 100%;
        fill: url(#shine);
        animation: shine-move 5s linear infinite;
      }

      > .ripples circle {
        fill: rgba(255, 255, 255, 0.2);
        stroke-width: 50px;
        stroke: rgba(255, 255, 255, 0.7);
      }
    }

    .overlays {
      g {
        circle {
          fill: #fff;
        }

        line {
          stroke-width: 2px;
          stroke: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .mouseDetection {
      .lines line {
        stroke-width: 10px;
        stroke: rgba(255, 255, 255, 0);
      }
    }
  }
`;