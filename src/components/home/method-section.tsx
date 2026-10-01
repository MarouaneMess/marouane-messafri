import Link from "next/link";
import { ArrowUpRight, Code2, Fingerprint, ShieldCheck } from "lucide-react";
export function MethodSection() {
  return (
    <section className="method-section">
      <div className="method-intro">
        <div className="eyebrow">UNE MÊME LOGIQUE, TROIS REGARDS</div>
        <h2>
          Le code n’est
          <br />
          que le début<span>.</span>
        </h2>
        <p>
          Je passe d’une perspective à l’autre.
          <br />
          Parce qu’une application solide se pense dans son ensemble.
        </p>
      </div>
      <div className="method-cards">
        <Link href="/projects" className="method-card method-build">
          <span className="method-number mono">01 / SOFTWARE ENGINEERING</span>
          <Code2 className="method-icon" size={33} strokeWidth={1} />
          <h3>
            Build<span>↗</span>
          </h3>
          <p>
            Donner forme à une idée.
            <br />
            Du premier composant à l’application.
          </p>
          <div className="method-tags mono">INTERFACES · API · DATA</div>
          <ArrowUpRight className="method-arrow" size={18} />
        </Link>
        <Link href="/security" className="method-card method-break">
          <span className="method-number mono">02 / SECURITY RESEARCH</span>
          <Fingerprint className="method-icon" size={33} strokeWidth={1} />
          <h3>
            Break<span>↗</span>
          </h3>
          <p>
            Poser les bonnes questions.
            <br />
            Comprendre ce qui peut échouer.
          </p>
          <div className="method-tags mono">RESEARCH · CTF · BUG BOUNTY</div>
          <ArrowUpRight className="method-arrow" size={18} />
        </Link>
        <Link href="/services" className="method-card method-secure">
          <span className="method-number mono">03 / APPLICATION SECURITY</span>
          <ShieldCheck className="method-icon" size={33} strokeWidth={1} />
          <h3>
            Secure<span>↗</span>
          </h3>
          <p>
            Faire de la sécurité une fondation.
            <br />
            Pas une dernière étape.
          </p>
          <div className="method-tags mono">REVIEW · TRUST · RESILIENCE</div>
          <ArrowUpRight className="method-arrow" size={18} />
        </Link>
      </div>
    </section>
  );
}
