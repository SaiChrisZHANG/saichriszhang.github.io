import type { ImageMetadata } from 'astro';
import roseTarts from '../assets/food/rose-topped-tarts.jpg';
import vegetables from '../assets/food/layered-vegetables.jpg';
import buns from '../assets/food/pleated-buns.jpg';
import pastry from '../assets/food/lattice-pastry.jpg';
import squash from '../assets/food/pasta-filled-squash.jpg';
import cakeRolls from '../assets/food/cake-rolls.jpg';
import flowerBread from '../assets/food/flower-shaped-bread.jpg';
import yellowTart from '../assets/food/yellow-tart.jpg';
import roastChicken from '../assets/food/roasted-chicken-platter.jpg';
import noodlesAndBowl from '../assets/food/noodles-and-herb-topped-bowl.jpg';
import greenPasta from '../assets/food/green-sauce-pasta.jpg';

export type FoodPhoto = { image: ImageMetadata; alt: string; caption?: string };

// First six retain the square-gallery brief's order and alt text.
// Sai requested all five remaining photos afterward; their alt text describes the images.
// These are clean web-size copies; original photo locations remain in the private audit.
export const foodPhotos: FoodPhoto[] = [
  { image: roseTarts, alt: 'Two small tarts topped with rose-shaped fruit slices on grey plates.' },
  { image: vegetables, alt: 'Colourful vegetable slices arranged in curved rows in a cast-iron pan.' },
  { image: buns, alt: 'Nine pleated buns arranged in a round bamboo steamer.' },
  { image: pastry, alt: 'A golden pastry parcel with a lattice pattern on a baking tray.' },
  { image: squash, alt: 'A roasted squash filled with pasta, with its lid lifted by hand.' },
  { image: cakeRolls, alt: 'Two cake rolls, one with orange topping and one with a brown-and-white pattern.' },
  { image: flowerBread, alt: 'A golden round loaf with twisted sections around a flower-shaped centre, resting on baking paper.' },
  { image: yellowTart, alt: 'A round tart with smooth yellow filling in a foil tin on a blue-and-white cloth.' },
  { image: roastChicken, alt: 'A browned roast chicken on a platter of vegetables, topped with green herb sprigs.' },
  { image: noodlesAndBowl, alt: 'A bowl of creamy sauce with meat, vegetables, and green herbs beside noodles topped with bean sprouts and a lime slice.' },
  { image: greenPasta, alt: 'A folded golden omelette beside pasta in green sauce topped with grated cheese, with a fork lifting one piece.' },
];
