const NotFoundScreen = ({ title = "Page not found" }) => {
  return (
    <div className="text-center text-heading-3 flex flex-col items-center justify-center h-screen gap-12">
      404 NOT FOUND
      <h1 className="text-heading-5">{title}</h1>
    </div>
  );
};

export default NotFoundScreen;
