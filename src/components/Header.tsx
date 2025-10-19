import { NoobieLogo } from "./NoobieLogo";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <NoobieLogo textSize="text-3xl" />
    </header>
  );
};
