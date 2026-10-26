import teesImg from '../assets/pictures/481197009_993367959524230_5510045300768098421_n.jpg';
import teeDetailImg from '../assets/pictures/481088805_994430486084644_4070894412361349226_n.jpg';
import capImg from '../assets/pictures/53b1cfda-5b42-4b8c-953f-fc2a39f219f8.png';
import toteImg from '../assets/pictures/totebag.jpeg';
import collectionImg from '../assets/pictures/629278256_17881300623461814_164531098086847841_n.jpeg';

const tees = { src: teesImg, alt: 'Legend Is Rare T-shirts in cream, black, and brown', background: '#d8d8d8' };
const caps = { src: capImg, alt: 'Black cap with the white embroidered Legendary Lifestyle logo', background: '#ffffff' };
const totes = { src: toteImg, alt: 'Black Carry On tote bag with the Legendary Lifestyle script logo', background: '#ffffff' };
const photography = { tshirts: tees, tshirt: tees, tees, caps, cap: caps, totebags: totes, totebag: totes, totes, tote: totes, bags: totes };
const collection = { src: collectionImg, alt: 'Legendary Lifestyle graphic tees, cap, and tote collection', background: '#ffffff' };

function findPhotography(category) {
  return [category?.slug, category?.name].map(value => {
    const key = String(value || '').toLowerCase().replace(/^demo[-_\s]*/, '').replace(/[^a-z0-9]/g, '');
    return photography[key];
  }).find(Boolean);
}

export function getCategoryPhotography(category) {
  return findPhotography(category) || collection;
}

export function getFeaturedPhotography(product) {
  const selected = findPhotography(product.category) || findPhotography(product) || collection;
  if (selected === tees) return { src: teeDetailImg, alt: 'Legend Is Rare graphic on a dark brown Legendary T-shirt' };
  return selected;
}
