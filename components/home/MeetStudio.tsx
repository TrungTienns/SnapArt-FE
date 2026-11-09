import Link from "next/link";

export function MeetStudio() {
  return (
    <section id="meet-studio" className="studio-closing" data-scroll-snap aria-labelledby="meet-studio-title">
      <p className="art-kicker">Leave a little room for making.</p>
      <h2 id="meet-studio-title" className="studio-closing-title">YOUR NEXT<br /><span className="font-pencil">happy accident.</span></h2>
      <Link className="studio-closing-link" href="/about">MEET YOUR STUDIO <span aria-hidden="true">↗</span></Link>
      <footer className="studio-colophon"><span>SNAPART / IN LOVE WITH PAINT</span><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a><span>MADE WITH HANDS. GROWN WITH HEART.</span></footer>
    </section>
  );
}
