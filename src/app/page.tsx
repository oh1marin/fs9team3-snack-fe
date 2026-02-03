import Image from "next/image";
import Header from "@/components/Header";

export default function LandingPage() {
  return (
    <>
      <Header hasToken={false} />
      <div
        className="relative mx-auto w-full max-w-[1920px] bg-[#FDF0DF]"
        style={{ height: "calc(100vh - 88px)", minHeight: "992px" }}
      >
      <div className="flex flex-col items-center pt-8">
        <Image
          src="/snacklogo.png"
          alt="Snack"
          width={742}
          height={248}
          priority
          className="h-auto w-[150px] sm:w-[280px] md:w-[400px] lg:w-[500px]"
        />

        <div className="mt-8">
          <Image
            src="/mid.png"
            alt="mid"
            width={740}
            height={120}
            priority
            className="h-auto w-[300px] sm:w-[520px] md:w-[620px] lg:w-[740px]"
          />
        </div>
      </div>

      <div className="mt-10 w-full px-6 lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:w-full lg:-translate-x-1/2">
        <Image
          src="/landingpageall.png"
          alt="all"
          width={1600}
          height={900}
          priority
          className="mx-auto h-auto w-full max-w-[1600px]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1600px"
        />
      </div>
    </div>
    </>
  );
}
