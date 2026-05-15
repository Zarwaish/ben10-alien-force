import React from 'react';

function About() {
  return (
    <section className="about" id="omnitrix">
      <div className="about-image">
        <img src="/src/assets/images/watchn.png" alt="Omnitrix" />
      </div>
      <div className="about-card">
        <h2>THE OMNITRIX</h2>
        <p>
          The Omnitrix is the most powerful device in the universe.
          Created by Azmuth, it allows the user to alter their DNA and
          transform into various alien species. In Alien Force, Ben
          commands a recalibrated version with even more lethal potential.
        </p>
      </div>
    </section>
  );
}

export default About;
