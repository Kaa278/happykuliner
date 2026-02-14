import Navbar from "@/components/Navbar";
import SequenceScroll from "@/components/SequenceScroll";
import ContentSections from "@/components/ContentSections";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen">
        <Navbar />

        <SequenceScroll />

        <ContentSections />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
