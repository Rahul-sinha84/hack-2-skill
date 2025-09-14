import React from "react";

import "./_single_line_input.scss";

interface SingleLineInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

const SingleLineInput = ({ id, value, onChange }: SingleLineInputProps) => {
  return (
    <div className="single-line-input">
      <input
        type="text"
        className="single-line-input__input"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SingleLineInput;
