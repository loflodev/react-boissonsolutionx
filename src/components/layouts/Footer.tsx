const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="relative mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <a
            className="inline-block rounded-full bg-teal-600 p-2 text-white shadow-sm transition hover:bg-teal-500 sm:p-3 lg:p-4 dark:bg-gray-700 dark:text-teal-300 dark:hover:bg-gray-600"
            href="#hero"
          >
            <span className="sr-only">Back to top</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>

        <p className="text-gray-500 text-center">
          Copyright &copy; 2025. All rights reserved. Develop by{" "}
          <a href="https://www.instagram.com/louis_thereborn" target="_blank">
            Louis Jr Florival
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
