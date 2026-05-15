import React from 'react';
import { motion } from 'framer-motion';
import watchnImg from '../assets/images/watchn.png';

function About() {
  return (
    <section className="about" id="omnitrix">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="about-image"
      >
        <img src={watchnImg} alt="Omnitrix" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="about-card"
      >
        <h2>THE OMNITRIX</h2>
        <p>
          The Omnitrix is the most powerful device in the universe.
          Created by Azmuth, it allows the user to alter their DNA and
          transform into various alien species. In Alien Force, Ben
          commands a recalibrated version with even more lethal potential.
        </p>
      </motion.div>
    </section>
  );
}

export default About;
