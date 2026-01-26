import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="fixed left-0 top-0 z-50 h-[88px] w-full bg-[#F97B22]">
      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-8">
        <Link href="/">
          <Image
            src="/whitesnacklogo.png"
            alt="Snack"
            width={180}
            height={48}
            priority
          />
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/login" className="text-white text-lg font-semibold">
            로그인
          </Link>
          <Link href="/signup" className="text-white text-lg font-semibold">
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
}
