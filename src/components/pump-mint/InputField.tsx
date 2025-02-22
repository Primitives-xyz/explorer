import React, { Dispatch, SetStateAction } from "react";

interface InputFieldProps {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  disabled?: boolean;
  setValue: Dispatch<SetStateAction<string>>
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  required,
  type = "text",
  textarea,
  disabled,
  value,
  setValue,
}) => {
  return (
    <div>
      <label className="block text-sm">
        {label} {required && "*"}
      </label>
      {textarea ? (
        <textarea
          className="border border-green-500/20 focus:border-green-500/30 bg-green-900/20 p-2 rounded outline-none w-full placeholder:text-white/10"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ resize: "none" }}
        ></textarea>
      ) : (
        <input
          type={type}
          className="border border-green-500/20 focus:border-green-500/30 bg-green-900/20 p-2 rounded outline-none w-full font-thin placeholder:text-white/10"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={(e) => { setValue(e.target.value) }}

        />
      )}
    </div>
  );
};

export default InputField;
