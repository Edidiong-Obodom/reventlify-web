import { PuffLoader } from "react-spinners";
import { LoaderProps } from "./bounceLoader";

export default function PuffLoaderWrapper({
  height,
  width,
  color,
}: Readonly<LoaderProps>) {
  return (
    <span className="flex justify-center">
      <PuffLoader
        color={color ?? "#5850EC"}
        loading={true}
        size={Math.max(Number(height || 80), Number(width || 80))}
        cssOverride={{
          display: "block",
          margin: "0 auto",
        }}
        aria-label="grid-loading"
      />
    </span>
  );
}
