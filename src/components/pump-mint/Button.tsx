import React from "react";
// import { ClapSpinner } from "react-spinners-kit";

interface ButtonProps {
  label: string;
  feat: Function;
  disabled: boolean
  loading?: boolean
}

const CustomButton: React.FC<ButtonProps> = ({ label, feat, disabled, loading = false }) => {
  return (
    <button className={`px-4 py-2 flex gap-3 items-center rounded-md text-white transition ${(loading || disabled) ? "cursor-not-allowed bg-white/10" : "cursor-pointer bg-green-600 hover:bg-green-700"}`} onClick={() => feat()} disabled={disabled || loading}>
      {/* <ClapSpinner size={20} frontColor="#b91c1c" loading={loading} /> */}
      {label}
    </button>

  );
};

export default CustomButton;
