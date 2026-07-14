import { Link } from "@mui/joy";
import Icon from "@/components/Icon";
import MobileHeader from "@/components/MobileHeader";

const About = () => {
  return (
    <section className="@container w-full max-w-5xl min-h-full flex flex-col justify-start items-center sm:pt-3 md:pt-6 pb-8">
      <MobileHeader />
      <div className="w-full px-4 sm:px-6">
        <div className="w-full shadow flex flex-col justify-start items-start px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-gray-300">
          <a
            className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-gray-100"
            href="https://github.com/baduyifei/mindmemo"
            target="_blank"
          >
            MindMemo
          </a>
          <p className="text-base">A private, self-hosted home for capturing and revisiting your thoughts.</p>
          <div className="mt-1 flex flex-row items-center flex-wrap">
            <Link underline="always" href="https://github.com/baduyifei/mindmemo" target="_blank">
              MindMemo GitHub
            </Link>
            <Icon.Dot className="w-4 h-auto opacity-60" />
            <Link underline="always" href="https://github.com/usememos/memos" target="_blank">
              Memos Upstream
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
