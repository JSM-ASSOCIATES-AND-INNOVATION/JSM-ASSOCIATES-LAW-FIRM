import React from "react";
import CountUp from "react-countup";
import '../styles/WordCount.css'

const WordCount = ({ count }) => {
  return (
    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "black" }} >
      <CountUp
        start={0}
        end={count}
        duration={2} // seconds
        separator=","
      />+
    </div>
  );
};

export default WordCount;
