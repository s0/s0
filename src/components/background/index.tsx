import * as React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
}

interface Point {
  key: string;
  xBase: number;
  yBase: number;
  /**
   * How much the point is "wobbling" in pixels
   */
  wobble: number;
  /**
   * between 0 and 2PI
   */
  xWobble: number;
  /**
   * between 0 and 2PI
   */
  yWobble: number;

  xResult: number;
  yResult: number;
}

interface Line {
  p1: Point;
  p2: Point;
}

interface State {
  points: Point[];
  lines: Line[];
}

class Background extends React.Component<Props, State> {

  private resizeAnimationFrameRequest: number | null = 0;
  private svgRef: SVGElement | null = null;

  public constructor(props: Props) {
    super(props);
    this.state = {
      points: [],
      lines: []
    };

    this.calculatePoints = this.calculatePoints.bind(this);
    this.resized = this.calculatePoints.bind(this);
  }

  public componentDidMount() {
    this.calculatePoints();
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
    this.resizeAnimationFrameRequest = requestAnimationFrame(this.calculatePoints);
  }

  public calculatePoints() {
    if (!this.svgRef) return;
    const sizing = this.svgRef.getBoundingClientRect();
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
    const yMin = y;
    const xMax = sizing.width + xPadding;
    const yMax = sizing.height + yPadding;

    // Produce the points and lines
    const points: Point[] = [];
    const pointsMap = new Map<String, Point>();
    const lines: Line[] = [];
    let xi:number, yi = 0;
    while (y < yMax) {
      for (
          xi = 0, x = xMin + (offsetX ? xOffsetAmount : 0);
          x < xMax;
          xi++, x += xInterval) {
        const key = `${xi},${yi}`
        const wobble = xInterval / 6;
        const xWobble = Math.random() * Math.PI * 2, yWobble = Math.random() * Math.PI * 2
        const point: Point = {
          key,
          xBase: x, yBase: y,
          wobble, xWobble, yWobble,
          xResult: x + wobble * Math.sin(xWobble),
          yResult: y + wobble * Math.sin(yWobble)
        }
        points.push(point);
        pointsMap.set(key, point);
        // Add lines to (potentially) pre-existing points
        for (const k of [`${xi - 1},${yi}`, `${xi},${yi - 1}`, `${xi + (offsetX ? 1 : -1)},${yi - 1}`]) {
          const p2 = pointsMap.get(k);
          if (p2) {
            lines.push({
              p1: point, p2
            })
          }
        }
      }
      y += yInterval;
      yi++;
      offsetX = !offsetX;
    }
    this.setState({ points, lines});
  }

  public render() {
    return (
      <div className={this.props.className}>
        <svg ref={ref => this.svgRef = ref}>

          <g className="points">
            { /* Points */ }
            {
              ...this.state.points.map(p => 
                <circle key={p.key} cx={p.xResult} cy={p.yResult} />  
              )
            }
          </g>
          <g className="lines">
            { /* Lines */}
            {
              ...this.state.lines.map(l =>
                <line x1={l.p1.xResult} y1={l.p1.yResult} x2={l.p2.xResult} y2={l.p2.yResult} />
              )
            }
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