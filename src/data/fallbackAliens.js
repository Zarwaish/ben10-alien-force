import swampfireImg from '../assets/images/swarfire.png';
import humungousaurImg from '../assets/images/humangasour.png';
import jetrayImg from '../assets/images/jetrey.png';
import bigchillImg from '../assets/images/bigchill.png';
import chromastoneImg from '../assets/images/chromastone.png';
import echoechoImg from '../assets/images/echoecho.png';
import alienxImg from '../assets/images/alienx.png';
import goopImg from '../assets/images/goop.png';
import waybigImg from '../assets/images/waybig.png';
import spidermonkeyImg from '../assets/images/spm.png';

// Additional gallery images
import sf1 from '../assets/images/sf1.png';
import sf2 from '../assets/images/sf2.png';
import sf3 from '../assets/images/sf3.png';

import hu1 from '../assets/images/hu1.png';
import hu2 from '../assets/images/hu2.png';

import j1 from '../assets/images/j1.png';
import j2 from '../assets/images/j2.png';
import j3 from '../assets/images/j3.png';

import bc1 from '../assets/images/bc1.png';
import bc2 from '../assets/images/bc2.png';
import bc3 from '../assets/images/bc3.png';

import ch1 from '../assets/images/ch1.png';
import ch2 from '../assets/images/ch2.png';
import ch3 from '../assets/images/ch3.png';

import ech1 from '../assets/images/ech1.png';
import ech2 from '../assets/images/ech2.png';
import ech3 from '../assets/images/ech3.png';

import ax1 from '../assets/images/ax1.png';
import ax2 from '../assets/images/ax2.png';
import ax3 from '../assets/images/ax3.png';

import g1 from '../assets/images/g1.png';
import g2 from '../assets/images/g2.png';
import g4 from '../assets/images/g4.png';

import sm1 from '../assets/images/sm1.png';
import sm2 from '../assets/images/sm2.png';

export const fallbackAliens = [
  {
    id: '1',
    name: 'Swampfire',
    description: 'A Methanosian from the planet Methanos. He has super strength, fire manipulation, and plant control.',
    image_url: swampfireImg,
    gallery: [swampfireImg, sf1, sf2, sf3],
    power: 'Pyrokinesis, Chlorokinesis',
    species: 'Methanosian'
  },
  {
    id: '2',
    name: 'Humungousaur',
    description: 'A Vaxasaurian from the planet Terradino. He is a dinosaur-like alien with incredible strength and the ability to grow in size.',
    image_url: humungousaurImg,
    gallery: [humungousaurImg, hu1, hu2],
    power: 'Super Strength, Size Alteration',
    species: 'Vaxasaurian'
  },
  {
    id: '3',
    name: 'Jetray',
    description: 'An Aerophibian from the planet Aeropela. He can fly at supersonic speeds and fire neuroshock blasts from his eyes and tail.',
    image_url: jetrayImg,
    gallery: [jetrayImg, j1, j2, j3],
    power: 'Flight, Neuroshock Blasts',
    species: 'Aerophibian'
  },
  {
    id: '4',
    name: 'Big Chill',
    description: 'A Necrofriggian from the planet Kylmyys. He can become intangible, fly, and breathe freezing vapor.',
    image_url: bigchillImg,
    gallery: [bigchillImg, bc1, bc2, bc3],
    power: 'Cryokinesis, Intangibility',
    species: 'Necrofriggian'
  },
  {
    id: '5',
    name: 'Chromastone',
    description: 'A Crystalsapien from the planet MorOtesi. He can absorb energy and redirect it as powerful laser blasts.',
    image_url: chromastoneImg,
    gallery: [chromastoneImg, ch1, ch2, ch3],
    power: 'Energy Absorption, Ultraviolet Beams',
    species: 'Crystalsapien'
  },
  {
    id: '6',
    name: 'Echo Echo',
    description: 'A Sonorosian from the planet Sonorosia. He is a small silicon-based lifeform that can duplicate himself and emit sonic screams.',
    image_url: echoechoImg,
    gallery: [echoechoImg, ech1, ech2, ech3],
    power: 'Self-Duplication, Sonokinesis',
    species: 'Sonorosian'
  },
  {
    id: '7',
    name: 'Alien X',
    description: 'A Celestialsapien from the Forge of Creation. He is omnipotent and can warp reality, time, and space.',
    image_url: alienxImg,
    gallery: [alienxImg, ax1, ax2, ax3],
    power: 'Omnipotence, Reality Warping',
    species: 'Celestialsapien'
  },
  {
    id: '8',
    name: 'Goop',
    description: 'A Polymorph from the planet Viscosia. He is a shape-shifting, acidic blob of slime controlled by an anti-gravity projector.',
    image_url: goopImg,
    gallery: [goopImg, g1, g2, g4],
    power: 'Shape-shifting, Acid Generation',
    species: 'Polymorph'
  },
  {
    id: '9',
    name: 'Way Big',
    description: 'A To\'kustar created in cosmic storms. He is a massive alien with incredible strength and cosmic ray beams.',
    image_url: waybigImg,
    gallery: [waybigImg],
    power: 'Super Strength, Cosmic Rays',
    species: 'To\'kustar'
  },
  {
    id: '10',
    name: 'Spidermonkey',
    description: 'An Arachnichimp from the planet Aranhaschimmia. He has superhuman agility, wall-crawling, and web-shooting abilities.',
    image_url: spidermonkeyImg,
    gallery: [spidermonkeyImg, sm1, sm2],
    power: 'Agility, Webbing',
    species: 'Arachnichimp'
  }
];
