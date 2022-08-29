import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin: 100px;
  display: flex;
  justify-content: center;
`;

function App() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = (ref.current! as any).getContext('2d');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(300, 150);
    ctx.stroke();
  }, []);
  return (
    <Container>
      <canvas
        ref={ref}
        width="600"
        height="400"
        style={{ border: '1px solid #d3d3d3' }}
      ></canvas>
    </Container>
  );
}

export default App;
