import React from "react";

import "./_text_area_input.scss";

interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  value,
  onChange,
  id,
}) => {
  return (
    <div className="text-area-input">
      <textarea
        name={id}
        id={id}
        className="text-area-input__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={20}
      />
    </div>
  );
};

export default TextAreaInput;
