import * as React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

interface State {
  points: Point[];
}

class Background extends React.Component<Props, State> {

  private resizeAnimationFrameRequest: number | null = 0;
  private svgRef: SVGElement | null = null;

  public constructor(props: Props) {
    super(props);
    this.state = {
      points: []
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
    console.log('calculate resize', sizing.height, sizing.width);
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

    // Produce the points
    const points: Point[] = [];
    while (y < yMax) {
      for (
          x = xMin + (offsetX ? xOffsetAmount : 0);
          x < xMax;
          x += xInterval) {
        points.push({
          x, y
        });
      }
      y += yInterval;
      offsetX = !offsetX;
    }
    this.setState({points});
  }

  public render() {
    return (
      <div className={this.props.className}>
        <svg ref={ref => this.svgRef = ref}>

          { /* Points */ }
          {
            ...this.state.points.map(p => 
              <circle cx={p.x} cy={p.y} r="3" fill='#000' />  
            )
          }
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
  }
`;