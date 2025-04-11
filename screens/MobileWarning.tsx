import Image from "next/image";

const MobileWarning = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-20 h-20 mb-8 relative">
        <Image
          src="/images/logo.png"
          alt="BinkAI Logo"
          fill
          className="object-contain"
        />
      </div>
      <h1 className="text-heading-4 text-center mb-4">
        Mobile Version Coming Soon
      </h1>
      <p className="text-body-medium text-center text-muted-foreground max-w-[300px]">
        BinkAI is currently optimized for desktop use. Please access from a
        desktop browser for the best experience.
      </p>
    </div>
  );
};

export default MobileWarning;
