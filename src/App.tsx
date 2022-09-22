import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';

const Container = styled.div`
  margin: 100px;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  .line {
    fill: none;
    stroke: #ffab00;
    stroke-width: 3;
  }

  /* Style the dots by assigning a fill and stroke */
  .dot {
    fill: #ffab00;
    stroke: #fff;
  }

  .trans-line {
    fill: red;
    stroke: red;
    stroke-width: 3;
  }
  .tooltip {
    font-size: 15px;
    width: auto;
    padding: 10px;
    height: auto;
    background-color: #000000;
    opacity: 0.6;
    border-radius: 5px;
    color: #ffffff;
    display: none;
    position: fixed;
  }
`;

const Canvas = styled.div`
  width: 600px;
  height: 400px;
  border: 1px solid #d3d3d3;
`;

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface CanvasBaseInfo {
  margin: Margin;
  xInterval: number;
}

const getSelected = (event: React.MouseEvent, baseInfo: CanvasBaseInfo) => {
  const { margin, xInterval } = baseInfo;

  const halfXInterval = xInterval / 2;

  let curIndex = Math.floor(
    (event.nativeEvent.offsetX - margin.left) / xInterval
  );

  const dx = Math.floor((event.nativeEvent.offsetX - margin.left) % xInterval);

  if (dx > halfXInterval) {
    curIndex += 1;
  }

  return curIndex;
};

const drawLine = (vline: any, index: number, xInterval: number) => {
  vline
    .transition()
    .duration(50)
    .ease(d3.easeLinear)
    .attr('x1', index * xInterval)
    .attr('x2', index * xInterval)
    .attr('stroke-opacity', 1);
};

const drawTooltip = (tooltip: any, str: any, x: number, y: number) => {
  tooltip
    .html(str)
    .style('display', 'inline-block')
    .style('opacity', 0.6)
    .style('left', `${x}px`)
    .style('top', `${y}px`);
};

const drawCurveWithD3 = (
  dataset: [number, number][],
  canvasRect: DOMRect,
  canvasMargin: Margin
) => {
  const canvasWidth = canvasRect.width;
  const canvasHeight = canvasRect.height;
  // 2. Use the margin convention practice
  const width = canvasWidth - canvasMargin.left - canvasMargin.right; // Use the window's width
  const height = canvasHeight - canvasMargin.top - canvasMargin.bottom; // Use the window's height

  // The number of datapoints
  var n = dataset.length;

  // 5. X scale will use the index of our data
  var xScale = d3
    .scaleLinear()
    .domain([0, n - 1]) // input
    .range([0, width]); // output

  // 6. Y scale will use the randomly generate number
  var yScale = d3
    .scaleLinear()
    .domain([0, 1]) // input
    .range([height, 0]); // output

  // 7. d3's line generator
  var line = d3
    .line()
    .x(function (d, i) {
      return xScale(i);
    }) // set the x values for the line generator
    .y(function (d) {
      return yScale(d[1]);
    }) // set the y values for the line generator
    .curve(d3.curveMonotoneX); // apply smoothing to the line

  // 1. Add the SVG to the page and employ #2
  var svg = d3
    .select('#canvas')
    .append('svg')
    .attr('width', width + canvasMargin.left + canvasMargin.right)
    .attr('height', height + canvasMargin.top + canvasMargin.bottom)
    .append('g')
    .attr(
      'transform',
      'translate(' + canvasMargin.left + ',' + canvasMargin.top + ')'
    );

  // 3. Call the x axis in a group tag
  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // 4. Call the y axis in a group tag
  svg.append('g').attr('class', 'y axis').call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // 9. Append the path, bind the data, and call the line generator
  svg
    .append('path')
    .datum(dataset) // 10. Binds data to the line
    .attr('class', 'line') // Assign a class for styling
    .attr('d', line); // 11. Calls the line generator

  // 12. Appends a circle for each datapoint
  svg
    .selectAll('.dot')
    .data(dataset)
    .enter()
    .append('circle') // Uses the enter().append() method
    .attr('class', 'dot') // Assign a class for styling
    .attr('cx', function (d, i) {
      return xScale(i);
    })
    .attr('cy', function (d) {
      return yScale(d[1]);
    })
    .attr('r', 5);

  const vline: d3.Selection<SVGLineElement, unknown, HTMLElement, any> = svg
    .append('line')
    .attr('class', 'trans-line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', yScale(0))
    .attr('stroke-opacity', 0);

  var tooltip = d3
    .select('#container')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  return { height: yScale(0), xInterval: xScale(1), vline, tooltip };
};

const canvasMargin = { top: 50, right: 50, bottom: 50, left: 50 };
// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
const dataset = d3.range(9).map(function (d) {
  return [d3.randomUniform(1)(), d3.randomUniform(1)()] as [number, number];
});

function App() {
  const ref = useRef(null);
  const canvasRectRef = useRef<DOMRect>();
  const plotAreaRef = useRef<{ height: number; xInterval: number }>();
  const vLineRef =
    useRef<d3.Selection<SVGLineElement, unknown, HTMLElement, any>>();
  const tooltipRef =
    useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any>>();

  useEffect(() => {
    const canvas = ref.current! as HTMLCanvasElement;
    const box = canvas.getBoundingClientRect();
    canvasRectRef.current = box;
    const { vline, tooltip, ...res } = drawCurveWithD3(
      dataset,
      canvasRectRef.current,
      canvasMargin
    );
    vLineRef.current = vline;
    tooltipRef.current = tooltip;
    plotAreaRef.current = res;
  }, []);

  const onClick = useCallback((e: React.MouseEvent) => {
    const selectedIndex = getSelected(e, {
      xInterval: plotAreaRef.current!.xInterval,
      margin: canvasMargin,
    });
    drawLine(vLineRef.current, selectedIndex, plotAreaRef.current!.xInterval);
    drawTooltip(
      tooltipRef.current,
      dataset[selectedIndex][0],
      e.pageX,
      e.pageY
    );
  }, []);

  return (
    <Container id="container">
      <Canvas
        id="canvas"
        ref={ref}
        onClick={onClick}
        //  onMouseMove={onClick}
      />
    </Container>
  );
}

export default App;
