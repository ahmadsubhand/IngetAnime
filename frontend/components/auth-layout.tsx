import Image from "next/image";
import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: ReactNode;
};

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="w-full h-full flex">
      <div className="w-full md:w-1/2 xl:justify-end h-full flex items-center justify-center">
        <div className="w-full flex flex-col justify-center gap-5 sm:px-10 px-5 py-3 md:w-105 xl:mr-30">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden md:block w-1/2">
        <Image
          src={"/auth-bg.jpg"}
          alt="Auth Background - Kaguya Shinomiya"
          className="object-cover"
          fill
          sizes="(max-width: 767px) 0px, 50vw"
          loading={'eager'}
        />
        <div className="w-full h-full absolute z-1 bg-linear-to-r from-white to-transparent"></div>
      </div>
    </div>
  );
}
