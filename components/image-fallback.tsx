"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageFallbackProps {
  src: string
  fallbackSrc: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
}

const ImageFallback = ({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  fill = false,
  className,
  ...props
}: ImageFallbackProps) => {
  const [error, setError] = useState(false)

  return (
    <Image
      src={error ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}

export default ImageFallback

