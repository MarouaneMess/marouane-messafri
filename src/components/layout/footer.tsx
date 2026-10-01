import Link from "next/link";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/config/site";
import { getSettings } from "@/lib/content";
export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="footer container">
      <div className="footer-main">
        <div>
          <Link className="footer-name" href="/">
            {site.name}
            <span> ↗</span>
          </Link>
          <p>{site.title}</p>
        </div>
        <div className="socials">
          {settings.github && (
            <a
              href={settings.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github size={19} />
            </a>
          )}
          {settings.linkedin && (
            <a
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin size={19} />
            </a>
          )}
          {settings.contactEmail && (
            <a href={`mailto:${settings.contactEmail}`} aria-label="Email">
              <Mail size={19} />
            </a>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span className="mono">BUILD. BREAK. SECURE. REPEAT.</span>
        <Link href="/contact">
          Une idée, un échange <ArrowUpRight size={13} />
        </Link>
      </div>
    </footer>
  );
}
