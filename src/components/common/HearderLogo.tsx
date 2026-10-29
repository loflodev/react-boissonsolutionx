interface HeaderLogoProps {
  alt: string;
  link: string;
  logo: string;
}

const HeaderLogo = ({ alt, link, logo }: HeaderLogoProps) => {
  return (
    <div className="md:flex md:items-center md:gap-12">
      <a className="block text-teal-600 dark:text-teal-600" href={link}>
        <img
          className="w-[180px] md:w-[190px] h-auto"
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
