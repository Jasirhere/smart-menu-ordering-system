import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Menu,
  Send,
  Sparkles,
  Table2,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";

const foodImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5_rA2jxY3SNjpGOAQrgsimHvW2OPHE2JMNwQ_2m3KqILKtCL5mjCHpZFNB4669-CgWuPZ88FS5yS7ULsULjjSUz5bty4g8ZT3gCBj90J50nGcwAcpf4x3qyov7koNWkBIO1XXM72ZBjOzOy-vVix2ldH9uTy9NxlBkPiyYO_RQ-gqfR6sjiyjCWSzZWllB8WVpQWddEq99VAcVsPxqT-XyAqufY1IwgNncHB2CG8_ozfne-aItH1qwfneZzrZYtFJHnfHWl9O2cU";

const avatars = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEfuh8npUQaRiwyfR2iFM4K7WGTKQPSg5P4PqjNT3hExPnfCk7avccI7sE0JCbjHROduefHXw23JnA8914TkWFKS9OufOEiLr8H37FRtEY3_8bMM6LgSLvW_OUDbUhNI864M0mtRyuLuYwt34nF2f6RNMjasEm-knWugbuIB-c6JTNorL-G6CRbz7N-973cebavHraNtwvRzD0o0vFVJGKFy4dHCyC2BRSqifqgE6kRG4FdtdT1zpWGvNo0d5Da8NfN5kFVylQYH0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDMSXjYaR_W64Iar_1apJl3P3OX1Y0afA2F0ZYNb-sp2jEZSNW6I1gs_EUpQf6ZHvEbWKPpNrWXeUOLUuprzfjrgUSILtkYu_GLVMUme-dGRJQx-K1DAICuTz9v5E9Rj44ugbPRT3YO2WANQ2-ed4crQsGHTdVf09hVoddwoc2ssGNAvPnF7zbI1CqTGKHe35W6U8wSYq0Wv9mc6iowYRq9b1IUFFPk-T6YNXFEbItRr_qaf9TRtn9b7fHC4ayY5y15Q0c6z64GyeU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA91Et5EXFP1QELFlPW_26EYCzqrHYkH4ABPa4SmYEkjW-nI1LotLg5_RIRFYfeF7cUoikFa_RNdeu9xLbmetXWpuue86bHuQ96L7nvzfKHlPoCy3JjZizPoDgPrrs0Pu8qr__HOYNBXDPQinkI9EvsRzB3Y3ESA0XuSsDyhNaI-oFiL8nTKdQbA7e5NRoMjj6MglISxpJA5kq6sOE9_iICBbFQbzOmKwvzv5nJ-l1PQ9hjIGYkvgia4NpYHz5Vh57YVGgeOwdwNkM",
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-[var(--background)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10 lg:px-16">
          <a
            href="#platform"
            className="font-heading text-2xl font-bold text-[var(--primary)] md:text-3xl"
          >
            TableMind
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#platform"
              className="border-b-2 border-[var(--primary)] pb-1 text-sm font-semibold text-[var(--primary)]"
            >
              Platform
            </a>

            <a
              href="#features"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            >
              Solutions
            </a>

            <a
              href="#manager-insights"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            >
              Resources
            </a>

            <a
              href="#pricing"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/staff/login"
              className="hidden rounded-full px-5 py-2 text-sm font-medium text-[var(--primary)] transition hover:bg-black/5 sm:block"
            >
              Login
            </Link>

            <a
              href="#pricing"
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:text-sm"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section
          id="platform"
          className="relative mx-auto grid min-h-[860px] max-w-[1440px] items-center gap-16 overflow-hidden px-5 py-20 md:px-10 lg:min-h-[920px] lg:grid-cols-2 lg:px-16"
        >
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#2a1700]">
              <Sparkles size={15} />
              Next-Gen Hospitality
            </div>

            <h1 className="font-heading text-5xl leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-[68px]">
              The Future of Dining:{" "}
              <span className="italic text-[var(--primary)]">
                Scan, AI-Order, Done.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
              TableMind transforms the traditional dining experience into an
              effortless, intelligent journey. From group ordering to
              AI-curated recommendations, we bridge the gap between modern
              hospitality and intelligent technology.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#features"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-4 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5"
              >
                Book a Demo
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="#manager-insights"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-8 py-4 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--surface-soft)]"
              >
                View Case Studies
              </a>
            </div>
          </div>

          {/* Phone mock-up */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-[500px] w-[500px] rounded-full bg-[var(--primary-light)]/40 blur-[110px]" />

            <div className="animate-float relative z-10 h-[650px] w-[320px] rounded-[3rem] border-[8px] border-[#534434] bg-[#1b1c1c] p-2 shadow-2xl">
              <div className="flex h-full flex-col overflow-hidden rounded-[2.3rem] bg-[var(--background)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
                  <UtensilsCrossed
                    size={18}
                    className="text-[var(--primary)]"
                  />

                  <span className="text-xs font-semibold">
                    Table 12 · The Bistro
                  </span>

                  <Menu size={18} className="text-[var(--text-muted)]" />
                </div>

                <div className="flex-1 space-y-5 p-4">
                  <div>
                    <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-[var(--surface-soft)] p-3 text-sm leading-5">
                      Welcome! I&apos;m your AI menu assistant. Based on the
                      Ribeye you selected, I&apos;d suggest truffle fries. Shall
                      I add them?
                    </div>

                    <p className="mt-1 text-[9px] font-semibold tracking-wide text-[var(--text-muted)]">
                      AI ASSISTANT
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#e89611] p-3 text-sm leading-5 text-[#583500]">
                      Yes please, and another order for the table.
                    </div>

                    <p className="mt-1 text-[9px] font-semibold tracking-wide text-[var(--text-muted)]">
                      YOU
                    </p>
                  </div>

                  <div className="intelligence-shimmer rounded-2xl border border-[var(--primary-light)] bg-[var(--surface-muted)] p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url("${foodImage}")` }}
                      />

                      <div>
                        <p className="text-sm font-semibold">Added to Cart</p>

                        <p className="text-sm font-bold text-[var(--primary)]">
                          £14.00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-[var(--border)] p-4">
                  <div className="flex-1 rounded-full bg-[var(--surface-muted)] px-4 py-2.5 text-xs text-[var(--text-muted)]">
                    Ask me anything...
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                    <Send size={17} />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-[22%] z-20 hidden w-44 rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-xl backdrop-blur-md sm:block lg:-right-6">
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <Users size={17} />
                <span className="text-xs font-semibold">Group Sync</span>
              </div>

              <p className="mt-2 text-[11px] leading-4 text-[var(--text-muted)]">
                Sarah and 3 others are currently adding items...
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="bg-[var(--surface-soft)] px-5 py-20 md:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <h2 className="font-heading text-4xl font-bold md:text-5xl">
                Intelligent from Table to Kitchen
              </h2>

              <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
                Our ecosystem integrates every touchpoint of the dining journey
                into a single, cohesive intelligence layer.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <article className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-7 shadow-sm transition hover:shadow-md md:col-span-7">
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                    <Sparkles size={22} />
                  </div>

                  <h3 className="font-heading mt-7 text-3xl font-semibold">
                    AI Menu Assistant
                  </h3>

                  <p className="mt-4 max-w-lg leading-7 text-[var(--text-muted)]">
                    Our intelligence engine understands dietary restrictions,
                    flavour preferences, allergies, budgets and spice levels,
                    acting as a personal menu assistant for every guest.
                  </p>
                </div>

                <UtensilsCrossed
                  size={290}
                  className="absolute -right-8 -bottom-24 text-[var(--primary)] opacity-[0.08] transition group-hover:opacity-[0.14]"
                />
              </article>

              <article className="flex flex-col justify-between rounded-3xl bg-[#1b1c1c] p-7 text-white md:col-span-5">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--secondary)]">
                    <ClipboardList size={22} />
                  </div>

                  <h3 className="font-heading mt-7 text-3xl font-semibold">
                    Real-time Sync
                  </h3>

                  <p className="mt-4 leading-7 text-white/70">
                    Orders move directly from the customer table to the
                    restaurant dashboard, where staff can manage pending,
                    preparing, ready and served orders.
                  </p>
                </div>

                <div className="mt-10 flex gap-2">
                  <div className="h-1 flex-1 rounded-full bg-[var(--primary)]" />
                  <div className="h-1 flex-1 rounded-full bg-white/20" />
                  <div className="h-1 flex-1 rounded-full bg-white/20" />
                </div>
              </article>

              <article className="intelligence-shimmer relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-white/70 p-7 backdrop-blur md:col-span-12 md:flex-row md:items-center">
                <div className="flex-1">
                  <h3 className="font-heading text-3xl font-semibold">
                    Seamless Group Ordering
                  </h3>

                  <p className="mt-4 max-w-4xl leading-7 text-[var(--text-muted)]">
                    Multiple guests at the same table can join one shared cart.
                    Everyone can add items in real time, while the host reviews
                    and confirms the final order.
                  </p>
                </div>

                <div className="flex -space-x-4">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar}
                      className="h-16 w-16 rounded-full border-4 border-[var(--background)] bg-cover bg-center"
                      style={{ backgroundImage: `url("${avatar}")` }}
                    />
                  ))}

                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[var(--background)] bg-[var(--primary)] text-sm font-bold text-white">
                    +2
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Manager insights */}
        <section
          id="manager-insights"
          className="overflow-hidden px-5 py-24 md:px-10 lg:px-16"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 lg:flex-row">
            <div className="flex-1">
              <h2 className="font-heading max-w-xl text-4xl font-bold md:text-5xl">
                Intelligence Insights for Managers
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
                Transform your dining room into a data-driven operation.
                Monitor table activity, popular dishes, order values and
                AI-assisted menu performance from one dashboard.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm font-semibold text-[var(--primary)]">
                  <TrendingUp size={18} />
                  Live Revenue Analytics
                </li>

                <li className="flex items-center gap-3 text-sm font-semibold text-[var(--primary)]">
                  <Table2 size={18} />
                  Live Table and Order Activity
                </li>

                <li className="flex items-center gap-3 text-sm font-semibold text-[var(--primary)]">
                  <BarChart3 size={18} />
                  Menu Performance Insights
                </li>
              </ul>
            </div>

            <div className="relative flex-1">
              <div
                className="origin-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] shadow-2xl transition duration-700"
                style={{
                  transform:
                    "perspective(1000px) rotateY(-6deg) rotateX(2deg)",
                }}
              >
                <div className="flex items-center gap-2 bg-[#eae7e7] px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>

                  <div className="mx-auto rounded-md bg-white px-10 py-1 text-[10px] text-[var(--text-muted)]">
                    admin.tablemind.ai/dashboard
                  </div>
                </div>

                <div className="flex min-h-[410px] gap-4 bg-white p-6">
                  <aside className="hidden w-40 space-y-4 border-r border-[var(--border)] pr-4 sm:block">
                    <div className="flex h-9 items-center rounded bg-[var(--primary-light)]/60 px-3 text-xs font-bold text-[var(--primary)]">
                      Dashboard
                    </div>

                    <div className="flex h-9 items-center rounded px-3 text-xs text-[var(--text-muted)]">
                      Live Orders
                    </div>

                    <div className="flex h-9 items-center rounded px-3 text-xs text-[var(--text-muted)]">
                      Menu Editor
                    </div>

                    <div className="flex h-9 items-center rounded px-3 text-xs text-[var(--text-muted)]">
                      Analytics
                    </div>
                  </aside>

                  <div className="min-w-0 flex-1 space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                        <p className="text-[9px] uppercase text-[var(--text-muted)]">
                          Daily Revenue
                        </p>

                        <p className="mt-1 text-xl font-bold text-[var(--primary)]">
                          £12,480
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                        <p className="text-[9px] uppercase text-[var(--text-muted)]">
                          Average Order
                        </p>

                        <p className="mt-1 text-xl font-bold text-[var(--primary)]">
                          £84.50
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                        <p className="text-[9px] uppercase text-[var(--text-muted)]">
                          AI Conversion
                        </p>

                        <p className="mt-1 text-xl font-bold text-[var(--primary)]">
                          24.2%
                        </p>
                      </div>
                    </div>

                    <div
                      className="relative h-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, rgba(133,83,0,0.15) 1px, transparent 1px), linear-gradient(rgba(133,83,0,0.15) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    >
                      <div className="absolute right-0 bottom-0 left-0 h-3/4 text-[var(--primary)]">
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="h-full w-full"
                          aria-hidden="true"
                        >
                          <path
                            d="M0,100 C18,82 35,88 50,65 S72,20 100,52 L100,100 L0,100 Z"
                            fill="currentColor"
                            fillOpacity="0.16"
                          />

                          <path
                            d="M0,100 C18,82 35,88 50,65 S72,20 100,52"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className="px-5 pb-16 md:px-10 lg:px-16">
          <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[3rem] bg-[#1b1c1c] px-6 py-20 text-center text-white md:px-12">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[var(--primary)]/25 blur-[120px]" />

            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[var(--secondary)]/20 blur-[110px]" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="font-heading text-4xl font-bold md:text-5xl">
                Ready to Evolve Your Restaurant?
              </h2>

              <p className="mt-6 text-base text-white/70">
                Designed for independent and growing restaurants looking to
                modernise the customer ordering experience.
              </p>

              <a
                href="#platform"
                className="mt-9 inline-flex rounded-2xl bg-[var(--primary)] px-12 py-4 text-sm font-semibold text-white shadow-2xl transition hover:scale-105"
              >
                Get Started Now
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-5 py-12 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <div className="font-heading text-2xl font-bold text-[var(--primary)]">
              TableMind
            </div>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              © 2026 TableMind AI. Intelligent Restaurant Ordering.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <a
              href="#"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            >
              Terms of Service
            </a>

            <a
              href="#"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            >
              Contact Support
            </a>

            <a
              href="#"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            >
              Careers
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}