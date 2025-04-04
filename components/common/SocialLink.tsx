"use client";

import { GithubFilled, SocialXFill, TelegramFilled } from "../icons";
import { Button } from "../ui/button";

const SocialLink = () => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" className="w-7 h-7 rounded-full">
        <GithubFilled />
      </Button>
      <Button variant="secondary" size="icon" className="w-7 h-7 rounded-full">
        <SocialXFill />
      </Button>
      <Button variant="secondary" size="icon" className="w-7 h-7 rounded-full">
        <TelegramFilled />
      </Button>
    </div>
  );
};

export default SocialLink;
