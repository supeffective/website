import Image from 'next/image'
import Link from 'next/link'

export interface LogoWhiteProps {
  opacity: number

  [key: string]: any
}

export const LogoWhite = ({ opacity, ...props }: LogoWhiteProps) => {
  return (
    <div className="logoContainer" {...props}>
      <Link href="/">
        <Image src="/images/logo/logo-white.svg" width="144" height="72" alt="logo" />
      </Link>
      <style jsx>{`
        .logoContainer {
          color: rgba(255, 255, 255, ${opacity});
          font-weight: bold;
          font-size: 1.4rem;
          padding-bottom: 0.33rem;
          border: none;
          margin: 0.9rem 0 0 0;
          text-align: center;
          display: inline-block;
          vertical-align: middle;
        }

        .logoContainer a {
          display: block;
          text-decoration: none;
          vertical-align: middle;
        }

        .logoContainer img {
          opacity: ${opacity};
          width: 80px;
          height: 80px;
          aspect-ratio: 1;
          display: inline-block;
          vertical-align: middle;
          margin-bottom: 2px;
        }

        .logoContainer .title {
          vertical-align: middle;
          display: inline-block;
          color: rgba(255, 255, 255, ${opacity});
        }
      `}</style>
    </div>
  )
}
