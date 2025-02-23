import React from "react";

interface ButtonProps {
  label: string;
  feat: Function;
  disabled: boolean
  loading?: boolean
}

const CustomButton: React.FC<ButtonProps> = ({ label, feat, disabled, loading = false }) => {
  return (
    <button
      className={`px-4 py-2 flex gap-3 items-center rounded-md text-white transition w-[138px] h-8 ${(disabled) ? "cursor-not-allowed bg-white/10" : "cursor-pointer bg-green-600 hover:bg-green-700"}`}
      onClick={() => feat()}
      disabled={disabled || loading}
    >
      {
        loading ? (
          <div className="mx-auto">
            <div
              className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin`}
            />
            <div className={`bg-green-600 font-mono animate-pulse`}>
            </div>
          </div>
        ) : (<>{label}</>)
      }
    </button>
  );
};

export default CustomButton;
