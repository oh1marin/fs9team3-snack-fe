import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="w-full bg-[#F97B22]">
      <div className="mx-auto flex h-[88px] w-full max-w-[1920px] items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/whitesnacklogo.png"
            alt="Snack"
            width={180}
            height={48}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-10">
          <Link
            href="/login"
            className="text-lg font-semibold text-white hover:opacity-90"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="text-lg font-semibold text-white hover:opacity-90"
          >
            회원가입
          </Link>
        </nav>
      </div>
    </header>
  );
}
