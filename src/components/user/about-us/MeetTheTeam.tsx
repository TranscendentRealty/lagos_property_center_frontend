import React from 'react';
import Image from 'next/image';
import { images } from '@/exports/images';

const MeetTheTeam = () => {
     const title = "Meet the Team";
  const description = "Founded by Bukunmi Olalekan and Pelumi Olalekan, whose backgrounds span marketing, sales, and engineering, Transcendent Realty represents a refined approach to Lagos real estate. With a commitment to excellence and precision, they have curated an exclusive portfolio of premium, verified properties — delivering a seamless, discreet, and elevated experience for discerning buyers, renters, and investors.";
  const teamImages = [
    { src: "https://media.transcendentrealty.com/admin/bukunmi_headshot.jpg", alt: "Oluwabukunmi Olalekan", animation: "slide-down" },
    { src: "https://media.transcendentrealty.com/admin/pelumi_headshot.jpeg", alt: "Oluwapelumi Olalekan", animation: "slide-up" },
  ];
  return (
    <section className="meet-the-team-section py-5">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="row align-items-center g-4 g-lg-5"> {/* g-lg-5 for larger gap on larger screens */}

          {/* Image Collage Column */}
          <div className="col-md-6">
            <div className="team-image-collage-wrapper">
              {/* Decorative Circles */}
              {/* To do: Animate these circles */}
              <div className="decorative-circle large-circle"></div>
              <div className="decorative-circle small-circle"></div>
              <div className="decorative-circle smallest-circle"></div>

              {/* Team Images - map through them for flexibility */}
              {teamImages.map((img, index) => (
                <div key={index} className={`team-image-item team-image-${index + 1} shadow-sm`} data-aos={img.animation} data-aos-ease="linear" data-aos-duration="500">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={300} // Example intrinsic width
                    height={400} // Example intrinsic height
                    layout="responsive"
                    objectFit="cover"
                    className="team-member-photo img-fluid"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Text Content Column */}
          <div className="col-md-6">
            <div className="team-text-content" data-aos="zoom-in" data-aos-ease="linear" data-aos-duration="500">
              <h2 className="display-5 fw-bold mb-3">{title}</h2>
              <p className="text-black text-justify lead">{description}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;