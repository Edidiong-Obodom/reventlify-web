import { BeatLoader } from "react-spinners";
import { LoaderProps } from "./bounceLoader";

export default function BeatLoaderWrapper({
  height,
  width,
  color,
}: Readonly<LoaderProps>) {
  return (
    <span className="flex justify-center">
      <BeatLoader
        color={color ?? "#5850EC"}
        loading={true}
        size={Math.max(Number(height || 20), Number(width || 20))}
        cssOverride={{
          display: "block",
          margin: "0 auto",
        }}
        aria-label="grid-loading"
      />
    </span>
  );
}
