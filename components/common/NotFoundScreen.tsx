import { NotFound } from "../icons";

const NotFoundScreen = ({ title = "Page not found" }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-12">
      <NotFound />
      <h1 className="text-heading-5">{title}</h1>
    </div>
  );
};

export default NotFoundScreen;
