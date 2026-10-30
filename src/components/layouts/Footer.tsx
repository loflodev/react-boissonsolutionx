const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="relative mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <a
            className="inline-block rounded-full bg-red-600 p-2 text-white shadow-sm transition-[scale,background-color] duration-100 ease-out hover:bg-red-700 active:bg-red-800 active:scale-[0.94] sm:p-3 lg:p-4"
            href="#hero"
          >
            <span className="sr-only">Retour en haut</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>

        <p className="text-gray-400 text-center">
          Copyright &copy; {new Date().getFullYear()} Boisson SolutionX. Tous droits réservés. Développé par{" "}
          <a className="underline" href="https://www.instagram.com/louis_thereborn" target="_blank" rel="noopener noreferrer">
            Louis Jr Florival
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
