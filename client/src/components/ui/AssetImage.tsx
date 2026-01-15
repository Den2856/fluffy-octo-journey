import React from "react";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
};

export function AssetImage({ src, ...rest }: Props) {
  const resolved = resolveAssetUrl(src);
  return <img {...rest} src={resolved} />;
}
