import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ParallaxHero.css";

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxHero() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Initial size
    let cw = canvas.offsetWidth;
    let ch = canvas.offsetHeight;
    canvas.width = cw;
    canvas.height = ch;

    const frameCount = 193;
    const currentFrame = index => (
      `/frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const sequence = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    images[0].onload = render;

    function render() {
      const img = images[sequence.frame];
      if (!img || !img.complete) return;
      
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;  

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, img.width, img.height,
                        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".landing-hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
      }
    });

    tl.to(sequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      onUpdate: render,
    }, 0);

    tl.to(canvasRef.current, {
      y: "35%", // Stronger downward parallax
      scale: 1.15,
      opacity: 0.4,
      ease: "power1.inOut"
    }, 0);

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        render();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="parallax-hero-bg">
      <div className="parallax-hero-overlay"></div>
      <canvas ref={canvasRef} className="parallax-hero-canvas"></canvas>
    </div>
  );
}
