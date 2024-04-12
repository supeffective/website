import { HTMLAttributes } from 'react'

import baseConfig from '@/config'
import { classNames } from '@/lib/utils/deprecated'

const variantFolder = {
  '2d': 'home2d-icon',
  '3d': 'home3d-icon-bordered',
  pixelart: 'gen8-icon',
}

type PkImgFileProps = {
  nid: string
  title?: string
  shiny?: boolean
  variant: '2d' | '3d' | 'pixelart'
} & HTMLAttributes<HTMLSpanElement>

export default function PkImgFile({ nid, shiny, variant, title, className, ...rest }: PkImgFileProps) {
  const folder = variantFolder[variant] + (shiny ? '/shiny' : '/regular')

  let imgW = 64
  let imgH = 64

  if (variant === 'pixelart') {
    imgW = 68
    imgH = 56
  }

  const classes = classNames(
    'pkm-wrapper pkimg-wrapper',
    `pkimg-variant-${variant}`,
    `pkimg-${shiny ? 'shiny' : 'regular'}`,
    className,
  )

  const assetVersion = baseConfig.assets.getPokeImgVersion(nid)
  let imageSrc = `${baseConfig.assets.imagesUrl}/pokemon/${folder}/${nid}.png?v=${assetVersion}`

  if (nid === 'placeholder') {
    imageSrc = '/images/placeholders/placeholder-200x200.png'
  }

  return (
    <span className={classes} {...rest}>
      <img
        loading="lazy"
        width={imgW}
        height={imgH}
        className={'pkimg-img-loading'}
        src={imageSrc}
        alt={title || nid}
        onLoad={(e) => {
          e.currentTarget.classList.remove('pkimg-img-loading')
        }}
      />
    </span>
  )
}
