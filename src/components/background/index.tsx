import * as React from 'react';
import styled from 'styled-components';

const SVG_XMLNS = "http://www.w3.org/2000/svg";

interface Props {
  className?: string;
}

interface Point {
  x: number;
  y: number;
  svg: SVGCircleElement;
}

interface Line {
  p1: Point;
  p2: Point;
  svg: SVGLineElement;
}

class Background extends React.Component<Props, {}> {

  private resizeAnimationFrameRequest: number | null = 0;
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

  public constructor(props: Props) {
    super(props);

    this.createElements = this.createElements.bind(this);
    this.resized = this.resized.bind(this);
  }

  public componentDidMount() {
    this.createElements();
    window.addEventListener('resize', this.resized);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.resized);
  }

  /**
   * Debounce 
   */
  public resized() {
    if (this.resizeAnimationFrameRequest)
      cancelAnimationFrame(this.resizeAnimationFrameRequest);
    this.resizeAnimationFrameRequest = requestAnimationFrame(this.createElements);
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
        const key = `${xi},${yi}`
        const point: Point = {
          x: x + (Math.random() - 0.5) * skew,
          y: y + (Math.random() - 0.5) * skew,
          svg: document.createElementNS(SVG_XMLNS, 'circle')
        }
        point.svg.setAttribute('cx', point.x.toString());
        point.svg.setAttribute('cy', point.y.toString());
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
            line.setAttribute('x1', point.x.toString());
            line.setAttribute('y1', point.y.toString());
            line.setAttribute('x2', p2.x.toString());
            line.setAttribute('y2', p2.y.toString());
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