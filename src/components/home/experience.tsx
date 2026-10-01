"use client";
import { useEffect } from "react";
export function Experience() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = document.querySelectorAll(
      ".section-heading, .work-feature, .project-card, .research-feature, .about-strip, .service-card, .post-card, .contact-cta",
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    items.forEach((item, i) => {
      if (item.getBoundingClientRect().top > window.innerHeight) {
        (item as HTMLElement).style.setProperty(
          "--reveal-delay",
          `${(i % 3) * 60}ms`,
        );
        item.classList.add("reveal-item");
        observer.observe(item);
      }
    });
    function pointer(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        ".project-card",
      );
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg) translateY(-5px)`;
    }
    function leave(event: PointerEvent) {
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        ".project-card",
      );
      if (
        card &&
        (!event.relatedTarget || !card.contains(event.relatedTarget as Node))
      )
        card.style.transform = "";
    }
    document.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    return () => {
      observer.disconnect();
      items.forEach((item) =>
        item.classList.remove("reveal-item", "is-visible"),
      );
      document.removeEventListener("pointermove", pointer);
      document.removeEventListener("pointerout", leave);
    };
  }, []);
  return null;
}
