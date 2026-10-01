import { ButtonLink } from "./ui";
export function ContactCTA() {
  return (
    <section className="contact-cta">
      <div>
        <div className="eyebrow">LA SUITE S’ÉCRIT ENSEMBLE</div>
        <h2>
          Une idée à construire<span> ?</span>
        </h2>
        <p>
          Un projet, une opportunité ou simplement une conversation technique.
        </p>
      </div>
      <ButtonLink href="/contact">Parlons-en</ButtonLink>
    </section>
  );
}
