import { BounceLoader } from "react-spinners";

export type LoaderProps = {
  height?: any;
  width?: any;
  color?: string;
};

export default function BounceLoaderWrapper({
  height,
  width,
  color,
}: Readonly<LoaderProps>) {
  return (
    <span className="flex justify-center">
      <BounceLoader
        color={color ?? "#5850EC"}
        loading={true}
        size={Math.max(Number(height || 80), Number(width || 80))}
        cssOverride={{
          display: "block",
          margin: "0 auto",
        }}
        aria-label="bounce-loading"
      />
    </span>
  );
}
