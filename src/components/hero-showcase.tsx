import Image from "next/image";
export function HeroShowcase() {
  return (
    <div>
      <div className="grid gap-4 lg:hidden">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
          <div className="relative overflow-hidden rounded-[1.8rem] border-[6px] border-[#D3A14B] bg-[linear-gradient(180deg,#123B7A,#15305F)]">
            <div className="relative h-[320px]">
              <Image
                src="/hero-characters-source.png"
                alt="طلاب يستعدون لاختبار القدرات"
                fill
                priority
                className="object-cover object-[42%_12%] scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,28,58,0.08),rgba(9,28,58,0.02))]" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-[560px] lg:block">
        <div className="relative mx-auto flex h-[560px] w-full items-end justify-center">
          <div className="absolute left-1/2 top-12 w-[500px] -translate-x-1/2">
            <div className="rounded-[2rem] border-[8px] border-[#D3A14B] bg-[linear-gradient(180deg,#14325f,#123b7a)] p-2 shadow-[0_30px_70px_rgba(0,0,0,0.22)]">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <div className="relative h-[420px]">
                  <Image
                    src="/hero-characters-source.png"
                    alt="طلاب وطالبات القدرات"
                    fill
                    priority
                    className="object-cover object-[42%_12%] scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(18,59,122,0.08),transparent_20%),linear-gradient(180deg,rgba(9,28,58,0.08),rgba(9,28,58,0.02))]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
