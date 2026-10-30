interface HeaderLogoProps {
  alt: string;
  link: string;
  logo: string;
}

const HeaderLogo = ({ alt, link, logo }: HeaderLogoProps) => {
  return (
    <div className="md:flex md:items-center md:gap-12">
      <a className="block" href={link}>
        <img
          className="w-[150px] md:w-[170px] h-auto"
          src={logo}
          alt={alt}
          width={229}
          height={84}
          fetchPriority="high"
        />
      </a>
    </div>
  );
};

export default HeaderLogo;
